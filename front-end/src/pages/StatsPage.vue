<template>
  <div class="flex justify-center" v-if="loading">
    <q-spinner color="primary" size="3em" />
  </div>
  <div v-if="!loading">
    <div>
      <q-tabs v-model="tab" :breakpoint="0" align="left" class="text-primary">
        <q-tab name="barchart" :label="$t('barchart')" />
        <q-tab name="linechart" :label="$t('linechart')" />
      </q-tabs>
    </div>

    <div>
      <q-tab-panels
        class="panels"
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-up"
      >
        <q-tab-panel name="barchart">
          <bar-chart-page></bar-chart-page>
        </q-tab-panel>
        <q-tab-panel name="linechart">
          <line-chart-page></line-chart-page>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script lang="ts">
import { CountStat } from 'src/contracts';
import { StatsService } from 'src/services';
import { userAuthStore } from 'src/stores/auth-store';
import { defineComponent, ref } from 'vue';
import LineChartPage from 'src/pages/StatsPageComponents/LineChartPage.vue';
import BarChartPage from 'src/pages/StatsPageComponents/BarChartPage.vue';

export default defineComponent({
  name: 'StatsPage',
  components: { LineChartPage, BarChartPage },
  setup() {
    return {
      userAuthStore: userAuthStore(),
      graphKey: ref(0),
      tab: ref('barchart'),
      resBreed: ref([] as CountStat[]),
      resYear: ref([] as CountStat[]),
      loading: ref(true),
    };
  },
  async beforeMount() {
    this.loading = true;
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();

    this.resBreed = (await StatsService.breedStats()) as CountStat[];

    this.resYear = (await StatsService.yearStats()) as CountStat[];

    this.loading = false;
  },
});
</script>

<style lang="scss" scoped>
.panels {
  background: #f5f5f5 !important;
}
</style>
