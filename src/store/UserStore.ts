import { makeAutoObservable, runInAction } from "mobx";
import { User } from "../models/response/User";
import PhotosService from "../services/PhotosService";

class UserStore {
  users: User[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchUsers() {
    const response = await PhotosService.getUsers();

    runInAction(() => {
      this.users = response.data;
    });
  }

  async fetchСlients() {
    this.isLoading = true;
    try {
      const response = await PhotosService.getClients();
      runInAction(() => {
        this.users = response.data;
      });
    } catch (error) {
      console.error("Error fetching clients:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  get usersOptions() {
    return this.users.map((user) => ({
      value: user.id.toString(),
      label: user.full_name,
    }));
  }
}

const userStore = new UserStore();
export default userStore;
