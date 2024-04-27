<template>
  <div class="column items-center">
    <div class="row">
      <q-card class="q-pa-md login-card">
        <q-form class="q-gutter-md" @submit.stop="onSubmit()">
          <img
          class="title-pading cat-logo"
          :src="'/logo/black_infocat_logo.svg'"
          color="secondary"
          text-color="white"
        />
          <q-card-section>
            <q-input
              standout="bg-grey"
              name="email"
              id="email"
              v-model="state.email"
              type="text"
              :label="$t('email')"
              :error="v$.email.$errors.length > 0"
              :error-message="emailError"
            />
            <q-input
              v-model="state.password"
              standout="bg-grey"
              class="q-mt-lg"
              :type="isPwd ? 'password' : 'text'"
              :label="$t('password')"
              name="password"
              id="password"
              :error="v$.password.$errors.length > 0"
              :error-message="passwordError"
            >
            </q-input>
          </q-card-section>
          <q-card-actions class="q-px-md q-mt-xs">
            <q-btn
              color="primary"
              class="full-width q-mx-lg"
              label="Log in"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
          <q-card-section class="text-center q-pa-none q-mt-sm">
            <a
              class="text-grey-6 cursor-pointer underlined-text"
              @click="$router.push('/register')"
              >{{ $t('createAccount') }}</a
            >
          </q-card-section>
        </q-form>
      </q-card>
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue';
import { ErrorObject, useVuelidate } from '@vuelidate/core';
import { email, required, minLength, maxLength } from '@vuelidate/validators';
import { defineComponent } from 'vue';
import { userAuthStore } from 'stores/auth-store';
import { LoginCredentials } from 'src/contracts/Auth';

export default defineComponent({
  name: 'LoginPage',
  setup() {
    const state = reactive({
      email: '',
      password: '',
    });
    const rules = {
      email: { required, email },
      password: { required, min: minLength(8), max: maxLength(20) },
    };

    const v$ = useVuelidate(rules, state, { $lazy: true, $autoDirty: true });

    return { state, v$, isPwd: ref(true), userAuthStore: userAuthStore() };
  },
  computed: {
    loading(): boolean {
      return this.userAuthStore.getStatus === 'pending';
    },
    emailError(): string {
      return this.$t('emailValid');
    },
    passwordError(): string {
      return this.$t('passwordValid');
    },
  },
  methods: {
    async onSubmit() {
      const isFormCorrect = await this.v$.$validate();
      if (!isFormCorrect) {
        this.$q.notify({
          color: 'red-4',
          textColor: 'white',
          position: 'top',
          icon: 'warning',
          message: this.v$.$errors.map((e: ErrorObject) => e.$message).join(),
        });
      } else {
        let credentials = {
          email: this.state.email,
          password: this.state.password,
        } as LoginCredentials;
        this.userAuthStore
          .login(credentials)
          .then(() => {
            //load userstate
            //redirect if successful
            this.userAuthStore.check();
            this.$router.push('/');
          })
          .catch(() => {
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              position: 'top',
              icon: 'warning',
              message: this.$t('invalidCredentials'),
            });
          });
      }
    },
  },
});
</script>
