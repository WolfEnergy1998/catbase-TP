<template>
  <div class="q-pb-md">
    <h4>{{ $t('breeds') }}</h4>
    <div style="text-align: right;">
      <q-btn
        icon="add"
        color="primary"
        :label="$t('createBreed')"
        @click="newBreed"
      />
    </div>
  </div>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="name"
    class="table-breed"
    virtual-scroll
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          :class="'column-' + col.name"
        >
          <div class="filter">
            <label>{{ col.label }}</label>
            <i
              class="q-icon notranslate material-icons q-table__sort-icon q-table__sort-icon--left"
              aria-hidden="true"
              role="presentation"
              >arrow_upward</i
            >
            <q-input
              v-model="filters.code"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'code'"
            />
          </div>
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body-cell-action="props">
      <q-td :props="props">
        <q-btn
          color="green"
          icon-right="edit"
          no-caps
          flat
          dense
          @click="editBreed(rows.indexOf(props.row))"
        />
        <q-btn
          color="negative"
          icon-right="delete"
          no-caps
          flat
          dense
          @click="deleteBreed(rows.indexOf(props.row))"
        />
      </q-td>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps } from 'quasar';
import { Breed } from 'src/contracts';
import { cacheStore } from 'src/stores/cache-store';
import { userAuthStore } from 'src/stores/auth-store';
import BreedDialog from 'src/components/BreedDialog.vue';
import { BreedService } from 'src/services';

export default defineComponent({
  name: 'UsersTable',

  setup() {
    const filters = ref({ code: '' });
    return {
      cacheStore: cacheStore(),
      userAuthStore: userAuthStore(),
      filters,
      rows: ref([] as Breed[]),
      selectedBreed: ref({} as Breed),
    };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();
    this.rows = this.cacheStore.breeds;
  },
  methods: {
    filter() {
      this.rows = this.cacheStore.breeds.filter((breed) =>
        breed.code
          .toLowerCase()
          .includes(
            this.filters.code == null ? '' : this.filters.code.toLowerCase()
          )
      );
    },
    editBreed: function (index: number) {
      this.selectedBreed = this.rows[index];
      this.openDialog();
    },
    newBreed: function () {
      this.selectedBreed = {} as Breed;
      this.openDialog();
    },
    openDialog: function () {
      this.$q
        .dialog({
          component: BreedDialog,
          componentProps: {
            breed: this.selectedBreed,
          },
        })
        .onOk(async ({ breed }) => {
          let message = {} as any;
          if (breed.id !== undefined) {
            message = await BreedService.update(this.selectedBreed);
            this.rows[this.rows.indexOf(this.selectedBreed)] = breed;
          } else {
            message = await BreedService.create(this.selectedBreed);
            await this.cacheStore.loadData();
            this.rows = this.cacheStore.breeds;
          }
          this.$q.notify({
            icon: 'check',
            message: message?.message,
            color: 'positive',
          });
        });
    },
    deleteBreed: function (index: number) {
      this.$q
        .dialog({
          title: this.$t('confirm'),
          message:
            this.$t('delBreed'),
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          let message = await BreedService.delete(this.rows[index]);
          this.$q.notify({
            icon: 'check',
            message: message?.message,
            color: 'positive',
          });
          this.rows.splice(index, 1);
        });
    },
  },
  computed: {
    columns(): QTableProps['columns'] {
      return [
        {
          name: 'id',
          required: true,
          label: 'ID',
          align: 'left',
          field: (row: Breed) => row.id,
          sortable: true,
          classes: 'column-id',
        },
        {
          name: 'code',
          required: true,
          label: this.$t('code'),
          align: 'left',
          field: (row: Breed) => row.code,
          sortable: true,
          classes: 'column-code',
        },
        {
          name: 'action',
          label: this.$t('action'),
          field: 'action',
          classes: 'column-actions',
          align: 'center',
        },
      ]
    }
  },
});
</script>

<style lang="scss">
.table-breed td.column-id,
.table-breed th.column-id {
  width: 50px;
}
.table-breed td.column-actions,
.table-breed th.column-actions {
  width: 100px;
}
</style>
