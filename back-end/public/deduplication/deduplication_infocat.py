import datetime
import shutil
import string
import sys
import time
from os import listdir
from os.path import isfile, join, exists

import pandas as pd
from itertools import combinations
import textdistance as td

dtypes = {'SOURCE_ID': 'Int64', 'MOTHER_ID': 'Int64', 'FATHER_ID': 'Int64'}
dtypes_swe_no = {'SWEDEN_ID': 'Int64', 'NORWAY_ID': 'Int64'}


def clean_id(x):
    if str(x).count('\r\n') != 0:
        x = x.replace('\r\n', '')
    if str(x).count('\n') != 0:
        x = x.replace('\n', '')
    if str(x).count('"') != 0:
        x = x.replace('"', '')
    if len(str(x)) == 0:
        return ''
    return x


def shift_id(cat_id, max_id):
    if pd.isna(cat_id):
        return cat_id

    return cat_id + max_id


def load_data(filenames, single_cat_filename):
    final_df = pd.DataFrame(columns=['ID', 'NAME', 'SOURCE_DB', 'SOURCE_ID', 'REGISTRATION_NUMBER_BEFORE',
                                     'REGISTRATION_NUMBER_CURRENT', 'ORIGIN_COUNTRY', 'CURRENT_COUNTRY',
                                     'TITLE_BEFORE', 'TITLE_AFTER', 'BREED', 'COLOR_CODE', 'COLOR', 'BIRTH_DATE',
                                     'GENDER', 'CHIP', 'NOTE(DESCRIPTION)', 'AWARDS', 'HEALTH_STATUS', 'CATTERY',
                                     'MOTHER_ID', 'FATHER_ID', 'MOTHER_NAME', 'FATHER_NAME', 'MOTHER_CATTERY',
                                     'FATHER_CATTERY', 'MOTHER_REG_NUMBER', 'FATHER_REG_NUMBER'])
    df_single_cat = pd.read_csv(single_cat_filename, encoding="utf-8", delimiter='|', header=0, lineterminator='\n',
                                dtype=dtypes)
    max_id = 0
    for filename in filenames:
        df = pd.read_csv(filename, encoding="utf-8", delimiter='|', header=0, lineterminator='\n', dtype=dtypes)
        df['ID'] = df['ID'].apply(lambda x: clean_id(x))
        df = df[df['ID'].astype(bool)]
        df['ID'] = df['ID'].apply(lambda x: shift_id(x, max_id))

        df['MOTHER_ID'] = df['MOTHER_ID'].apply(lambda x: clean_id(x))
        df['MOTHER_ID'] = df['MOTHER_ID'].apply(lambda x: shift_id(x, max_id))
        df['FATHER_ID'] = df['FATHER_ID'].apply(lambda x: clean_id(x))
        df['FATHER_ID'] = df['FATHER_ID'].apply(lambda x: shift_id(x, max_id))
        final_df = pd.concat([final_df, df], ignore_index=True)
        max_id = final_df['ID'].max()

    id_to_index = {}
    for index, cat in final_df.iterrows():
        id_to_index[cat['ID']] = index

    return final_df, df_single_cat, id_to_index


def blocking(load_df, df_single_cat):
    pairs = []

    cattery = df_single_cat.iloc[0]['CATTERY']
    breed = df_single_cat.iloc[0]['BREED']
    gender = df_single_cat.iloc[0]['GENDER']
    single_cat_id = df_single_cat.iloc[0]['ID']
    if pd.notna(cattery):
        block = load_df.loc[(load_df['CATTERY'] == cattery) &
                            (load_df['BREED'] == breed) &
                            (load_df['GENDER'] == gender)]
        block_no_cattery = load_df.loc[(load_df['CATTERY'].isna()) &
                                       (load_df['BREED'] == breed) &
                                       (load_df['GENDER'] == gender)]
        block = pd.concat([block, block_no_cattery], ignore_index=True)
    else:
        block = load_df.loc[(load_df['BREED'] == breed) &
                            (load_df['GENDER'] == gender)]

    if len(block.index) < 1:
        block = load_df.loc[(load_df['BREED'] == breed) &
                            (load_df['GENDER'] == gender)]
    if len(block.index) < 1:
        block = load_df.loc[load_df['GENDER'] == gender]

    for index, cat in block.iterrows():
        pairs.append((single_cat_id, cat['ID']))
    size = len(pairs)
    return pairs, size


