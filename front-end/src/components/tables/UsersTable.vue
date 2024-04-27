<template>
  <div class="table-header">
    <h4>{{ $t('users') }}</h4>
    <div></div>
  </div>
  <q-table
    :rows="rows"
    :columns="columns"
    row-key="fullname"
    class="table-user q-mb-lg"
  >
    <template v-slot:header="props">
      <q-tr :props="props">
        <q-th
          v-for="col in props.cols"
          :key="col.name"
          :props="props"
          :class="'column-' + col.name"
        >
          <div class="filter">
            <label>{{ col.label }}</label>
            <i
              class="q-icon notranslate material-icons q-table__sort-icon q-table__sort-icon--left"
              aria-hidden="true"
              role="presentation"
              >arrow_upward</i
            >
            <q-input
              v-model="filters.fullname"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'name'"
            />
            <q-input
              v-model="filters.email"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'email'"
            />
            <q-input
              v-model="filters.breeds"
              @click.stop=""
              @clear="filter()"
              @keyup.enter="filter()"
              dense
              standout="grey-5"
              clearable
              v-if="col.name === 'breeds'"
            />
          </div>
        </q-th>
      </q-tr>
    </template>
    <template v-slot:body="props">
      <q-tr :props="props">
        <q-td key="id" :props="props">
          {{ props.row.id }}
        </q-td>
        <q-td key="name" :props="props">
          {{ props.row.fullname }}
        </q-td>
        <q-td key="email" :props="props">
          {{ props.row.email }}
        </q-td>
        <q-td key="role" :props="props">
          <q-icon v-if="props.row.role.name === 'USER'" size="md" name="face">
            <q-tooltip>{{ props.row.role.name }}</q-tooltip>
          </q-icon>
          <q-icon
            v-if="props.row.role.name === 'ADMIN'"
            size="md"
            name="account_circle"
          >
            <q-tooltip>{{ props.row.role.name }}</q-tooltip>
          </q-icon>
          <q-icon
            v-if="props.row.role.name === 'SUPERADMIN'"
            size="md"
            name="admin_panel_settings"
          >
            <q-tooltip>{{ props.row.role.name }}</q-tooltip>
          </q-icon>
        </q-td>
        <q-td key="breeds" :props="props">
          {{ createStringBreeds(props.row.breeds) }}
        </q-td>
        <q-td key="verified" :props="props">
          <q-icon
            v-if="props.row.verified"
            color="green"
            size="md"
            name="check_circle"
          >
            <q-tooltip>{{ $t('verified') }}</q-tooltip>
          </q-icon>
          <q-icon v-else size="md" color="red" name="cancel">
            <q-tooltip>{{ $t('notVerified') }}</q-tooltip>
          </q-icon>
        </q-td>
        <q-td key="action" :props="props">
          <q-btn
            color="green"
            icon-right="edit"
            no-caps
            flat
            dense
            @click="editUser(rows.indexOf(props.row))"
          />
          <q-btn
            color="negative"
            icon-right="delete"
            no-caps
            flat
            dense
            @click="deleteUser(rows.indexOf(props.row))"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { QTableProps } from 'quasar';
import { Breed, User } from 'src/contracts';
import { cacheStore } from 'src/stores/cache-store';
import { userAuthStore } from 'src/stores/auth-store';
import UserService from 'src/services/cat/UserService';
import UserDialog from 'src/components/UserDialog.vue';

export default defineComponent({
  name: 'UsersTable',

  setup() {
    const filters = ref({
      fullname: '',
      email: '',
      breeds: '',
    });
    return {
      cacheStore: cacheStore(),
      userAuthStore: userAuthStore(),
      filters,
      rows: ref([] as User[]),
      data: ref([] as User[]),
      selectedUser: ref({} as User),
    };
  },
  async beforeMount() {
    this.rows = (await UserService.users()) ?? [];
    this.data = [...this.rows];
  },
  methods: {
    createStringBreeds(breeds: Breed[]) {
      let result = '';
      breeds.forEach((breed) => {
        result += breed.code + ', ';
      });
      result = result.substring(0, result.length - 2);
      return result;
    },
    filter() {
      this.rows = this.data.filter((user) => {
        return user.fullname
          .toLowerCase()
          .includes(
            this.filters.fullname == null
              ? ''
              : this.filters.fullname.toLowerCase()
          );
      });

      this.rows = this.rows.filter((user) => {
        return user.email
          .toLowerCase()
          .includes(
            this.filters.email == null ? '' : this.filters.email.toLowerCase()
          );
      });
      this.rows = this.rows.filter((user) =>
        this.createStringBreeds(user.breeds)
          .toLowerCase()
          .includes(
            this.filters.breeds == null ? '' : this.filters.breeds.toLowerCase()
          )
      );
    },
    editUser: function (index: number) {
      this.selectedUser = this.rows[index];
      this.$q
        .dialog({
          component: UserDialog,
          componentProps: {
            user: this.selectedUser,
          },
        })
        .onOk(async ({ user }) => {
          let message = await UserService.update(user);
          this.rows[this.rows.indexOf(this.selectedUser)] = user;
          this.$q.notify({
            icon: 'check',
            message: message?.message,
            color: 'positive',
          });
        });
    },
    deleteUser: function (index: number) {
      this.$q
        .dialog({
          title: this.$t('confirm'),
          message: this.$t('deleteUser'),
          cancel: true,
          persistent: true,
        })
        .onOk(async () => {
          let message = await UserService.delete(this.rows[index]);
          console.log(message);
          this.$q.notify({
            icon: 'check',
            message: message?.message,
            color: 'positive',
          });

          this.rows.splice(index, 1);
        });
    },
  },
  computed: {
    columns(): QTableProps['columns'] {
      return [
        {
          name: 'id',
          required: true,
          label: 'ID',
          align: 'left',
          field: (row: User) => row.id,
          sortable: true,
          classes: 'column-id',
        },
        {
          name: 'name',
          required: true,
          label: this.$t('fullName'),
          align: 'left',
          field: (row: User) => row.fullname,
          sortable: true,
          classes: 'column-name',
        },
        {
          name: 'email',
          required: true,
          label: this.$t('email'),
          align: 'left',
          field: (row: User) => row.email,
          sortable: true,
          classes: 'column-email',
        },
        {
          name: 'role',
          required: true,
          label: this.$t('role'),
          align: 'left',
          field: (row: User) => row.role.name,
          sortable: true,
          classes: 'column-role',
        },
        {
          name: 'breeds',
          required: true,
          label: this.$t('breed'),
          align: 'left',
          field: (row: User) => row.breeds,
          sortable: true,
          classes: 'column-breed',
        },
        {
          name: 'verified',
          required: true,
          label: this.$t('verifiedStatus'),
          align: 'center',
          field: (row: User) => row.verified,
          sortable: true,
          classes: 'column-verified',
        },
        {
          name: 'action',
          label: this.$t('action'),
          field: 'action',
          align: 'center',
          classes: 'column-actions',
        },
      ];
    }
  }
});
</script>

<style lang="scss">
.table-user td.column-id,
.table-user th.column-id {
  width: 50px;
}
.table-user th.column-actions,
.table-user td.column-actions {
  width: 100px;
}
.table-user td.column-email,
.table-user th.column-email {
  width: 250px;
}
.table-user td.column-role,
.table-user th.column-role {
  width: 20px;
}
.table-user td.column-verified,
.table-user th.column-verified {
  width: 20px;
}
.table-user th.column-name,
.table-user td.column-name {
  width: 250px;
}
</style>
