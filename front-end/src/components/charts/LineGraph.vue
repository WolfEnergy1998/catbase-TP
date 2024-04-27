<template>
  <div v-if="data">
    <div class="graph">
      <canvas class="canvas" ref="lineGraph"></canvas>
    </div>
  </div>
  <div v-else>
    <h4 class="title">{{ $t('selectBreed') }}</h4>
  </div>
</template>

<script lang="ts">
import { Chart, ChartOptions, registerables } from 'chart.js';
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'LineGraph',
  props: {
    data: Object,
  },
  setup() {
    return {
      options: {} as ChartOptions,
      graphKey: ref(0),
    };
  },
  mounted() {
    type BreedData = {
      [breed: string]: {
        birth_year_array: number[];
        cat_count_array: number[];
        color: string;
      };
    };

    if (this.data) {
      const rawObject: BreedData = JSON.parse(JSON.stringify(this.data));

      let maxBirthYearArrayLength = 0;
      let maxKey = '';

      Object.entries(rawObject).forEach(([key, breed]) => {
        if (breed.birth_year_array.length > maxBirthYearArrayLength) {
          maxBirthYearArrayLength = breed.birth_year_array.length;
          maxKey = key;
        }
      });

      const breedDatasets = Object.entries(rawObject).map(([breed, data]) => {
        const birthYears = data.birth_year_array;
        const catCounts = data.cat_count_array;
        const newData = new Array(maxBirthYearArrayLength).fill(null);
        birthYears.forEach((year, index) => {
          const idx = data.birth_year_array.indexOf(year);
          newData[index] = catCounts[idx];
        });
        return {
          label: breed,
          data: newData,
          backgroundColor: data.color,
          borderColor: data.color,
          fill: false,
        };
      });

      Chart.register(...registerables);
      const ctx = (this.$refs.lineGraph as any).getContext('2d');
      new Chart(ctx, {
        type: 'line',

        data: {
          labels: rawObject[maxKey]['birth_year_array'],
          datasets: breedDatasets,
        },

        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
            },
          },
        },
      });
    }
  },
  methods: {
    isObjEmpty(obj: any) {
      return Object.keys(obj).length === 0;
    },
  },
});
</script>

<style lang="scss" scoped>
.graph {
  position: relative;
  margin: auto;
  height: 80%;
  width: 80%;
  padding: 50px;

  @media (max-width: 767.98px) {
    height: 100%;
    width: 100%;
    padding: 0px;
  }
}
.title {
  text-align: center;
  @media (max-width: 575.98px) {
    margin: 8px;
    font-size: 22px;
  }
  @media (max-width: 767.98px) {
    margin: 8px;
  }
}
</style>