def clean_data(text, cattery):
    if isinstance(cattery, str):
        cattery = cattery.lower().strip()
        text = text.lower().strip()
        if text.startswith(cattery):
            text = text[len(cattery):]
        elif text.endswith(cattery):
            text = text[:-len(cattery)]
    text = ''.join([ele for ele in text if ele not in string.punctuation])
    text = text.lower().strip()
    return text


def cat_similarity(cat_1_name, cat_2_name, cat_1_cattery, cat_2_cattery):
    if isinstance(cat_1_name, str) and isinstance(cat_2_name, str):
        name_1 = clean_data(cat_1_name, cat_1_cattery)
        name_2 = clean_data(cat_2_name, cat_2_cattery)
        return {
            # 'LEVENSHTEIN': td.levenshtein.normalized_similarity(name_1, name_2),
            'DAMERAU_LEVENSHTEIN': td.damerau_levenshtein.normalized_similarity(name_1, name_2),
            # 'COSINE': td.cosine(name_1, name_2),
            # 'HAMMING': td.hamming.normalized_similarity(name_1, name_2),
            # 'JARO': td.jaro(name_1, name_2),
            # 'JARO_WINKLER': td.jaro_winkler(name_1, name_2),
            'JACCARD': td.jaccard(name_1, name_2),
            # 'SORENSEN': td.sorensen(name_1, name_2),
            # 'OVERLAP': td.overlap(name_1, name_2),
            'RATCLIFF_OBERSHELP': td.ratcliff_obershelp(name_1, name_2)
        }
    else:
        return {'DAMERAU_LEVENSHTEIN': 0, 'JACCARD': 0, 'RATCLIFF_OBERSHELP': 0}


def similarity_edit_distance(pairs, cats, df_single_cat, size, id_to_index, folder_name):
    dictionary_list = []
    output_list = []
    counter = 0
    cat_1 = df_single_cat.iloc[0]
    for pair in pairs:
        cat_2_index = id_to_index[pair[1]]
        cat_2 = cats.iloc[cat_2_index]
        similarity_cat = cat_similarity(cat_1['NAME'], cat_2['NAME'], cat_1['CATTERY'], cat_2['CATTERY'])
        similarity_mother = cat_similarity(cat_1['MOTHER_NAME'], cat_2['MOTHER_NAME'],
                                           cat_1['MOTHER_CATTERY'], cat_2['MOTHER_CATTERY'])
        similarity_father = cat_similarity(cat_1['FATHER_NAME'], cat_2['FATHER_NAME'],
                                           cat_1['FATHER_CATTERY'], cat_2['FATHER_CATTERY'])
        dictionary_list.append({
            'CAT_ID_1': cat_1['ID'], 'CAT_NAME_1': cat_1['NAME'],
            'CAT_ID_2': cat_2['ID'], 'CAT_NAME_2': cat_2['NAME'],
            'CAT_DAMERAU_LEVENSHTEIN': similarity_cat['DAMERAU_LEVENSHTEIN'], 'CAT_JACCARD': similarity_cat['JACCARD'],
            'CAT_RATCLIFF_OBERSHELP': similarity_cat['RATCLIFF_OBERSHELP'],

            'MOTHER_ID_1': cat_1['MOTHER_ID'], 'MOTHER_ID_2': cat_2['MOTHER_ID'],
            'MOTHER_DAMERAU_LEVENSHTEIN': similarity_mother['DAMERAU_LEVENSHTEIN'],
            'MOTHER_JACCARD': similarity_mother['JACCARD'],
            'MOTHER_RATCLIFF_OBERSHELP': similarity_mother['RATCLIFF_OBERSHELP'],

            'FATHER_ID_1': cat_1['FATHER_ID'], 'FATHER_ID_2': cat_2['FATHER_ID'],
            'FATHER_DAMERAU_LEVENSHTEIN': similarity_father['DAMERAU_LEVENSHTEIN'],
            'FATHER_JACCARD': similarity_father['JACCARD'],
            'FATHER_RATCLIFF_OBERSHELP': similarity_father['RATCLIFF_OBERSHELP']
        })

        output_list.append({
            'CAT_NAME': cat_2['NAME'], 'CAT_GENDER': cat_2['GENDER'], 'CAT_BREED': cat_2['BREED'],
            'CAT_COLOR_CODE': cat_2['COLOR_CODE'], 'CAT_BIRTH_DATE': cat_2['BIRTH_DATE'],
            'CAT_CATTERY': cat_2['CATTERY'], 'CAT_DAMERAU_LEVENSHTEIN': similarity_cat['DAMERAU_LEVENSHTEIN'],
            'CAT_JACCARD': similarity_cat['JACCARD'], 'CAT_RATCLIFF_OBERSHELP': similarity_cat['RATCLIFF_OBERSHELP'],
        })
        counter += 1
        if counter % 1000 == 0:
            print(f'matching counter: {counter}/{size}')

    df_graphs = pd.DataFrame.from_dict(dictionary_list)
    df_output = pd.DataFrame.from_dict(output_list)
    if len(output_list) > 0:
        df_output = df_output.sort_values(by=['CAT_DAMERAU_LEVENSHTEIN', 'CAT_JACCARD', 'CAT_RATCLIFF_OBERSHELP'],
                                          ascending=[False, False, False])
    df_output = df_output.head(10)
    df_output.to_csv(f'public/deduplication/outputs/{folder_name}/top_10_similarities.csv', encoding="utf-8", index=False, sep=';', lineterminator='\n', header=True)
    # df_output.to_csv(f'outputs/{folder_name}/top_10_similarities.csv', encoding="utf-8", index=False, sep=';', lineterminator='\n', header=True)
    return df_graphs


