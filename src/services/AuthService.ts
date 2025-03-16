import { RegisterFormData } from "../@types/RegisterFormData";
import { AuthResponse } from "../models/response/AuthResponse";
import apiInstance from "../setup/http";
import axios, { AxiosResponse } from "axios";

export default class AuthService {
  static async login(
    email: string,
    password: string
  ): Promise<AxiosResponse<AuthResponse>> {
    try {
      return await apiInstance.post<AuthResponse>(
        "/auth/login",
        { email, password },
        { headers: { "Content-Type": "application/json" } }
      );
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
          
        return await axios.post<AuthResponse>(
          "http://127.0.0.1:8000/api/v1/accounts/register/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
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
    return apiInstance.post("/auth/logout");
  }
}
