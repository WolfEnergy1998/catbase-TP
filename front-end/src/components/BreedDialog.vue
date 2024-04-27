<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-dialog__title">
        {{ breed?.id ? $t('edit') : $t('create') }}
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="selectedBreed!.code"
          :label="$t('breedCode')"
          dense
          outlined
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" label="Cancel" @click="onCancelClick" />
        <q-btn flat color="primary" label="Save" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { Breed } from 'src/contracts';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'BreedDialog',
  props: {
    breed: Object as PropType<Breed>,
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const selectedBreed = ref({
      id: props.breed?.id,
      code: props.breed?.code,
    } as Breed);
    return {
      selectedBreed,
      dialogRef,
      onDialogHide,

      onOKClick() {
        onDialogOK({
          breed: selectedBreed.value,
        });
      },

      onCancelClick: onDialogCancel,
    };
  },
});
</script>

<style lang="scss">
h5 {
  margin: 0;
}
</style>
