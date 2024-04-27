import { defineStore } from 'pinia';
import { LoginCredentials, RegisterData, User } from 'src/contracts/Auth';
import { authManager, authService } from 'src/services';

export const userAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    status: 'start',
    errors: [] as string[],
  }),

  getters: {
    isSuperAdmin(context): boolean {
      return context.user?.role.name === 'SUPERADMIN';
    },
    isAdmin(context): boolean {
      return context.user?.role.name === 'ADMIN';
    },
    isAuthenticated(context): boolean {
      return context.user !== null;
    },
    isNotVerified(context): boolean {
      return context.user?.verified === false;
    },
    getStatus(context): string {
      return context.status;
    },
  },

  actions: {
    isAdminForBreed(breed: string): boolean {
      return this.user?.breeds.map((e) => e.code).includes(breed) ?? false;
    },
    AUTH_START() {
      this.status = 'pending';
      this.errors = [];
    },
    AUTH_SUCCESS(user: User | null) {
      this.status = 'success';
      this.user = user;
    },
    AUTH_ERROR(errors: string[]) {
      this.status = 'error';
      this.errors = errors;
    },
    async check() {
      try {
        this.AUTH_START(); /*
        if (process.env.NODE_ENV === 'development') {
          await this.login({
            email: 'tina@jones.com',
            password: 'passwordTina',
          } as LoginCredentials);
        }*/
        let user = null;
        if (authManager.getToken() != null) user = await authService.me();
        this.AUTH_SUCCESS(user);
        return user !== null;
      } catch (err) {
        this.AUTH_ERROR([err as string]);
        throw err;
      }
    },
    async register(form: RegisterData) {
      try {
        this.AUTH_START();
        const user = await authService.register(form);
        this.AUTH_SUCCESS(user);
        return user;
      } catch (err) {
        this.AUTH_ERROR([err as string]);
        throw err;
      }
    },
    async login(credentials: LoginCredentials) {
      try {
        this.AUTH_START();
        const apiToken = await authService.login(credentials);
        this.AUTH_SUCCESS(null);
        // save api token to local storage and notify listeners
        authManager.setToken(apiToken.token);
        return apiToken;
      } catch (err) {
        this.AUTH_ERROR([err as string]);
        throw err;
      }
    },
    async logout() {
      try {
        this.AUTH_START();
        await authService.logout();
        this.AUTH_SUCCESS(null);
        // remove api token and notify listeners
        authManager.removeToken();
      } catch (err) {
        this.AUTH_ERROR([err as string]);
        throw err;
      }
    },
  },
});
