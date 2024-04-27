import type { AxiosError } from 'axios';
import { api } from 'src/boot/axios';

class GenerationService {
  async get(id: string, numberOfGenerations: number): Promise<any | null> {
    return api
      .get('cats/pedigree/' + id + '?gen=' + numberOfGenerations)
      .then(async (response) => {
        return response;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
}

export default new GenerationService();
