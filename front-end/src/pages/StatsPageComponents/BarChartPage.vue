<template>
  <div class="flex justify-center" v-if="loading">
    <q-spinner color="primary" size="3em" />
  </div>
  <div v-if="!loading">
    <div class="header">
      <div>
        <h4 class="title">{{ $t('groupByBreedsAndBirthYears') }}</h4>
      </div>
      <div class="row">
        <q-select
          v-model="selectedYear"
          :label="$t('year')"
          filled
          :options="yearRange"
        />
      </div>
    </div>

    <div>
      <q-card v-for="(bar, index) in barValues" v-bind:key="index" class="q-my-md q-py-md">
        <bar-graph
          :labels="bar.labels"
          :data="bar.data"
          :year="selectedYear"
          :colors="bar.colors"
          :label="bar.label"
        ></bar-graph>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { StatsService } from 'src/services';
import BarGraph from 'src/components/charts/BarGraph.vue';

const breedCategory1 = ['EXO', 'PER', 'RAG', 'SBI', 'TUV'];
const breedCategory2 = [
  'ACL',
  'ACS',
  'LPL',
  'LPS',
  'MCO',
  'NEM',
  'NFO',
  'SIB',
  'TUA',
];
const breedCategory3 = [
  'BEN',
  'BLH',
  'BML',
  'BSH',
  'BUR',
  'CHA',
  'CYM',
  'EUR',
  'KBL',
  'KBS',
  'KOR',
  'MAN',
  'MAU',
  'OCI',
  'SIN',
  'SNO',
  'SOK',
  'SRL',
  'SRS',
];
const breedCategory4 = [
  'ABY',
  'BAL',
  'CRX',
  'DRX',
  'DSP',
  'GRX',
  'JBS',
  'OLH',
  'OSH',
  'PEB',
  'RUS',
  'SIA',
  'SOM',
  'SPH',
  'THA',
];

const breedCategories = [
  breedCategory1,
  breedCategory2,
  breedCategory3,
  breedCategory4,
];

export default defineComponent({
  name: 'BarChartPage',
  components: { BarGraph },

  setup() {
    return {
      yearRange: [] as any[],
      selectedYear: ref(1993),
      barValues: ref([] as any[]),
      loading: ref(true),
    };
  },
  methods: {
    getYearsArray() {
      const currentYear = new Date().getFullYear();
      const startYear = 1993;
      const years = [];

      for (let i = startYear; i <= currentYear; i++) {
        years.push(i);
      }

      return years;
    },
    async updateValues() {
      this.barValues = [];
      let response = await StatsService.getBreedCount(this.selectedYear);
      for (let i = 0; i < 4; i++) {
        let filtered = Object.assign(
          {},
          ...Object.entries(response)
            .filter(([k]) => breedCategories[i].includes(k))
            .map(([k, v]) => ({ [k]: v }))
        );

        let data = Object.values(filtered);

        let labels = Object.keys(filtered);

        let colors = Array.from(
          { length: data.length },
          () => `#${Math.floor(Math.random() * 16777215).toString(16)}`
        );

        let label = i + 1;

        let category = {
          labels: labels,
          data: data,
          colors: colors,
          label: label,
        };
        this.barValues.push(category);
      }
    },
  },
  async beforeMount() {
    this.loading = true;

    this.yearRange = this.getYearsArray();

    this.updateValues();

    this.loading = false;
  },

  watch: {
    async selectedYear() {
      this.updateValues();
    },
  },
});
</script>

<style lang="scss" scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  .title {
    text-align: center;
    margin-top: 0px;
    @media (max-width: 575.98px) {
      margin: 8px;
      font-size: 22px;
    }
    @media (max-width: 767.98px) {
      margin: 8px;
    }
  }
}

.q-select {
  min-width: 150px;
  margin-bottom: 50px;
}
</style>
