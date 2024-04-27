<template>
  <div class="flex justify-center" v-if="loading">
    <q-spinner color="primary" size="3em" />
  </div>
  <div v-if="!loading">
    <div class="header">
      <h4 class="title">{{ $t('groupByBreedsAndBirthYearAndCount') }}</h4>
      <div class="row">
        <q-select
          v-model="selectedBreed"
          :label="$t('breed')"
          filled
          :options="breedOptions"
          multiple
          clearable
        />
      </div>
    </div>
    <q-card class="q-my-md q-py-md">
      <line-graph :key="graphKey" :data="lineChartData"></line-graph>
    </q-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { cacheStore } from 'src/stores/cache-store';
import { userAuthStore } from 'src/stores/auth-store';
import { StatsService } from 'src/services';
import LineGraph from 'src/components/charts/LineGraph.vue';

export default defineComponent({
  name: 'LineChartPage',
  components: { LineGraph },
  props: {
    breed: Object,
    year: Object,
    country: Object,
  },
  setup() {
    return {
      selectedBreed: ref([]),
      breedOptions: ref([] as any[]),
      cacheStore: cacheStore(),
      userAuthStore: userAuthStore(),
      lineChartData: ref(),
      loading: ref(true),
      graphKey: ref(0),
    };
  },

  async beforeMount() {
    this.loading = true;
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();
    let breeds = this.cacheStore.breeds;
    this.breedOptions = breeds?.map((breed) => breed.code) ?? [];

    if (this.selectedBreed == null) {
      this.selectedBreed = [];
    }

    let response = await StatsService.getBreedYearCount(this.selectedBreed);
    if (this.isObjEmpty(response)) {
      this.lineChartData = null;
      this.loading = false;
      return;
    }
    this.lineChartData = response;
    this.loading = false;
  },
  methods: {
    isObjEmpty(obj: any) {
      return Object.keys(obj).length === 0;
    },
  },
  watch: {
    async selectedBreed() {
      if (this.selectedBreed == null) {
        this.selectedBreed = [];
      }
      let response = await StatsService.getBreedYearCount(this.selectedBreed);
      if (this.isObjEmpty(response)) {
        this.lineChartData = null;
        return;
      }
      this.lineChartData = response;

      this.graphKey++;
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
}
</style>
