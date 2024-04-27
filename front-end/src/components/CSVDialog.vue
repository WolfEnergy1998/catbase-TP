<template>
  <q-card style="max-width: 1000px; width: 70vw;">
    <q-card-section>
      <div class="text-h5">{{ t('csvFormat') }}</div>
    </q-card-section>

    <q-separator />

    <q-card-section style="max-height: 70vh; max-width: 70vw;" class="scroll">
      <div class="text-h6">{{ t('headerOfFile') }}</div>
      <div class="text-italic q-mb-sm">{{ t('justCopy') }}</div>
      <div class="q-mb-md" style="word-break: break-word;">ID|NAME|SOURCE_DB|SOURCE_ID|REGISTRATION_NUMBER_BEFORE|REGISTRATION_NUMBER_CURRENT|ORIGIN_COUNTRY|CURRENT_COUNTRY|TITLE_BEFORE|TITLE_AFTER|BREED|COLOR_CODE|COLOR|BIRTH_DATE|GENDER|CHIP|NOTE(DESCRIPTION)|AWARDS|HEALTH_STATUS|CATTERY|MOTHER_ID|FATHER_ID|MOTHER_NAME|FATHER_NAME|MOTHER_CATTERY|FATHER_CATTERY|MOTHER_REG_NUMBER|FATHER_REG_NUMBER;</div>

      <div class="text-h6">{{ t('explanatory') }}</div>
      <div class="text-italic q-mb-sm">{{ t('rowsWithCats') }}</div>

      <template v-for="col in columns" :key="col.title">
        <div class="column-wrapper q-my-xs">
          <div class="text-bold">{{ col.title }}</div>
          <div>{{ col.description }}</div>
        </div>
        <q-separator class="separator"/>
      </template>

    </q-card-section>

    <q-card-actions align="right">
      <q-btn flat :label="t('close')" color="primary" v-close-popup />
    </q-card-actions>
  </q-card>
</template>

<script setup lang="ts">
import {useI18n} from 'vue-i18n';

const { t } = useI18n({});
const columns = [
  { title: 'ID', description: t('idDescription') },
  { title: 'NAME', description: t('nameDescription') },
  { title: 'SOURCE_DB', description: t('sourceDBDescription') },
  { title: 'SOURCE_ID', description: t('sourceIDDescription') },
  { title: 'REGISTRATION_NUMBER_BEFORE', description: t('regNumBefDescription') },
  { title: 'REGISTRATION_NUMBER_CURRENT', description: t('regNumCurrDescription') },
  { title: 'ORIGIN_COUNTRY', description: t('originCountryDescription') },
  { title: 'CURRENT_COUNTRY', description: t('currentCountryDescription') },
  { title: 'TITLE_BEFORE', description: t('titlesBeforeDescription') },
  { title: 'TITLE_AFTER', description: t('titlesAfterDescription') },
  { title: 'BREED', description: t('breedDescription') },
  { title: 'COLOR_CODE', description: t('colorCodeDescription') },
  { title: 'COLOR', description: t('colorDescription') },
  { title: 'BIRTH_DATE', description: t('birthDateDescription') },
  { title: 'GENDER', description: t('genderDescription') },
  { title: 'CHIP', description: t('chipDescription') },
  { title: 'NOTE(DESCRIPTION)', description: t('noteDescription') },
  { title: 'AWARDS', description: t('awardsDescription') },
  { title: 'HEALTH_STATUS', description: t('healthStatusDescription') },
  { title: 'CATTERY', description: t('catteryDescription') },
  { title: 'MOTHER_ID', description: t('motherIDDescription') },
  { title: 'FATHER_ID', description: t('fatherIDDescription') },
  { title: 'MOTHER_NAME', description: t('motherNameDescription') },
  { title: 'FATHER_NAME', description: t('fatherNameDescription') },
  { title: 'MOTHER_CATTERY', description: t('motherCatteryDescription') },
  { title: 'FATHER_CATTERY', description: t('fatherCatteryDescription') },
  { title: 'MOTHER_REG_NUMBER', description: t('motherRegNumDescription') },
  { title: 'FATHER_REG_NUMBER', description: t('fatherRegNumDescription') },
]
</script>

<style scoped lang="scss">
.column-wrapper {
  display: grid;
  grid-template-columns: 36% 64%;
  width: 90%;
}

.separator {
  width: 90%;
  background-color: #5697da;
  height: 2px;
}
</style>
