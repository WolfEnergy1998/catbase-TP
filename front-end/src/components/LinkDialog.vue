<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-dialog__title">
        {{ selectedLink?.id ? this.$t('editLink') : this.$t('createLink') }}
      </q-card-section>
      <q-card-section>
        <q-input
          type="textarea"
          v-model="selectedLink!.content"
          :label="$t('content')"
          dense
          outlined
          class="q-mb-sm"
        />

        <q-select
          v-model="selectedLink!.type"
          :label="$t('type')"
          dense
          outlined
          :options="linkTypeOptions"
        />
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('cancel')" @click="onCancelClick" />
        <q-btn flat color="primary" label="OK" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { Link } from 'src/contracts';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'LinkDialog',
  props: {
    link: Object as PropType<Link>,
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const selectedLink = ref(props.link as Link);
    return {
      selectedLink,
      dialogRef,
      onDialogHide,
      onOKClick() {
        onDialogOK({
          link: selectedLink.value,
        });
      },

      onCancelClick: onDialogCancel,
    };
  },

  computed: {
    linkTypeOptions(): string[] {
      return [this.$t('healthRecord'), this.$t('note'), 'URL', this.$t('award')]
    }
  },
});
</script>

<style lang="scss">
h5 {
  margin: 0;
}
</style>