def compare_dates(date_1, date_2):
    split_1 = date_1.split('-')
    switch_1 = f"{split_1[0]}-{split_1[2]}-{split_1[1]}"
    return date_1 == date_2 or switch_1 == date_2


def offspring_validation(df_offspring):
    if df_offspring is not None and len(df_offspring.index) > 1:
        sum_damerau = 0
        sum_jaccard = 0
        sum_ratcliff = 0
        num_of_pairs = 0
        cat_names = []
        all_pairs = list(combinations(df_offspring['ID'], 2))
        for pair_ids in all_pairs:
            cat_1 = df_offspring.loc[df_offspring['ID'] == pair_ids[0]].iloc[0]
            cat_2 = df_offspring.loc[df_offspring['ID'] == pair_ids[1]].iloc[0]
            if cat_1['NAME'] not in cat_names:
                cat_names.append(cat_1['NAME'])
            if cat_2['NAME'] not in cat_names:
                cat_names.append(cat_2['NAME'])
            similarity = cat_similarity(cat_1['NAME'], cat_2['NAME'], cat_1['CATTERY'], cat_2['CATTERY'])
            sum_damerau += similarity['DAMERAU_LEVENSHTEIN']
            sum_jaccard += similarity['JACCARD']
            sum_ratcliff += similarity['RATCLIFF_OBERSHELP']
            num_of_pairs += 1
        if sum_damerau / num_of_pairs > 0.8 and sum_jaccard / num_of_pairs > 0.7 and sum_ratcliff / num_of_pairs > 0.8:
            return True

    return False


