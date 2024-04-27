<template>
  <q-dialog v-model="dialog">
    <c-s-v-dialog/>
  </q-dialog>

  <div class="row">
    <div class="col">
      <div class="file-input-wrapper">
        <q-file
          clearable
          multiple
          standout="bg-secondary text-grey-8"
          v-model="allCatsFiles"
          class="q-mr-sm file-field"
          v-if="authStore.isAdmin || authStore.isSuperAdmin"
          :label="t('catsDatabases')"
          :filter="checkFileType"
          @rejected="onRejected"
        />

        <q-icon name="help" color="primary" size="24px" class="dialog-button" @click="dialog = true;"/>
      </div>

      <div class="file-input-wrapper">
        <q-file
          clearable
          standout="bg-secondary text-grey-8"
          v-model="singleCatFile"
          class="q-mr-sm file-field"
          v-if="authStore.isAdmin || authStore.isSuperAdmin"
          :label="t('singleDatabase')"
          :filter="checkFileType"
          @rejected="onRejected"
        />

        <q-icon name="help" color="primary" size="24px" class="dialog-button" @click="dialog = true;"/>
      </div>

    </div>

    <div style="margin-top: 10px;">
      <DraggableList @update-databases-list="updateDatabasesList"/>
    </div>
  </div>

  <q-btn
    @click="onImportFile"
    class="import-btn"
    color="green"
    :disable="!allCatsFiles || !singleCatFile"
  >
    {{ t('runDeduplication') }}
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { userAuthStore } from 'stores/auth-store';
import CatService from 'src/services/cat/CatService';
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'
import DraggableList from 'components/DraggableList.vue';
import CSVDialog from 'components/CSVDialog.vue';

const { t } = useI18n({});
const $q = useQuasar();
const authStore = userAuthStore();
const emit = defineEmits(['showResults']);
let dialog = ref(false);

let databases = ref<{ id:string, text: string }[] | null>(null);
let databasesString = ref('');
const allCatsFiles = ref(null);
const singleCatFile = ref(null);

let singleCatUploaded = false;
let catsDatabasesUploaded = false;

const checkFileType = (files: any[]) => {
  return files.filter((file: { type: string; }) => file.type === 'text/csv')
}

const onImportFile = async () => {
  let count = 0;
  if(allCatsFiles.value && singleCatFile.value){
    $q.loading.show({
      message: t('uploadFiles'),
      delay: 400 // ms
    });
    let numOfFiles = (allCatsFiles.value as File[]).length;
    const timestamp = (new Date().getTime()).toString();

    const reader = new FileReader();
    reader.readAsDataURL(singleCatFile.value);
    reader.onload = async () => {
      const response = await CatService.importDeduplication(reader.result, 'singleCat', timestamp);
      if (response?.message === 'File saved'){
        singleCatFile.value = null;
        singleCatUploaded = true;
        $q.notify({
          type: 'positive',
          message: t('uploadSingleSuccess'),
        });
        await startDeduplication(timestamp);
      }
      else {
        $q.notify({
          type: 'negative',
          message: t('uploadSingleFailed'),
        });
      }
    };

    for (const catsFile of allCatsFiles.value as File[]) {
      const reader = new FileReader();
      reader.readAsDataURL(catsFile);
      reader.onload = async () => {
        const response = await CatService.importDeduplication(reader.result, 'allCats', timestamp);
        if (response?.message === 'File saved'){
          count += 1;
          if (count === numOfFiles) {
            allCatsFiles.value = null;
            catsDatabasesUploaded = true;
            $q.notify({
              type: 'positive',
              message: t('uploadCatsSuccess'),
            });
            await startDeduplication(timestamp);
          }
        }
        else {
          $q.notify({
            type: 'negative',
            message: t('uploadCatsFailed'),
          });
        }
      };
    }
  }
}

const onRejected = () => {
  $q.notify({
    type: 'negative',
    message: t('wrongType'),
  })
}

const startDeduplication = async (timestamp: string) => {
  if (singleCatUploaded && catsDatabasesUploaded) {
    singleCatUploaded = false;
    catsDatabasesUploaded = false;
    $q.loading.show({
      message: t('findingDuplicates')
    });
    const response = await CatService.runDeduplication(timestamp, databasesString.value);
    $q.loading.hide();
    if (response?.message === 'Script finished'){
      $q.notify({
        type: 'positive',
        message: t('scriptFinished'),
      });
      emit('showResults', response.results);
    }
    else {
      $q.notify({
        type: 'negative',
        message: t('scriptFailed'),
      });
    }
  }
}

const updateDatabasesList = (databasesListArg: { id:string, text: string }[]) => {
  databases.value = databasesListArg;
  databasesString.value = '';
  for (const database of databases.value) {
    databasesString.value += database.text + '/|/';
  }
  databasesString.value = databasesString.value.substring(0, databasesString.value.length - 3);
}
</script>

<style scoped lang="scss">
.file-field {
  width: 100%;
  padding-top: 20px;
  :deep(.q-field__native) {
    color: $primary;
  }
}

.import-btn {
  margin-top: 10px;
  width: 100%;
}

.file-input-wrapper {
  display: flex;
  align-items: center;
}

.dialog-button {
  padding-top: 20px;
}

.dialog-button:hover {
  cursor: pointer;
  color: #4e98e1 !important;
}
</style>
