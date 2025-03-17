import { makeAutoObservable } from "mobx";
import AuthService from "../services/AuthService";
import { RegisterFormData } from "../@types/RegisterFormData";

class AuthStore {
  page: string | null = null;
  isAuth: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setAuth(auth: boolean) {
    this.isAuth = auth;
  }

  async login(login: string, password: string) {
    try {
      const response = await AuthService.login(login, password);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      this.setAuth(true);

      console.log(response.status);
    } catch (e) {
      console.error("Error while logging in:", e);
    }
  }

  async register(data: RegisterFormData) {
    try {
      const response = await AuthService.register(data);

      if (response.status === 201) {
        await this.login(data.phoneNumber, data.password);
      }
      this.setAuth(true);
    } catch (e) {
      console.error("Error while registering:", e);
    }
  }

  async logout() {
    try {
      // await AuthService.logout();
      this.isAuth = false;
      localStorage.removeItem("access"); 
      localStorage.removeItem("refresh"); 
    } catch (error) {
      console.error("Failed to logout:", error);
    }
  }
}

const authStore = new AuthStore();

export default authStore;
