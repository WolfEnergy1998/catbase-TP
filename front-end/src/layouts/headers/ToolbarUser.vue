<template>
  <div class="header">
    <q-toolbar class="bg-primary text-white shadow-2">
      <q-tabs v-model="model" class="menu">
        <q-tab icon="home" @click="onItemClick('/')" />
        <q-tab :label="$t('findCat')" @click="onItemClick('/cat/all')" />
        <q-tab :label="$t('stats')" @click="onItemClick('/stats')" />
        <q-tab :label="$t('catNames')" @click="onItemClick('/names')" />
      </q-tabs>

      <q-space />
      <q-btn
        style="width: 40px"
        class="q-mr-sm"
        @click="openDialog()"
        icon="add"
        v-if="userAuthStore.isAdmin || userAuthStore.isSuperAdmin"
      >
        <q-tooltip>{{ $t('addNewCat') }}</q-tooltip>
      </q-btn>
      <q-btn-dropdown v-if="!userAuthStore.isAuthenticated" label="Log in">
        <LoginPage />
      </q-btn-dropdown>
      <div v-if="userAuthStore.isAuthenticated">
        <q-btn-dropdown color="primary" icon="account_circle">
          <template v-slot:label>
            <q-tooltip
              :delay="1000"
              anchor="center left"
              self="center right"
              :offset="[10, 10]"
            >
              {{ $t('loggedAs') }} {{ userAuthStore.user?.fullname }}
            </q-tooltip>
          </template>

          <q-list>
            <q-item
              v-if="userAuthStore.isSuperAdmin"
              clickable
              v-close-popup
              @click="$router.push('/admin')"
            >
              <q-item-section>
                <div class="flex">
                  <q-icon name="admin_panel_settings" class="q-mr-sm" />
                  <q-item-label>Admin</q-item-label>
                </div>
              </q-item-section>
            </q-item>

            <q-item
              v-if="userAuthStore.isSuperAdmin"
              clickable
              v-close-popup
              @click="onDeduplicationItem"
            >
              <q-item-section>
                <div class="flex">
                  <q-icon name="content_copy" class="q-mr-sm" />
                  <q-item-label>{{ $t('deduplication') }}</q-item-label>
                </div>
              </q-item-section>
            </q-item>

            <q-item clickable v-close-popup @click="logOut">
              <q-item-section>
                <div
                  class="flex align-center"
                  @click="$router.push('/register')"
                >
                  <q-icon name="logout" class="q-mr-sm" />
                  <q-item-label>{{ $t('logOut') }}</q-item-label>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </div>

      <q-btn-dropdown
        icon="menu"
        class="menu-mobile q-ml-sm"
        color="$secondary"
      >
        <q-list>
          <q-item clickable @click="onItemClick('/')">
            <q-item-section>
              <q-item-label>{{ $t('home') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="onItemClick('/cat/all')">
            <q-item-section>
              <q-item-label>{{ $t('findCat') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="onItemClick('/stats')">
            <q-item-section>
              <q-item-label>{{ $t('stats') }}</q-item-label>
            </q-item-section>
          </q-item>

          <q-item clickable @click="onItemClick('/names')">
            <q-item-section>
              <q-item-label>{{ $t('catNames') }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-btn-dropdown>
    </q-toolbar>
  </div>
</template>

<script lang="ts">
import LoginPage from 'src/pages/LoginPage.vue';
import { defineComponent } from 'vue';
import { ref } from 'vue';
import { userAuthStore } from 'stores/auth-store';
import CreateCatDialog from 'src/components/CreateCatDialog.vue';
import CatService from 'src/services/cat/CatService';

export default defineComponent({
  name: 'toolbar-header-user',
  components: { LoginPage },
  setup() {
    const authStore = userAuthStore();
    return {
      userAuthStore: authStore,
      model: ref(''),
    };
  },
  methods: {
    openDialog: function () {
      this.$q
        .dialog({
          component: CreateCatDialog,
        })
        .onOk(async ({ cat }) => {
          await CatService.create(cat);
        });
    },
    logOut() {
      this.userAuthStore.logout();
    },
    onItemClick(route: string) {
      this.$router.push(route);
    },
    onDeduplicationItem() {
      if (location.pathname === '/deduplication') {
        window.location.reload();
      }
      else {
        this.$router.push('/deduplication');
      }
    },
  },
});
</script>

<style scoped lang="scss">
@media screen and (max-width: 991px) {
  .menu {
    display: none;
  }

  .menu-mobile {
    display: block !important;
  }
}
.menu-mobile {
  display: none;
}
.header {
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
}
</style>

<style lang="scss">
.q-menu {
  background-color: $primary;
}

.q-btn a {
  color: white;
  text-decoration: none;
}

.menu {
  .q-tab--active {
    background-color: #5e8fa5;
  }
}
</style>
