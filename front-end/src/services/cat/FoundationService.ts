import type { AxiosError } from 'axios';
import { api } from 'src/boot/axios';

class FoundationService {
  async get(id: string): Promise<any | null> {
    return api
      .get('cats/foundation/' + id)
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

export default new FoundationService();
