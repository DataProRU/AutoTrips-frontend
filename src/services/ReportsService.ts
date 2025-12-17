import { AcceptanceData } from "../@types/AcceptanceData";
import { AuthResponse } from "../models/response/AuthResponse";
import { CarsResponse } from "../models/response/CarsResponce";
import $api from "../setup/http";

export default class ReportsService {
  static async addReport(data: AcceptanceData) {
    const formData = new FormData();
    formData.append("vin", data.vin);
    formData.append("model", data.model);
    if (data.place) formData.append("place", data.place);
    if (data.notes) formData.append("comment", data.notes);
    formData.append("status", data.status);

    if (data.carPhotos) {
      Array.from(data.carPhotos).forEach((photo) => {
        formData.append("uploaded_car_photos", photo);
      });
    }

    if (data.keyPhotos) {
      Array.from(data.keyPhotos).forEach((photo) => {
        formData.append("uploaded_key_photos", photo);
      });
    }

    if (data.docsPhotos) {
      Array.from(data.docsPhotos).forEach((photo) => {
        formData.append("uploaded_document_photos", photo);
      });
    }

    const response = await $api.post<AuthResponse>(
      "/autotrips/reports/",
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

  static getCars() {
    return $api.get<CarsResponse>("/autotrips/reports/cars/");
  }

  static getVinReports(vin: string) {
    return $api.get(`/autotrips/reports/?vin=${vin}`);
  }
}
