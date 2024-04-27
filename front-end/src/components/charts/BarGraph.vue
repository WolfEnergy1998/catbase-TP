<template>
  <div class="text-align">
    <h4>Category {{ label }}</h4>
  </div>
  <div class="graph">
    <canvas ref="barGraph"></canvas>
  </div>
</template>

<script lang="ts">
import { Chart, ChartOptions, registerables } from 'chart.js';
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BarGraph',
  props: {
    labels: Array<string>,
    data: Array<number>,
    year: Number,
    colors: Array<string>,
    label: Number,
  },
  setup() {
    return {
      options: {} as ChartOptions,
    };
  },
  mounted() {
    Chart.register(...registerables);
    const ctx = (this.$refs.barGraph as any).getContext('2d');
    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.$props.labels,
        datasets: [
          {
            label: this.$t('category') + this.$props.label,
            data: this.$props.data,
            backgroundColor: this.$props.colors,
          },
        ],
      },
      options: {
        responsive: true,

        plugins: {
          legend: {
            position: 'top',
            display: false,
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
  padding-left: 50px;
  padding-right: 50px;
  padding-bottom: 50px;

  @media (max-width: 767.98px) {
    height: 100%;
    width: 100%;
    padding: 0px;
  }
}

.text-align {
  text-align: center;
  h4 {
    margin: 0px;
  }
  h4:first {
    margin-top: 50px;
  }
}
</style>
