import { RegisterFormData } from "../@types/RegisterFormData";
import { AuthResponse } from "../models/response/AuthResponse";
import $api from "../setup/http";
import { AxiosResponse } from "axios";

export default class AuthService {
  static async login(
    login: string,
    password: string
  ): Promise<AxiosResponse<AuthResponse>> {
    try {
      const response = await $api.post<AuthResponse>(
        "/accounts/token/",
        { phone: login, password },
        { headers: { "Content-Type": "application/json" } }
      );
      if (response.status === 200) {
        window.location.href = "/regards";
      }
      return response;
    } catch (error) {
      console.error("Error during login request:", error);
      throw error;
    }
  }

  static async register(
    data: RegisterFormData
  ): Promise<AxiosResponse<AuthResponse>> {
    try {
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
        }
      );

      if (response.status === 201) {
        const login = data.phoneNumber;
        const password = data.password;
        await AuthService.login(login, password);
      }
      return response;
    } catch (error: any) {
      if (error.response) {
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        console.error("No response from server:", error.request);
      } else {
        console.error("Request setup error:", error.message);
      }
      throw error;
    }
  }

  static async logout() {
      try {
        const response = await $api.post("/accounts/logout");
        return response.data;
      } catch (error) {
        console.error("Logout error:", error);
        throw error;
      }
    }
}
