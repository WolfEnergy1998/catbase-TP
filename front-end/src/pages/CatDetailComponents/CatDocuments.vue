<template>
  <q-table
    :rows="rows"
    :columns="columnsI18n"
    row-key="name"
    class="table-user q-mb-lg"
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
              v-model="filters.id"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'ID'"
            />
            <q-input
              v-model="filters.content"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'Content'"
            />
            <q-input
              v-model="filters.type"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'Type'"
            />
          </div>
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="ID" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="Content" :props="props">
          {{ props.row.content }}
        </q-td>
        <q-td key="Type" :props="props">
          {{ props.row.type }}
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { QTableProps } from 'quasar';
import { ref } from 'vue';
export default {
  name: 'CatDocuments',
  props: ['documentsData'],
  setup() {
    const filters = ref({
      id: '',
      content: '',
      type: '',
    });
    return {
      rows: ref([] as any[]),
      data: ref([] as any[]),
      filters,
    };
  },

  async beforeMount() {
    this.rows = this.documentsData ?? [];
    this.data = [...this.rows];
  },
  computed: {
    columnsI18n(): QTableProps['columns'] {
      return [
        {
          name: 'ID',
          required: true,
          label: this.$t('id'),
          align: 'left',
          field: (row: any) => row.id,
          sortable: true,
          classes: 'column-name',
        },
        {
          name: 'Content',
          required: true,
          label: this.$t('content'),
          align: 'left',
          field: (row: any) => row.content,
          sortable: true,
          classes: 'column-gender',
        },
        {
          name: 'Type',
          required: true,
          label: this.$t('type'),
          align: 'left',
          field: (row: any) => row.type,
          sortable: true,
          classes: 'column-code',
        },
      ];
    },
  },
  methods: {
    filter() {
      this.rows = this.data.filter((cat) => {
        return cat.id
          .toString()
          .includes(this.filters.id == null ? '' : this.filters.id.toString());
      });
      this.rows = this.rows.filter((cat) => {
        return cat.content
          .toLowerCase()
          .includes(
            this.filters.content == null
              ? ''
              : this.filters.content.toLowerCase()
          );
      });
      this.rows = this.rows.filter((cat) => {
        return cat.type
          .toLowerCase()
          .includes(
            this.filters.type == null ? '' : this.filters.type.toLowerCase()
          );
      });
    },
  },
};
</script>

<style scoped lang="scss"></style>