def duplicates_detection(df_similarities, df_cats, df_single_cat, id_to_index):
    duplicates = []
    cat_names_dict = {}
    cat_dates_dict = {}
    for index, cat in df_cats.iterrows():
        cat_names_dict[cat['ID']] = cat['NAME']
        cat_dates_dict[cat['ID']] = cat['BIRTH_DATE']

    single_cat = df_single_cat.iloc[0]
    for index, pair in df_similarities.iterrows():
        if pair['CAT_DAMERAU_LEVENSHTEIN'] < 0.94 or pair['CAT_JACCARD'] < 0.94 or \
                pair['CAT_RATCLIFF_OBERSHELP'] < 0.94:
            continue

        cat_date_1 = single_cat['BIRTH_DATE']
        cat_date_2 = cat_dates_dict[pair['CAT_ID_2']]
        if pd.notna(cat_date_1) and pd.notna(cat_date_2) and not compare_dates(cat_date_1, cat_date_2):
            continue

        if pd.notna(pair['MOTHER_ID_1']) and pd.notna(pair['MOTHER_ID_2']):
            if pair['MOTHER_DAMERAU_LEVENSHTEIN'] < 0.94 or pair['MOTHER_JACCARD'] < 0.94 or \
                    pair['MOTHER_RATCLIFF_OBERSHELP'] < 0.94:
                continue

        if pd.notna(pair['FATHER_ID_1']) and pd.notna(pair['FATHER_ID_2']):
            if pair['FATHER_DAMERAU_LEVENSHTEIN'] < 0.94 or pair['FATHER_JACCARD'] < 0.94 or \
                    pair['FATHER_RATCLIFF_OBERSHELP'] < 0.94:
                continue

        offspring_date = None
        if pd.notna(cat_date_1):
            offspring_date = cat_date_1
        elif pd.notna(cat_date_2):
            offspring_date = cat_date_2

        if pair['CAT_DAMERAU_LEVENSHTEIN'] == 1 or pair['CAT_JACCARD'] == 1 or pair['CAT_RATCLIFF_OBERSHELP'] == 1:
            duplicates.append(pair['CAT_ID_2'])
            continue

        df_offspring_2 = None
        if pd.notna(pair['MOTHER_ID_2']) and pd.notna(pair['FATHER_ID_2']):
            cat_index_2 = id_to_index[pair['CAT_ID_2']]
            cat_2 = df_cats.iloc[cat_index_2]
            df_offspring_2 = df_cats.loc[
                (df_cats['MOTHER_ID'] == pair['MOTHER_ID_2']) & (df_cats['FATHER_ID'] == pair['FATHER_ID_2']) &
                ((pd.isna(df_cats['BIRTH_DATE'])) | (df_cats['BIRTH_DATE'] == offspring_date)) &
                (df_cats['SOURCE_DB'] == cat_2['SOURCE_DB'])]

        is_similar = offspring_validation(df_offspring_2)
        if is_similar:
            continue

        duplicates.append(pair['CAT_ID_2'])
    return duplicates


