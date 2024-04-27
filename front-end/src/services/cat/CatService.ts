import type { AxiosError } from 'axios';
import type { AllCats, AllNames, Cat, FindCat, FindName, Results } from 'src/contracts';
import { api } from 'src/boot/axios';

class CatService {
  async all(data: FindCat): Promise<AllCats | null> {
    return api
      .post('cats/all/', data)
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

  async names(data: FindName): Promise<AllNames | null> {
    return api
      .post('cats/names/' + data.character, data)
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

  async get(id: string): Promise<any> {
    return api
      .get('cats/' + id)
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

  async getPdfAndImage(id: string): Promise<{ path_to_pdf: string; path_to_jpg: string }> {
    return api
      .get('cats/pedigree/pdf/' + id)
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

  public validateCat(cat: Cat): Cat {
    if (
      cat.additionalInfo?.cattery === undefined &&
      cat.additionalInfo?.titleBefore === undefined &&
      cat.additionalInfo?.titleAfter === undefined &&
      cat.additionalInfo?.chip === undefined &&
      cat.additionalInfo?.verifiedStatus === undefined
    )
      delete cat['additionalInfo'];

    if (
      cat.reference?.father === undefined &&
      cat.reference?.mother === undefined
    )
      delete cat['reference'];

    if (cat.reference?.father === undefined) delete cat.reference?.father;
    if (cat.reference?.mother === undefined) delete cat.reference?.mother;

    if (cat.links?.length === 0) delete cat['links'];

    return cat;
  }

  async update(cat: Cat): Promise<Cat | null> {
    cat = this.validateCat(cat);

    const response = await api.put<Cat>('cats/' + cat.id, cat);
    return response.data;
  }

  async create(cat: Cat): Promise<{ message: string } | null> {
    cat = this.validateCat(cat);

    const response = await api.post<{ message: string }>('cats/', cat);
    return response.data;
  }

  async delete(catId: string): Promise<{ message: string } | null> {
    const response = await api.delete<{ message: string }>('cats/' + catId);
    return response.data;
  }

  async countCats(): Promise<{ count: number }> {
    return api
      .post('cats/countCats/')
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

  async importCat(array: any): Promise<{ message: string } | null> {
    const response = await api.post('cats/import/', { 'file': array });
    return response.data;
  }

  async importDeduplication(data: any, fileName: string, timestamp: string): Promise<{ message: string } | null> {
    const response = await api.post('cats/importDeduplication/', { base64: data, fileName,
      timestamp });
    return response.data;
  }

  async runDeduplication(folderName: string, databasesString: string): Promise<{ message: string, results: Results, error?: string } | null> {
    const response = await api.post('cats/runDeduplication/', { folderName, databasesString });
    return response.data;
  }
}

export default new CatService();
