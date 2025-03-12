import { makeAutoObservable } from "mobx";

class AuthStore {
  page: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }
}

const authStore = new AuthStore();
export default authStore;