<template>
  <div class="q-pa-md q-pb-xl">
    <q-card class="q-my-md q-py-md">
      <h4 class="text-center title">{{ $t('groupByBreeds') }}</h4>
      <PieGraph
        :key="graphKey"
        :data="breedData"
        :labels="breedLabel"
        :colors="breedColors"
      />
    </q-card>
    <q-card class="q-my-md q-py-md">
      <h4 class="text-center title">{{ $t('groupByBirthYears') }}</h4>
      <PieGraph
        :key="graphKey"
        :data="yearData"
        :labels="yearLabel"
        :colors="yearColors"
      />
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import PieGraph from 'src/components/charts/PieGraph.vue';
import { CountStat } from 'src/contracts';

export default defineComponent({
  name: 'PieChartPage',
  components: { PieGraph },
  props: {
    breed: Object,
    year: Object,
  },
  setup() {
    return {
      breedData: ref([] as number[]),
      breedLabel: ref([] as string[]),
      breedColors: ref([] as string[]),
      yearData: ref([] as number[]),
      yearLabel: ref([] as string[]),
      yearColors: ref([] as string[]),
      graphKey: ref(0),
    };
  },
  async beforeMount() {
    let resBreed = await this.preparePieChart(this.breed as CountStat[]);
    this.breedData = resBreed.data;
    this.breedLabel = resBreed.labels;
    this.createColors(this.breedLabel.length, this.breedColors);

    let resYear = await this.preparePieChart(this.year as CountStat[]);
    this.yearData = resYear.data;
    this.yearLabel = resYear.labels;
    this.createColors(this.yearLabel.length, this.yearColors);

    this.graphKey++;
  },
  methods: {
    createColors(length: number, colorsArray: string[]) {
      for (let i = 0; i < length; i++) {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        const color = `rgb(${r}, ${g}, ${b})`;
        colorsArray.push(color);
      }
    },
    async preparePieChart(
      stats: CountStat[],
      limit = 55000,
    ): Promise<{ data: number[]; labels: string[] }> {
      let others = stats
        .filter((e) => e.count <= limit)
        .reduce((a, b) => a + b.count, 0);
      stats = stats.filter((e) => e.count > limit);
      let data = stats.map((e) => e.count);
      data.push(others);
      let labels = stats.map((e) => e.name);
      labels.push(this.$t('others'));
      return { data, labels };
    },
  },
});
</script>

<style lang="scss" scoped>
.text-center {
  text-align: center;
  margin: 0px;
  @media (max-width: 767.98px) {
    margin: 8px !important;
  }
}

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
</style>
