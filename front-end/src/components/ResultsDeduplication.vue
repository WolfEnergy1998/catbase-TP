<template>
  <div class="q-pl-md q-pt-md" style="font-size: 1.5em">{{ t('mostSimilarCatsText') }}</div>
  <div class="q-pa-md">
    <q-table
      :title="t('mostSimilarCats')"
      :rows="results.top10"
      :columns="columnsTop10"
      row-key="name"
    />
  </div>

  <template v-if="results.allDuplicates.length > 0">
    <div class="q-pl-md q-pt-md" style="font-size: 1.5em">{{ t('catsDuplicates') }}</div>
    <div class="q-pa-md">
      <q-table
        :title="t('duplicates')"
        :rows="results.allDuplicates"
        :columns="columnsAllDuplicates"
        row-key="name"
      />
    </div>
    <div class="q-pl-md q-pt-md" style="font-size: 1.5em">{{ t('finalCatText') }}</div>
  </template>
  <template v-else>
    <div class="q-pl-md q-pt-md" style="font-size: 1.5em">{{ t('finalCatNoDuplicatesText') }}</div>
  </template>

  <div class="q-pa-md">
    <q-table
      :title="t('finalCat')"
      :rows="results.finalCat"
      :columns="columnsAllDuplicates"
      row-key="name"
    />
  </div>

  <div class="q-pb-md q-pl-md flex items-center justify-center">
    <div class="q-pr-md" style="font-size: 1.7em" v-if="results.allDuplicates.length > 0">{{ t('downloadDeduplicated') }}</div>
    <div class="q-pr-md" style="font-size: 1.7em" v-else>{{ t('downloadInserted') }}</div>
    <q-btn round color="primary" size="20px" icon="download" @click="downloadFile"/>
  </div>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const { t } = useI18n({})
import {Results} from 'src/contracts';

const props = defineProps<{ results: Results }>()

const columnsTop10 = [
  { name: 'CAT_NAME', required: true, label: t('name'), align: 'left', field: 'CAT_NAME', sortable: true },
  { name: 'CAT_GENDER', required: true, label: t('gender'), align: 'left', field: 'CAT_GENDER', sortable: true },
  { name: 'CAT_BREED', required: true, label: t('breed'), align: 'left', field: 'CAT_BREED', sortable: true },
  { name: 'CAT_COLOR_CODE', required: true, label: t('colorCode'), align: 'left', field: 'CAT_COLOR_CODE', sortable: true },
  { name: 'CAT_BIRTH_DATE', required: true, label: t('birthDate'), align: 'left', field: 'CAT_BIRTH_DATE', sortable: true },
  { name: 'CAT_CATTERY', required: true, label: t('cattery'), align: 'left', field: 'CAT_CATTERY', sortable: true },
  { name: 'CAT_DAMERAU_LEVENSHTEIN', required: true, label: t('damerauLevenshtein'), align: 'left', field: 'CAT_DAMERAU_LEVENSHTEIN', sortable: true  },
  { name: 'CAT_JACCARD', required: true, label: t('jaccard'), align: 'left', field: 'CAT_JACCARD', sortable: true  },
  { name: 'CAT_RATCLIFF_OBERSHELP', required: true, label: t('ratcliffObershelp'), align: 'left', field: 'CAT_RATCLIFF_OBERSHELP', sortable: true },
]

const columnsAllDuplicates = [
  { name: 'NAME', required: true, label: t('name'), align: 'left', field: 'NAME', sortable: true },
  { name: 'GENDER', required: true, label: t('gender'), align: 'left', field: 'GENDER', sortable: true },
  { name: 'BREED', required: true, label: t('breed'), align: 'left', field: 'BREED', sortable: true },
  { name: 'COLOR_CODE', required: true, label: t('colorCode'), align: 'left', field: 'COLOR_CODE', sortable: true },
  { name: 'BIRTH_DATE', required: true, label: t('birthDate'), align: 'left', field: 'BIRTH_DATE', sortable: true },
  { name: 'CATTERY', required: true, label: t('cattery'), align: 'left', field: 'CATTERY', sortable: true },
]

const downloadFile = () => {
  const link = document.createElement('a');
  link.href = `data:text/csv;base64,${props.results.finalDB}`;
  link.download = 'deduplicated_file.csv';
  link.click();
}
</script>

<style scoped lang="scss">

</style>