def deduplication(duplicates, df_cats, df_single_cat, id_to_index, folder_name, databases_list):
    columns = ['ID', 'NAME', 'SOURCE_DB', 'SOURCE_ID', 'REGISTRATION_NUMBER_BEFORE', 'REGISTRATION_NUMBER_CURRENT',
               'ORIGIN_COUNTRY', 'CURRENT_COUNTRY', 'TITLE_BEFORE', 'TITLE_AFTER', 'BREED', 'COLOR_CODE', 'COLOR',
               'BIRTH_DATE', 'GENDER', 'CHIP', 'NOTE(DESCRIPTION)', 'AWARDS', 'HEALTH_STATUS', 'CATTERY', 'MOTHER_ID',
               'FATHER_ID', 'MOTHER_NAME', 'FATHER_NAME', 'MOTHER_CATTERY', 'FATHER_CATTERY', 'MOTHER_REG_NUMBER',
               'FATHER_REG_NUMBER']

    if len(duplicates) < 1:
        new_id = df_cats['ID'].max() + 1
        final_cat = df_single_cat.iloc[0]
        final_cat['ID'] = new_id
        df_deleted_cats = pd.DataFrame(columns=['NAME', 'BREED', 'COLOR_CODE', 'BIRTH_DATE', 'GENDER', 'CATTERY'])
        df_deleted_cats.to_csv(f'public/deduplication/outputs/{folder_name}/all_duplicated_cats.csv', encoding="utf-8", index=False, sep=';', header=True)
        # df_deleted_cats.to_csv(f'outputs/{folder_name}/all_duplicated_cats.csv', encoding="utf-8", index=False, sep=';', header=True)
        df_final_cat = pd.DataFrame.from_dict([{'NAME': final_cat['NAME'], 'GENDER': final_cat['GENDER'],
                                                'BREED': final_cat['BREED'], 'COLOR_CODE': final_cat['COLOR_CODE'],
                                                'BIRTH_DATE': final_cat['BIRTH_DATE'],
                                                'CATTERY': final_cat['CATTERY']}])
        # df_final_cat.to_csv(f'outputs/{folder_name}/final_cat.csv', encoding="utf-8", index=False, sep=';', header=True)
        df_final_cat.to_csv(f'public/deduplication/outputs/{folder_name}/final_cat.csv', encoding="utf-8", index=False, sep=';', header=True)

        df_cats.loc[len(df_cats)] = final_cat
        # df_cats.to_csv(f'outputs/{folder_name}/FINAL_DB.csv', encoding="utf-8", index=False, sep=';', header=True)
        df_cats.to_csv(f'public/deduplication/outputs/{folder_name}/FINAL_DB.csv', encoding="utf-8", index=False, sep=';', header=True)
        return df_cats

    dict_list_deleted_cats = []
    all_source_dbs = df_cats['SOURCE_DB'].unique()
    for source_db in all_source_dbs:
        if source_db not in databases_list:
            databases_list = all_source_dbs
            break

    if len(databases_list) > 0:
        df_cats['SOURCE_DB'] = pd.Categorical(df_cats['SOURCE_DB'], databases_list)
    else:
        df_cats['SOURCE_DB'] = pd.Categorical(df_cats['SOURCE_DB'], [
            'SVERAK', 'Finland', 'Norway', 'German Database', 'TOP-CAT', 'DB Polska', 'FFS_SK', 'sibcat', 'pawpeds'])
    indexes_to_delete = []
    df_group = df_cats[df_cats['ID'].isin(duplicates)]
    df_group.sort_values('SOURCE_DB')

    final_cat = {}
    temp_cat = df_group.iloc[0]
    single_cat = df_single_cat.iloc[0]
    updated_columns = []
    for column in columns:
        final_cat[column] = temp_cat[column]
        if pd.isna(final_cat[column]) and pd.notna(single_cat[column]) \
                and column not in ['ID', 'MOTHER_ID', 'FATHER_ID']:
            final_cat[column] = single_cat[column]
            updated_columns.append(column)
    final_cat_index = id_to_index[final_cat['ID']]

    for index, cat in df_group.iterrows():
        if index == final_cat_index:
            continue
        for column in columns:
            if pd.isna(final_cat[column]) and pd.notna(cat[column]):
                final_cat[column] = cat[column]
                updated_columns.append(column)

    for cat_id in duplicates:
        if cat_id in id_to_index.keys() and id_to_index[cat_id] < len(df_cats.index):
            deleted_cat = df_cats.iloc[id_to_index[cat_id]]
            dict_list_deleted_cats.append({
                'NAME': deleted_cat['NAME'], 'BREED': deleted_cat['BREED'],
                'BIRTH_DATE': deleted_cat['BIRTH_DATE'], 'COLOR_CODE': deleted_cat['COLOR_CODE'],
                'GENDER': deleted_cat['GENDER'], 'CATTERY': deleted_cat['CATTERY'],
            })

        if cat_id == final_cat['ID']:
            continue

        if id_to_index[cat_id] not in indexes_to_delete:
            indexes_to_delete.append(id_to_index[cat_id])

    for column in updated_columns:
        df_cats.at[final_cat_index, column] = final_cat[column]

    df_cats.loc[df_cats['MOTHER_ID'].isin(duplicates), 'MOTHER_ID'] = final_cat['ID']
    df_cats.loc[df_cats['FATHER_ID'].isin(duplicates), 'FATHER_ID'] = final_cat['ID']
    df_cats.loc[df_cats['MOTHER_ID'].isin(duplicates), 'MOTHER_NAME'] = final_cat['NAME']
    df_cats.loc[df_cats['FATHER_ID'].isin(duplicates), 'FATHER_NAME'] = final_cat['NAME']
    df_cats.loc[df_cats['MOTHER_ID'].isin(duplicates), 'MOTHER_CATTERY'] = final_cat['CATTERY']
    df_cats.loc[df_cats['FATHER_ID'].isin(duplicates), 'FATHER_CATTERY'] = final_cat['CATTERY']
    df_cats.loc[df_cats['MOTHER_ID'].isin(duplicates), 'MOTHER_REG_NUMBER'] = final_cat['REGISTRATION_NUMBER_CURRENT']
    df_cats.loc[df_cats['FATHER_ID'].isin(duplicates), 'FATHER_REG_NUMBER'] = final_cat['REGISTRATION_NUMBER_CURRENT']

    df_cats = df_cats.drop(indexes_to_delete)
    df_deleted_cats = pd.DataFrame.from_dict(dict_list_deleted_cats)
    # df_deleted_cats.to_csv(f'outputs/{folder_name}/all_duplicated_cats.csv', encoding="utf-8", index=False, sep=';', header=True)
    df_deleted_cats.to_csv(f'public/deduplication/outputs/{folder_name}/all_duplicated_cats.csv', encoding="utf-8", index=False, sep=';', header=True)
    df_final_cat = pd.DataFrame.from_dict([{'NAME': final_cat['NAME'], 'GENDER': final_cat['GENDER'],
                                            'BREED': final_cat['BREED'], 'COLOR_CODE': final_cat['COLOR_CODE'],
                                            'BIRTH_DATE': final_cat['BIRTH_DATE'], 'CATTERY': final_cat['CATTERY']}])
    # df_final_cat.to_csv(f'outputs/{folder_name}/final_cat.csv', encoding="utf-8", index=False, sep=';', header=True)
    df_final_cat.to_csv(f'public/deduplication/outputs/{folder_name}/final_cat.csv', encoding="utf-8", index=False, sep=';', header=True)
    # df_cats.to_csv(f'outputs/{folder_name}/FINAL_DB.csv', encoding="utf-8", index=False, sep=';', header=True)
    df_cats.to_csv(f'public/deduplication/outputs/{folder_name}/FINAL_DB.csv', encoding="utf-8", index=False, sep=';', header=True)
    return df_cats


