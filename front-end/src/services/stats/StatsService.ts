import type { AxiosError } from 'axios';
import type { CountStat } from 'src/contracts';
import { api } from 'src/boot/axios';

class StatsService {
  async breedStats(): Promise<CountStat[] | null> {
    return api
      .get('stats/breeds')
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
  async yearStats(): Promise<CountStat[] | null> {
    return api
      .get('stats/year')
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
  async countryStats(): Promise<CountStat[] | null> {
    return api
      .get('stats/country')
      .then((response) => response.data)
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }

  async getYears(): Promise<{ years: number[] }> {
    return api
      .get('stats/getCatYears/')
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }

  async getBreedCount(year: number): Promise<{
    dictionary: any;
  }> {
    return api
      .post('stats/getBreedCount/', { year: year })
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
  async getBreedYearCount(breeds: string[]): Promise<{
    dictionary: any;
  }> {
    return api
      .post('stats/getBreedYearCount/', { breeds: breeds })
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }

  async getLogsByCron(cronName: string): Promise<{ logs: any }> {
    return api
      .get('logs/get/cron/' + cronName)
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
  async getLogsByEvent(event: string): Promise<{ logs: any }> {
    return api
      .get('logs/get/event/' + event)
      .then((response) => {
        return response.data;
      })
      .catch((error: AxiosError) => {
        if (error.response?.status === 401) {
          return null;
        }

        return Promise.reject(error);
      });
  }
}

export default new StatsService();
