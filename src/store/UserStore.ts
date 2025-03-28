import { makeAutoObservable, runInAction } from "mobx";
import { User } from "../models/response/User";
import PhotosService from "../services/PhotosService";

class UserStore {
  users: User[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUsers() {
    const response = await PhotosService.getUsers();

    runInAction(() => {
      this.users = response.data;
    });
  }
}

const userStore = new UserStore();
export default userStore;
