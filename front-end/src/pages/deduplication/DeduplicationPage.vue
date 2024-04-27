<template>
  <template v-if="results !== null">
    <ResultsDeduplication :results="results"/>
  </template>
  <template v-else>
    <ImportDeduplication @show-results="showResults"/>
  </template>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import ImportDeduplication from 'components/ImportDeduplication.vue';
import {Results} from 'src/contracts';
import ResultsDeduplication from 'components/ResultsDeduplication.vue';

let results = ref<Results | null>(null);

const showResults = (resultsArg: Results) => {
  results.value = resultsArg;
}

</script>

<style scoped lang="scss">

</style>
