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
      this.setAuth(true);

      console.log(response.status);
      
    } catch (e) {
      console.error("Error while logging in:", e);
    }
  }

  async register(data: RegisterFormData) {

    console.log(data);
    
    try {
      const response = await AuthService.register(data);
      localStorage.setItem("accessToken", response.data.accessToken);
      this.setAuth(true);

      console.log(response.status);
      
    } catch (e) {
      console.error("Error while logging in:", e);
    }
  }
}

const authStore = new AuthStore();
export default authStore;
