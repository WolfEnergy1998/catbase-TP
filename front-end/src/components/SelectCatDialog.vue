<template>
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin select-cat-dialog">
      <q-card-section class="q-dialog__title flex justify-between">
        <p>{{ $t('selectCat') }}</p>
        <q-icon name="close" style="cursor: pointer" @click="onCancelClick" />
      </q-card-section>
      <q-card-section>
        <p class="q-ma-none">{{ $t('pressEnter') }}</p>
        <q-table
          ref="tableRef"
          :rows="rowsCats"
          :columns="columnsCats"
          row-key="id"
          v-model:pagination="pagination"
          :loading="loading"
          binary-state-sort
          @request="onRequest"
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
                    v-model="findData.id"
                    @click.stop=""
                    @clear="onRequest"
                    @keyup.enter="onRequest"
                    dense
                    standout="grey-5"
                    clearable
                    v-if="col.name === 'id'"
                  />
                  <q-input
                    v-model="findData.name"
                    @click.stop=""
                    @clear="onRequest"
                    @keyup.enter="onRequest"
                    dense
                    standout="grey-5"
                    clearable
                    v-if="col.name === 'name'"
                  />
                  <div v-if="col.name === 'breed'" @click.stop="">
                    <q-select
                      dense
                      @clear="onRequest"
                      @popup-hide="onRequest"
                      clearable
                      standout="grey-5"
                      v-model="findData.breed"
                      :options="breedOptions"
                    />
                  </div>
                  <q-input
                    v-model="findData.ems"
                    @click.stop=""
                    @clear="onRequest"
                    @keyup.enter="onRequest"
                    dense
                    standout="grey-5"
                    clearable
                    v-if="col.name === 'color_code'"
                  />
                  <q-input
                    v-model="findData.father_name"
                    @click.stop=""
                    @clear="onRequest"
                    @keyup.enter="onRequest"
                    dense
                    standout="grey-5"
                    clearable
                    v-if="col.name === 'father'"
                  />
                  <q-input
                    v-model="findData.mother_name"
                    @click.stop=""
                    @clear="onRequest"
                    @keyup.enter="onRequest"
                    dense
                    standout="grey-5"
                    clearable
                    v-if="col.name === 'mother'"
                  />
                </div>
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="props">
            <q-tr :props="props">
              <q-td key="id" :props="props">
                {{ props.row.id }}
              </q-td>
              <q-td key="name" :props="props">
                <a
                  target="_blank"
                  :class="props.row.gender == 'F' ? 'woman' : 'man'"
                  :href="'/cat/detail/' + props.row.id + '/pedigree'"
                >
                  {{ props.row.name }}
                </a>
              </q-td>
              <q-td key="breed" :props="props">
                {{ props.row.breed !== null ? props.row.breed.code : '' }}
              </q-td>
              <q-td key="date_of_birth" :props="props">
                {{ props.row.dateOfBirth }}
              </q-td>
              <q-td key="color_code" :props="props">
                {{ props.row.colorCode }}
              </q-td>
              <q-td key="father" :props="props">
                <a
                  v-if="props.row.reference.father != null"
                  target="_blank"
                  class="man"
                  :href="'/cat/detail/' + props.row.reference.father.id + '/pedigree'"
                >
                  {{ props.row.reference.father.name }}
                </a>
                <p v-if="props.row.reference.father == null">
                  {{ props.row.reference.father_name }}
                </p>
              </q-td>
              <q-td key="mother" :props="props">
                <a
                  v-if="props.row.reference.mother != null"
                  target="_blank"
                  class="woman"
                  :href="'/cat/detail/' + props.row.reference.mother.id + '/pedigree'"
                >
                  {{ props.row.reference.mother.name }}
                </a>
                <p v-if="props.row.reference.mother == null">
                  {{ props.row.reference.mother_name }}
                </p>
              </q-td>
              <q-td key="actions" :props="props">
                <q-btn
                  color="green"
                  icon-right="arrow_forward"
                  no-caps
                  flat
                  dense
                  @click="selectCat(rowsCats.indexOf(props.row))"
                >
                  <q-tooltip>{{ $t('select') }}</q-tooltip>
                </q-btn>
              </q-td>
            </q-tr>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { QTableProps, useDialogPluginComponent } from 'quasar';
