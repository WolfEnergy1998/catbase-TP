import type { AxiosError } from 'axios';
import type { User } from 'src/contracts';
import { api } from 'src/boot/axios';

class UserService {
  async users(): Promise<User[] | null> {
    return api
      .get('users/all')
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }

  async delete(user: User): Promise<{ message: string } | null> {
    const response = await api.delete<{ message: string }>('users/' + user.id);
    return response.data;
  }

  async update(user: User): Promise<{ message: string } | null> {
    const response = await api.put<{ message: string }>(
      'users/' + user.id,
      user
    );
    return response.data;
  }
}

export default new UserService();
