<template>
  <div class="import-container">
    <q-file
      clearable
      standout="bg-secondary text-grey-8"
      v-model="importFile"
      class="q-mr-sm file-field"
      v-if="userAuthStore.isAdmin || userAuthStore.isSuperAdmin"
      :label="$t('importCSV')"
      :filter="checkFileType"
      @rejected="onRejected"
    >
      <template v-slot:file="{ file }">
        <div class="text-primary">
          {{ file.name }}
        </div>
      </template>
    </q-file>
    <q-btn
      @click="onImportFile"
      class="import-btn"
      color="green"
      :disable="!importFile"
    >
      {{ $t('importCats')}}
    </q-btn>
  </div>
</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {userAuthStore} from 'stores/auth-store';
import CatService from 'src/services/cat/CatService';

export default defineComponent({
  name: 'ImportCats',

  setup() {
    const authStore = userAuthStore();
    return {
      userAuthStore: authStore,
      importFile: ref(null),
      checkFileType(files: any[]) {
        return files.filter((file: { type: string; }) => file.type === 'text/csv')
      },
    }
  },

  methods: {
    onImportFile() {
      if(this.importFile){
        let reader = new FileReader();
        reader.readAsArrayBuffer(this.importFile)
        reader.addEventListener('load', async (e) => {
          const arrayBuffer = e.target?.result;
          const array = new Uint8Array(<ArrayBuffer>arrayBuffer);
          const response = await CatService.importCat(array);
          if (response?.message === 'Cats imported'){
            this.importFile = null;
            this.$q.notify({
              type: 'positive',
              message: this.$t('importSuccess'),
            })
          }
          else {
            this.$q.notify({
              type: 'negative',
              message: this.$t('importFailed'),
            })
          }
        })
      }
    },
    onRejected() {
      this.$q.notify({
        type: 'negative',
        message: this.$t('wrongType'),
      })
    }
  }
});
</script>

<style lang="scss" scoped>
.import-container {
  display: flex;
  justify-content: left;
  padding-top: 21.22px;
}

.file-field {
  min-width: 192px;
}

.import-btn {
  margin-left: 10px;
}
</style>
