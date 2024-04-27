<template>
  <div class="graph">
    <canvas ref="piegraph"></canvas>
  </div>
</template>

<script lang="ts">
import { Chart, ChartOptions, registerables } from 'chart.js';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'PieGraph',
  props: {
    labels: Array<string>,
    colors: Array<string>,
    data: Array<number>,
  },
  setup() {
    return {
      options: {} as ChartOptions,
    };
  },
  mounted() {
    Chart.register(...registerables);
    const ctx = (this.$refs.piegraph as any).getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: this.$props.labels,
        datasets: [
          {
            data: this.$props.data,
            backgroundColor: this.$props.colors,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
          },
        },
      },
    });
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
</style>
