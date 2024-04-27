<template>
  <div>
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
                v-model="filters.name"
                @click.stop=""
                @clear="filter()"
                @keyup.enter="filter()"
                dense
                standout="grey-5"
                clearable
                v-if="col.name === 'name'"
              />
              <q-input
                v-model="filters.sex"
                @click.stop=""
                @clear="filter()"
                @keyup.enter="filter()"
                dense
                standout="grey-5"
                clearable
                v-if="col.name === 'gender'"
              />
              <q-input
                v-model="filters.emsCode"
                @click.stop=""
                @clear="filter()"
                @keyup.enter="filter()"
                dense
                standout="grey-5"
                clearable
                v-if="col.name === 'code'"
              />
              <q-input
                v-model="filters.birthDate"
                @click.stop=""
                @clear="filter()"
                @keyup.enter="filter()"
                dense
                standout="grey-5"
                clearable
                v-if="col.name === 'date_of_birth'"
              />
              <q-input
                v-model="filters.probability"
                @click.stop=""
                @clear="filter()"
                @keyup.enter="filter()"
                dense
                standout="grey-5"
                clearable
                v-if="col.name === 'probability'"
              />
            </div>
          </q-th>
        </q-tr>
      </template>
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="name" :props="props">
            <router-link
              :class="[props.row.gender == 'M' ? 'man' : 'woman']"
              :to="formatCatLink(props.row.id)"
              >{{ props.row.name }}</router-link
            >
          </q-td>
          <q-td key="gender" :props="props">
            {{ props.row.gender }}
          </q-td>
          <q-td key="code" :props="props">
            {{ props.row.code }}
          </q-td>
          <q-td key="date_of_birth" :props="props">
            {{ props.row.date_of_birth }}
          </q-td>
          <q-td key="probability" :props="props">
            {{ props.row.probability }}
          </q-td>
        </q-tr>
      </template>
    </q-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { QTableProps } from 'quasar';
import { ref } from 'vue';

export default defineComponent({
  name: 'CatFoundation',
  props: ['foundationData'],
  setup() {
    const filters = ref({
      name: '',
      sex: '',
      emsCode: '',
      birthDate: '',
      probability: '',
    });
    return {
      rows: ref([] as any[]),
      data: ref([] as any[]),
      filters,
    };
  },
  async beforeMount() {
    this.rows = this.foundationData ?? [];
    this.data = [...this.rows];
  },
  computed: {
    columnsI18n(): QTableProps['columns'] {
      return [
        {
          name: 'name',
          required: true,
          label: this.$t('name'),
          align: 'left',
          field: (row: any) => row.name,
          sortable: true,
          classes: 'column-name',
        },
        {
          name: 'gender',
          required: true,
          label: this.$t('sex'),
          align: 'left',
          field: (row: any) => row.gender,
          sortable: true,
          classes: 'column-gender',
        },
        {
          name: 'code',
          required: true,
          label: 'EMS',
          align: 'left',
          field: (row: any) => row.code,
          sortable: true,
          classes: 'column-code',
        },
        {
          name: 'date_of_birth',
          required: true,
          label: this.$t('birthDate'),
          align: 'left',
          field: (row: any) => row.date_of_birth,
          sortable: true,
          classes: 'column-date_of_birth',
        },
        {
          name: 'probability',
          required: true,
          label: this.$t('probability'),
          align: 'left',
          field: (row: any) => row.probability,
          sortable: true,
          classes: 'column-probability',
        },
      ];
    },
  },
  methods: {
    formatCatLink(id: any) {
      let link = `/cat/detail/${id}/pedigree`;
      return link;
    },
    filter() {
      this.rows = this.data.filter((cat) => {
        return cat.name
          .toLowerCase()
          .includes(
            this.filters.name == null ? '' : this.filters.name.toLowerCase()
          );
      });
      this.rows = this.rows.filter((cat) => {
        return cat.probability
          .toString()
          .includes(
            this.filters.probability == null ? '' : this.filters.probability
          );
      });
      this.rows = this.rows.filter((cat) => {
        {
          if (cat.gender) {
            return cat.gender
              .toLowerCase()
              .includes(
                this.filters.sex == null ? '' : this.filters.sex.toLowerCase()
              );
          } else {
            return this.rows;
          }
        }
      });
      this.rows = this.rows.filter((cat) => {
        if (cat.code) {
          return cat.code
            .toLowerCase()
            .includes(
              this.filters.emsCode == null
                ? ''
                : this.filters.emsCode.toLowerCase()
            );
        } else {
          return this.rows;
        }
      });
      this.rows = this.rows.filter((cat) => {
        if (cat.date_of_birth) {
          return cat.date_of_birth
            .toLowerCase()
            .includes(
              this.filters.birthDate == null
                ? ''
                : this.filters.birthDate.toLowerCase()
            );
        } else {
          return this.rows;
        }
      });
    },
  },
});
</script>
<style scoped lang="scss">
.woman {
  cursor: pointer;
  text-decoration: underline;
  color: #ff7e7e;
}
.man {
  cursor: pointer;
  text-decoration: underline;
  color: #0000ee;
}
</style>
