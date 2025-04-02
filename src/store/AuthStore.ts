import { makeAutoObservable } from "mobx";
import AuthService from "../services/AuthService";
import { RegisterFormData } from "../@types/RegisterFormData";
import { jwtDecode } from "jwt-decode";
import i18n from "i18next"; 

interface JwtPayload {
  user_id: number;
  role: string;
  exp: number;
  iat?: number;
  approved: boolean;
  onboarded: boolean;
}

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
    let message = i18n.t("authStore.errors.unexpectedError"); 
    console.log("Error object:", e);
    if (typeof e === "object" && e !== null && "response" in e) {
      const errorResponse = (e as { response?: { data?: { detail?: string } } })
        .response;
      if (errorResponse && errorResponse.data) {
        message = errorResponse.data.detail || i18n.t("authStore.errors.unknownError");
      }
      if (
        message.includes("No active account found with the given credentials")
      ) {
        message = i18n.t("authStore.errors.invalidCredentials");
      }
    } else if (e instanceof Error) {
      if (e.message.includes("Network Error")) {
        message = i18n.t("authStore.errors.networkError");
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

  decodeToken(token: string | null): JwtPayload | null {
    if (!token) return null;
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      return decoded;
    } catch (e) {
      console.error("Ошибка декодирования JWT:", e);
      this.setError(i18n.t("authStore.errors.invalidToken"));
      return null;
    }
  }

  async login(login: string, password: string) {
    try {
      const response = await AuthService.login(login, password);
      const accessToken = response.data.access;
      localStorage.setItem("access", accessToken);
      localStorage.setItem("refresh", response.data.refresh);
      this.setAuth(true);
      const decoded = this.decodeToken(accessToken);
      if (decoded) {
        this.setRole(decoded.role);
        this.setUserId(decoded.user_id);
        this.setApproved(decoded.approved);
        this.setOnboarded(decoded.onboarded);
      }
      this.setError(null);
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
      this.isAuth = false;
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      this.setRole(null);
      this.setUserId(null);
      this.setError(null);
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
      const accessToken = response.data.access;
      localStorage.setItem("access", accessToken);
      const decoded = this.decodeToken(accessToken);
      if (decoded) {
        this.setRole(decoded.role);
        this.setUserId(decoded.user_id);
        this.setApproved(decoded.approved);
        this.setOnboarded(decoded.onboarded);
        console.log(decoded.onboarded);
      }
      this.setAuth(true);
      this.setError(null);
      console.log("Токен успешно обновлен");
    } catch (e) {
      console.error("Ошибка обновления токена:", e);
      this.handleError(e);
      this.setAuth(false);
      this.setRole(null);
    } finally {
      this.isCheckingAuth = false;
    }
  }

  async onboard() {
    try {
      await AuthService.onboard();
      this.setOnboarded(true);
    } catch {
      this.setOnboarded(false);
    }
  }
}

const authStore = new AuthStore();

export default authStore;