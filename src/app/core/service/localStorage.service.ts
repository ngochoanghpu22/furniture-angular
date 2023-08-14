export class LocalStorageService {
    public baseUrl: string = '';
  
    setItem (key: any, value: any) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    getItem (key: any) {
        const data = localStorage.getItem(key);
        return data;
    }
  }