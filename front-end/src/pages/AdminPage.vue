<template>
  <div class="background">
    <import-cats />
    <BreedsTable />
    <q-separator />
    <UsersTable />
  </div>
</template>

<script lang="ts">
import UsersTable from '../components/tables/UsersTable.vue';
import { defineComponent } from 'vue';
import BreedsTable from 'src/components/tables/BreedsTable.vue';
import ImportCats from 'src/components/ImportCats.vue';

export default defineComponent({
  name: 'AdminPage',
  components: { UsersTable, BreedsTable, ImportCats },
  setup() {
    return {};
  },
});
</script>

<style lang="scss" scoped>
.background {
  padding: 24px;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  @media (max-width: 575.98px) {
    padding: 0;
  }
}
</style>