import { Cat, FindCat, Reference } from 'src/contracts';
import CatService from 'src/services/cat/CatService';
import { userAuthStore } from 'src/stores/auth-store';
import { cacheStore } from 'src/stores/cache-store';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'SelectCatDialog',

  props: {
    gender: {
      type: String,
      required: true,
    },
  },
  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const tableRef = ref();
    const rowsCats = ref([] as Cat[]);
    const loading = ref(false);
    const pagination = ref({
      sortBy: 'name',
      descending: false,
      page: 1,
      rowsPerPage: 10,
      rowsNumber: 10,
    });
    let selectedCat = ref(null as Cat | null);

    const onOKClick = function () {
      onDialogOK({
        selectedCat: selectedCat.value,
      });
    };
    const selectCat = function (index: number) {
      selectedCat.value = rowsCats.value[index];
      onOKClick();
    };
    return {
      tableRef,
      loading,
      findData: ref({
        sex: props.gender,
        page: 0,
        per_page: 10,
      } as FindCat),
      pagination,
      rowsCats,
      cacheStore: cacheStore(),
      userAuthStore: userAuthStore(),
      breedOptions: ref([] as any[]),
      sexOptions: ['M', 'F'],
      selectedCat,
      dialogRef,
      selectCat,
      onDialogHide,

      onOKClick,

      onCancelClick: onDialogCancel,
    };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();

    let breeds = this.cacheStore.breeds;
    this.breedOptions = breeds?.map((breed) => breed.code) ?? [];
  },
  computed: {
    pagesNumber() {
      return Math.ceil(
        this.pagination.rowsNumber / this.pagination.rowsPerPage
      );
    },
    columnsCats(): QTableProps['columns'] {
      return [
        {
          name: 'id',
          required: true,
          label: 'ID',
          align: 'left',
          field: (row: Cat) => row.id,
        },
        {
          name: 'name',
          required: true,
          label: this.$t('name'),
          align: 'left',
          field: (row: Cat) => row.name,
          sortable: true,
        },
        {
          name: 'breed',
          required: true,
          label: this.$t('breed'),
          align: 'left',
          field: (row: Cat) => (row.breed !== null ? row.breed.code : ''),
          sortable: true,
        },
        {
          name: 'date_of_birth',
          required: true,
          label: this.$t('birthday'),
          align: 'left',
          field: (row: Cat) => row.dateOfBirth,
          sortable: true,
        },
        {
          name: 'color_code',
          required: true,
          label: this.$t('colorCode'),
          align: 'left',
          field: (row: Cat) => row.colorCode,
          sortable: true,
        },
        {
          name: 'father',
          required: true,
          label: this.$t('father'),
          align: 'left',
          field: (row: Cat) =>
            (row.reference as Reference).father == null
              ? (row.reference as Reference).father_name
              : (row.reference as Reference).father?.name,
        },
        {
          name: 'mother',
          required: true,
          label: this.$t('mother'),
          align: 'left',
          field: (row: Cat) =>
            (row.reference as Reference).mother == null
              ? (row.reference as Reference).mother_name
              : (row.reference as Reference).mother?.name,
        },
        {
          name: 'actions',
          label: this.$t('action'),
          field: 'actions'
        },
      ];
    }
  },
  methods: {
    async onRequest(props: any) {
      const { page, rowsPerPage, sortBy, descending } =
        props === null || props === undefined || props.pagination === undefined
          ? this.pagination
          : props.pagination;
      this.loading = true;

      this.findData.per_page = rowsPerPage;
      this.findData.page = page - 1;
      this.findData.order_by = sortBy;
      this.findData.order_type = descending ? 'desc' : 'asc';

      let data = await CatService.all(this.findData);
      this.rowsCats = data?.items ?? [];

      this.pagination.rowsNumber = data?.metadata.total ?? 0;
      this.pagination.page = page;
      this.pagination.rowsPerPage = rowsPerPage;
      this.pagination.sortBy = sortBy;
      this.pagination.descending = descending;

      this.loading = false;
    },
  },
});
</script>

<style lang="scss">
h5 {
  margin: 0;
}
.select-cat-dialog.q-dialog-plugin {
  width: 96%;
  max-width: 96% !important;
}

a.man {
  color: #0000ee;
}
a.woman {
  color: #ff7e7e;
}
.q-table__container a.man:visited {
  color: #0000ee;
}
.q-table__container a.woman:visited {
  color: #ff7e7e;
}
.filter {
  max-width: 200px;

  .q-select {
    .q-field__native {
      padding-top: 0;
    }
  }

  .q-field--dense .q-field__control,
  .q-field--dense .q-field__marginal {
    height: 30px;
    min-height: 30px;
  }
}

.filter:not(:has(.q-field)) {
  margin-bottom: 30px;
}

tr > th:has(.filter) > .q-icon {
  display: none;
}
</style>
