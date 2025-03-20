import { RegisterFormData } from "../@types/RegisterFormData";
import { AuthResponse } from "../models/response/AuthResponse";
import $api from "../setup/http";

export default class AuthService {
  static async login(login: string, password: string) {
    return $api.post<AuthResponse>(
      "/accounts/token/",
      { phone: login, password },
      { headers: { "Content-Type": "application/json" } }
    );
  }

  static async register(data: RegisterFormData) {
    const formData = new FormData();
    formData.append("full_name", data.fullName);
    formData.append("phone", data.phoneNumber);
    formData.append("telegram", data.telegramLogin);
    formData.append("password", data.password);
    formData.append("confirm_password", data.confirmPassword);

    if (data.identityPhotos) {
      Array.from(data.identityPhotos).forEach((photo) => {
        formData.append("uploaded_images", photo);
      });
    }

    const response = await $api.post<AuthResponse>(
      "/accounts/register/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: false,
      }
    );

    return response;
  }

  static async logout() {
    return $api.post("/accounts/logout");
  }

  static async refresh(refreshToken: string) {
    return $api.post<AuthResponse>("/accounts/token/refresh/", { refresh: refreshToken });
  }
}
