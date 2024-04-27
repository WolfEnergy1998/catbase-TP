<template>
  <div class="">
    <q-toolbar class="bg-primary text-white q-pl-none">
      <q-icon
        class="cat-logo"
        name="img:/logo/white_infocat_logo.svg"
        color="secondary"
        text-color="white"
        @click="$router.replace('/')"
      />
      <q-space />

      <q-btn class="link" flat label="Úvod" href="#intro" />
      <q-btn class="link" flat label="O projekte" href="#about_project" />
      <q-btn class="link" flat label="O nás" href="#about_us" />
      <q-btn class="link" flat label="Časová os" href="#time_sheet" />
    </q-toolbar>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ref } from 'vue';

export default defineComponent({
  name: 'TeamHeader',
  setup() {
    return {
      tab: ref(''),
    };
  },
});
</script>

<style scoped lang="scss">
.cat-logo {
  width: 350px;
  height: 10vh;
}

.cat-logo:hover {
  cursor: pointer;
}

.link {
  font-family: Bahnschrift, sans-serif;
  font-weight: bold;
  font-size: 1.2rem;
}

@media only screen and (max-width: 1000px) {
  .cat-logo {
    display: none;
  }
}
</style>
