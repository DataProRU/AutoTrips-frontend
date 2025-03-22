import { makeAutoObservable } from "mobx";
import AuthService from "../services/AuthService";
import { RegisterFormData } from "../@types/RegisterFormData";

class AuthStore {
  role: string | null = null;
  isAuth: boolean = false;
  userId: number | null = null;
  approved: boolean = false;
  onboarded: boolean = false;

  page: string | null = null;
  errorMessage: string | null = null;
  isCheckingAuth = false;

  private handleError(e: unknown) {
    let message = "An unexpected error occurred.";
    console.log("Error object:", e);
    if (typeof e === "object" && e !== null && "response" in e) {
      const errorResponse = (e as { response?: { data?: { detail?: string } } })
        .response;
      if (errorResponse && errorResponse.data) {
        message = errorResponse.data.detail || "An unknown error occurred.";
      }
      if (
        message.includes("No active account found with the given credentials")
      ) {
        message = "Неправильный логин или пароль";
      }
    } else if (e instanceof Error) {
      if (e.message.includes("Network Error")) {
        message = "Ошибка подключения к серверу";
      } else {
        message = e.message;
      }
    }
    this.setError(message);
    console.log(message);
  }

  constructor() {
    makeAutoObservable(this);
  }

  setUserId(userId: number | null) {
    this.userId = userId;
  }

  setAuth(auth: boolean) {
    this.isAuth = auth;
  }

  setApproved(approved: boolean) {
    this.approved = approved;
  }

  setOnboarded(onboarded: boolean) {
    this.onboarded = onboarded;
  }

  setRole(role: string | null) {
    this.role = role;
  }

  setError(message: string | null) {
    this.errorMessage = message;
  }

  async login(login: string, password: string) {
    try {
      const response = await AuthService.login(login, password);
      localStorage.setItem("access", response.data.access);
      localStorage.setItem("refresh", response.data.refresh);
      this.setAuth(true);
      this.setRole(response.data.role);
      this.setUserId(response.data.user_id);
      this.setError(null);
      this.setApproved(response.data.approved);
      this.setOnboarded(response.data.onboarded);
      return response;
    } catch (e) {
      this.handleError(e);
    }
  }

  async register(data: RegisterFormData) {
    await AuthService.register(data);
    await this.login(data.phoneNumber, data.password);
  }

  async logout() {
    try {
      //await AuthService.logout();
      this.isAuth = false;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      this.setRole(null);
      this.setUserId(null);
      this.setError(null);
      this.setAuth(false);
      this.setApproved(false);
      this.setOnboarded(false);
    } catch (e) {
      this.handleError(e);
    }
  }

  async refresh(refreshToken: string) {
    if (this.isCheckingAuth) return;
    try {
      this.isCheckingAuth = true;
      console.log("Попытка обновления токена...");
      const response = await AuthService.refresh(refreshToken);
      localStorage.setItem("access", response.data.access);
      this.setAuth(true);
      this.setError(null);
      console.log("Токен успешно обновлен");
    } catch (e) {
      console.error("Ошибка обновления токена:", e);
      this.handleError(e);
      this.setAuth(false);
    } finally {
      this.isCheckingAuth = false;
    }
  }
}

const authStore = new AuthStore();

export default authStore;
