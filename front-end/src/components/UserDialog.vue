<template>
  <!-- notice dialogRef here -->
  <q-dialog ref="dialogRef" @hide="onDialogHide">
    <q-card class="q-dialog-plugin">
      <q-card-section class="q-dialog__title flex justify-between">
        <p>{{ $t('editUser') }}</p>
        <q-icon name="close" style="cursor: pointer" @click="onCancelClick" />
      </q-card-section>
      <q-card-section>
        <q-input
          v-model="selectedUser!.fullname"
          :label="$t('fullName')"
          dense
          outlined
          class="q-mb-sm"
        />
        <q-input
          v-model="selectedUser!.email"
          class="q-mb-sm"
          :label="$t('email')"
          dense
          outlined
        />
        <q-select
          dense
          outlined
          v-model="role"
          :options="roleOptions"
          :label="$t('role')"
          class="q-mb-sm"
        />
        <q-select
          :disable="!isSelectedRoleAdmin()"
          dense
          outlined
          v-model="breeds"
          multiple
          :options="breedOptions"
          :label="$t('breeds')"
          class="q-mb-sm"
        />
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat color="primary" :label="$t('cancel')" @click="onCancelClick" />
        <q-btn flat color="primary" :label="$t('save')" @click="onOKClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script lang="ts">
import { useDialogPluginComponent } from 'quasar';
import { Breed, Role, User } from 'src/contracts';
import { cacheStore } from 'src/stores/cache-store';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  props: {
    user: Object as PropType<User>,
  },

  emits: [...useDialogPluginComponent.emits],

  setup(props) {
    const { dialogRef, onDialogHide, onDialogOK, onDialogCancel } =
      useDialogPluginComponent();
    const selectedUser = ref(props.user as User);
    const role = ref({
      label: props.user?.role.name,
      value: props.user?.role,
    });
    const breeds = ref(
      props.user?.breeds.map((breed) => ({
        label: breed.code,
        value: breed,
      }))
    );
    const isSelectedRoleAdmin = function () {
      return role.value?.value?.name === 'ADMIN';
    };
    return {
      isSelectedRoleAdmin,
      role: role,
      breeds: breeds,
      cacheStore: cacheStore(),
      breedOptions: [] as any[],
      roleOptions: [] as any[],
      selectedUser,
      dialogRef,
      onDialogHide,

      onOKClick() {
        selectedUser.value.role = role.value.value as Role;
        selectedUser.value.breeds = breeds.value?.map(
          (e) => e.value
        ) as Breed[];

        if (!isSelectedRoleAdmin()) {
          selectedUser.value.breeds = [];
        }

        onDialogOK({
          user: selectedUser.value,
        });
      },

      onCancelClick: onDialogCancel,
    };
  },
  async beforeMount() {
    if (!this.cacheStore.isLoaded) await this.cacheStore.loadData();
    let breeds = this.cacheStore.breeds;

    this.breedOptions =
      breeds?.map((breed) => ({
        label: breed.code,
        value: breed,
      })) ?? [];

    let roles = this.cacheStore.roles;

    this.roleOptions =
      roles?.map((role) => ({
        label: role.name,
        value: role,
      })) ?? [];
  },
});
</script>
