<template>
  <div class="row q-pt-xl items-center">
    <div class="col-4">
      <img
        class="title-pading cat-logo"
        :src="'/logo/black_infocat_logo_no_text.svg'"
        color="secondary"
      />
    </div>
    <div class="col-4">
      <q-card class="q-pa-md login-card">
        <q-card-section class="text-center q-pa-none q-mt-b">
          <h4>{{ $t('registration') }}</h4>
        </q-card-section>
        <q-form class="q-gutter-md" @submit.stop="onSubmit()">
          <q-card-section>
            <q-input class="q-mb-md"
              standout="bg-secondary"
              name="email"
              id="email"
              v-model="state.email"
              type="text"
              :label="$t('email')"
              :error="v$.email.$errors.length > 0"
              :error-message="emailError"
            />
            <q-input class="q-mb-md"
              standout="bg-secondary"
              name="fullname"
              id="fullname"
              v-model="state.fullname"
              type="text"
              :label="$t('fullName')"
              :error="v$.fullname.$errors.length > 0"
              :error-message="fullnameError"
            />
            <q-input class="q-mb-md"
              standout="bg-secondary"
              v-model="state.password"
              :type="isPwd ? 'password' : 'text'"
              :label="$t('password')"
              name="password"
              id="password"
              :error="v$.password.$errors.length > 0"
              :error-message="passwordError"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
            <q-input class="q-mb-md"
              standout="bg-secondary"
              v-model="state.passwordConfirmation"
              :type="isPwd ? 'password' : 'text'"
              :label="$t('confirmPassword')"
              name="passwordConfirmation"
              id="passwordConfirmation"
              :error="v$.passwordConfirmation.$errors.length > 0"
              :error-message="passwordConfirmationError"
            >
              <template v-slot:append>
                <q-icon
                  :name="isPwd ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="isPwd = !isPwd"
                />
              </template>
            </q-input>
          </q-card-section>
          <q-card-actions class="q-px-md q-mt-xs">
            <q-btn
              color="primary"
              class="full-width q-mx-lg"
              :label="$t('register')"
              type="submit"
              :loading="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </div>
    <div class="col-4">
      <img
        class="mirrored cat-logo"
        :src="'/logo/black_infocat_logo_no_text.svg'"
        color="secondary"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { reactive, ref } from 'vue';
import { ErrorObject, useVuelidate } from '@vuelidate/core';
import { email, required, minLength, maxLength } from '@vuelidate/validators';
import { defineComponent } from 'vue';
import { userAuthStore } from 'stores/auth-store';
import { RegisterData } from 'src/contracts/Auth';

export default defineComponent({
  name: 'RegisterPage',
  setup() {
    const state = reactive({
      email: '',
      fullname: '',
      password: '',
      passwordConfirmation: '',
    });
    const matchingPasswords = function () {
      return state.password === state.passwordConfirmation;
    };
    const rules = {
      email: { required, email },
      fullname: { required },
      password: { required, min: minLength(8), max: maxLength(20) },
      passwordConfirmation: {
        required,
        matchingPasswords,
      },
    };

    const v$ = useVuelidate(rules, state, { $lazy: true, $autoDirty: true });

    return { state, v$, isPwd: ref(true), userAuthStore: userAuthStore() };
  },
  async beforeMount() {
    if (!this.userAuthStore.isAuthenticated) await this.userAuthStore.check();
  },
  computed: {
    loading(): boolean {
      return this.userAuthStore.getStatus === 'pending';
    },
    emailError(): string {
      return this.$t('validEmail');
    },
    fullnameError(): string {
      return this.$t('fullNameRequired');
    },
    passwordError(): string {
      return this.$t('passwordError');
    },
    passwordConfirmationError(): string {
      return this.$t('passwordNotMatching');
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
          fullname: this.state.fullname,
          password: this.state.password,
          passwordConfirmation: this.state.passwordConfirmation,
        } as RegisterData;
        this.userAuthStore
          .register(credentials)
          .then(() => {
            //load userstate
            //redirect if successful
            this.$router.push('/');
          })
          .catch(() => {
            this.$q.notify({
              color: 'red-4',
              textColor: 'white',
              position: 'top',
              icon: 'warning',
              message: this.$t('somethingWrong'),
            });
          });
      }
    },
  },
});
</script>

<style>
.mirrored {
  transform: scale(-1, 1);
}
</style>
