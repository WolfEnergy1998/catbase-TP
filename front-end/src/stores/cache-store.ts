import { defineStore } from 'pinia';
import { Breed } from 'src/contracts';
import { Role } from 'src/contracts/Auth';
import { authService, BreedService } from 'src/services';
import { userAuthStore } from './auth-store';

export const cacheStore = defineStore('cache', {
  state: () => ({
    userAuthStore: userAuthStore(),
    breeds: [] as Breed[],
    roles: [] as Role[],
  }),

  getters: {
    isLoaded(context): boolean {
      if (this.userAuthStore.isSuperAdmin)
        return context.breeds.length > 0 && context.roles.length > 0;

      return context.breeds.length > 0;
    },
  },

  actions: {
    async loadData() {
      try {
        this.breeds = (await BreedService.breeds()) as Breed[];
        if (this.userAuthStore.isSuperAdmin) {
          this.roles = (await authService.roles()) as Role[];
        }
      } catch (err) {
        throw err;
      }
    },
  },
});
