<template>
  <div class="row items-center justify-evenly q-py-lg">
    <div class="container-welcome">
      <h1 class="welcome-sign">{{ $t('welcome1') }} <b>{{ count }}</b> {{ $t('welcome2') }}</h1>
    </div>
    <div class="help_container_wrapper">
      <div/>
      <div class="help_container">
        <help-card v-for="help in help_pages" :key="help" :help="help" />
      </div>
      <div/>
    </div>
  </div>
</template>

<script lang="ts">
import { userAuthStore } from 'src/stores/auth-store';
import HelpCard from 'components/HelpCard.vue';
import {defineComponent, ref} from 'vue';
import CatService from 'src/services/cat/CatService';
import { StatsService } from 'src/services';

const help_pages = [
  {
    title: 'Help 1',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image_path: 'help/help_1.png',
    url: '/help_1',
  },
  {
    title: 'Help 2',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image_path: 'help/help_2.png',
    url: '/help_1',
  },
  {
    title: 'Help 3',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image_path: 'help/help_3.png',
    url: '/help_1',
  },
  {
    title: 'Help 4',
    description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    image_path: 'help/help_4.png',
    url: '/help_1',
  },
]

export default defineComponent({
  name: 'IndexPage',
  components: {
    HelpCard,
  },
  setup() {
    const count = ref(null as string | null);
    return {
      userAuthStore: userAuthStore(),
      count,
      help_pages,
    };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
  },
  async mounted() {
    this.count = (await this.countMethod()).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

    await this.fetchLogs()
  },
  methods: {
    async countMethod() {
      const countCats = await CatService.countCats()
      return countCats?.count
    },
    async fetchLogs(){
      //const logs = await fetch('http://localhost:3333/logs/get/cron/fdkat')
      let logs = await StatsService.getLogsByCron('fdkat')
      console.log(logs)
      logs = await StatsService.getLogsByEvent('started')
      console.log(logs)
    },
  }
});
</script>

<style scoped lang="scss">
.help_container_wrapper {
  display: grid;
  grid-template-columns: 1fr 60fr 1fr;
  grid-template-areas: "space1 help space2";
}

.help_container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-areas: "help1 help";
  grid-gap: 20px;
  justify-content: center;
}

.container-welcome {
  text-align: center;
}

.welcome-sign {
  font: 2.4em Bahnschrift;
  margin: 10px 10px 30px 10px;
}

@media only screen and (max-width: 800px) {
  .help_container {
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
</style>
