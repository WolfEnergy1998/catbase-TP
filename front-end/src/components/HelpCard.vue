<template>
  <q-card class="container_card" flat bordered @click="$router.push(help.url)">
    <q-card-section horizontal>
      <div class="container_img">
        <img
          class="card_img"
          :src="help.image_path"
          :alt="help.title"/>
      </div>

      <div class="container_card_text">
        <h1 class="card_title">
          {{ help.title }}
        </h1>
        <span class="card_description">
          {{ help.description }}
        </span>
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'HelpCard',
  props: ['help'],
}
</script>

<style scoped lang="scss">
$primary: #287094;

.q-card__section:hover {
  cursor: pointer;
  box-shadow: 0 1px 5px #0003, 0 2px 2px #00000024, 0 3px 1px -2px #0000001f;
}

.container_card_text {
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  padding: 16px;
}

.container_img {
  display: flex;
  align-items: center;
}

.card_img {
  max-width: 100%;
  object-fit: contain;
}

.card_title {
  font: 3em Bahnschrift;
  color: $primary;
  margin: 0 10px 10px 0;
}

.card_description {
  font: 1.25em Bahnschrift;
}

@media only screen and (max-width: 800px) {
  .card_title {
    font: 2em Bahnschrift;
  }
  .card_description {
    font: 1em Bahnschrift;
  }
}
</style>
