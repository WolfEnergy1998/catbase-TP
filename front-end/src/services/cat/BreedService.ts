import type { AxiosError } from 'axios';
import type { Breed } from 'src/contracts';
import { api } from 'src/boot/axios';

class BreedService {
  async breeds(): Promise<Breed[] | null> {
    return api
      .get('breeds/all')
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }

  async update(breed: Breed): Promise<{ message: string } | null> {
    const response = await api.put<{ message: string }>(
      'breeds/' + breed.id,
      breed
    );
    return response.data;
  }

  async create(breed: Breed): Promise<{ message: string } | null> {
    const response = await api.post<{ message: string }>('breeds/', {
      code: breed.code,
    });
    return response.data;
  }

  async delete(breed: Breed): Promise<{ message: string } | null> {
    const response = await api.delete<{ message: string }>(
      'breeds/' + breed.id
    );
    return response.data;
  }
}

export default new BreedService();