def deduplication_whole(filenames, single_cat_filename, folder_name, databases_list):
    start = datetime.datetime.now()
    df_cats, df_single_cat, id_to_index = load_data(filenames, single_cat_filename)
    pairs, size = blocking(df_cats, df_single_cat)
    df_similarities = similarity_edit_distance(pairs, df_cats, df_single_cat, size, id_to_index, folder_name)
    duplicates = duplicates_detection(df_similarities, df_cats, df_single_cat, id_to_index)
    deduplication(duplicates, df_cats, df_single_cat, id_to_index, folder_name, databases_list)
    end = datetime.datetime.now()
    print(f'Whole Time: {end - start}')


def high_similarity():
    df_similarities = pd.read_csv(f'similarities/edit_distance_pairs.csv', encoding="utf-8", delimiter=';',
                                  lineterminator='\n', header=0)

    algorithms = ['CAT_DAMERAU_LEVENSHTEIN', 'CAT_JACCARD', 'CAT_RATCLIFF_OBERSHELP']
    for algorithm in algorithms:
        df_single = df_similarities.loc[df_similarities[algorithm] > 0.5][[
            'CAT_ID_1', 'CAT_NAME_1', 'CAT_ID_2', 'CAT_NAME_2', algorithm
        ]]
        df_single.to_excel(f'top_0_9/{algorithm}_infocat.xlsx')


def check_directories(folder_name):
    count = 0
    while not exists(f'./public/deduplication/inputs/{folder_name}'):
        if count > 4:
            return
        time.sleep(0.5)
        count += 1

    count = 0
    while not exists(f'./public/deduplication/outputs/{folder_name}'):
        if count > 4:
            return
        time.sleep(0.5)
        count += 1


def main():
    if len(sys.argv) > 1:
        folder_name = sys.argv[1]
        databases_string = ''
        if len(sys.argv) > 2:
            databases_string = sys.argv[2]
        databases_list = databases_string.split('/|/')
        check_directories(folder_name)

        # folder_path = f'inputs/{folder_name}'
        folder_path = f'./public/deduplication/inputs/{folder_name}'
        files = [f for f in listdir(folder_path) if isfile(join(folder_path, f))]

        single_cat_filename = [f'public/deduplication/inputs/{folder_name}/{f}' for f in files if 'singleCat' in f][0]
        filenames = [f'public/deduplication/inputs/{folder_name}/{f}' for f in files if 'singleCat' not in f]
        # single_cat_filename = [f'inputs/{folder_name}/{f}' for f in files if 'singleCat' in f][0]
        # filenames = [f'inputs/{folder_name}/{f}' for f in files if 'singleCat' not in f]
        deduplication_whole(filenames, single_cat_filename, folder_name, databases_list)
        shutil.rmtree(folder_path)


main()
