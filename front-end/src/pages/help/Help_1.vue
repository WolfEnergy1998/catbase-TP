<template>
  <div class="row items-center justify-evenly q-py-xl q-px-xs">
    <h1 class="help_title">
      HELP 1
    </h1>
    <p class="help_text">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam risus odio, facilisis vel facilisis at,
      luctus vestibulum diam. Nulla imperdiet commodo quam, at accumsan purus. Pellentesque non magna sit amet purus
      malesuada euismod nec ut dolor. Nam in enim malesuada, gravida augue quis, commodo odio. Fusce quis tempus purus.
      Vestibulum fringilla ac dolor et laoreet. Sed nisl nunc, mollis vel risus eget, sollicitudin condimentum mauris.
      Vestibulum porttitor est vel aliquet interdum. Curabitur tristique quam quis dolor convallis, quis ullamcorper
      arcu gravida. In hac habitasse platea dictumst. Phasellus lectus dolor, mollis quis tortor in, euismod gravida
      ante. Aliquam quam augue, hendrerit ut blandit ac, mollis ac purus. Donec vitae magna feugiat, iaculis risus
      vitae, congue augue. Maecenas ullamcorper, sem non mattis rutrum, nibh ligula sagittis arcu, non mattis erat
      eros eget massa.
    </p>
    <p class="help_text">
      Quisque ligula risus, gravida a erat nec, consectetur tempus libero. Aliquam congue lacus erat, eu
      ullamcorper neque sagittis id. Phasellus non porta lectus. Fusce sit amet purus tellus. Nulla vehicula,
      arcu vitae gravida condimentum, erat diam venenatis sem, ut venenatis lectus neque vel risus. Praesent nec
      purus maximus, tempus ante eu, luctus metus. Etiam gravida elit vel velit ornare, vitae consequat nisl
      consectetur. Pellentesque id congue ipsum, nec dapibus purus. Mauris tincidunt nec ex at aliquet. Phasellus
      posuere dapibus placerat. Vivamus dignissim erat nibh. Nam sagittis elementum dui iaculis porttitor. Vestibulum
      sit amet vehicula orci. Donec semper metus neque, non commodo magna varius in. In porttitor diam at odio
      suscipit, non venenatis risus elementum. Nunc luctus arcu at massa tincidunt pharetra.
    </p>
    <p class="help_text">
      Aenean sagittis magna vitae turpis bibendum, eu varius erat maximus. Vivamus nec luctus tortor. Nunc semper
      auctor efficitur. Fusce volutpat iaculis velit varius sollicitudin. Fusce eget bibendum nisi. Duis luctus elit
      quis dui elementum, vel tincidunt enim rutrum. Donec efficitur magna eu scelerisque blandit. In auctor, ipsum at
      accumsan porta, tortor elit posuere magna, vitae ullamcorper ante lectus venenatis ante. Aliquam erat volutpat.
      Mauris luctus volutpat nulla. Fusce nec orci turpis. Curabitur pulvinar ut quam non pharetra. Nunc viverra
      faucibus odio et maximus. Suspendisse ut molestie nibh, placerat hendrerit sapien. Proin posuere sodales
      tincidunt.
    </p>
    <img class="help_img" src="/help/help_1.png" alt="help image"/>
  </div>
</template>

<script>
export default {
  name: 'Help_1'
}
</script>

<style scoped lang="scss">
$primary: #287094;

.help_title {
  font: 5em Bahnschrift;
  color: $primary;
  margin: 0 10px 10px 0;
}

.help_text {
  font: 1em Bahnschrift;
}

.help_img {
  max-width: 100%;
  object-fit: contain;
}
</style>
