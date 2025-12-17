import {
  Vehicle,
  VehicleType,
  VehicleRequest,
} from "../models/response/Vehicle";
import $api from "../setup/http";

export default class VehicleService {
  static getVehicles(clientId: number | null = null) {
    const params = clientId !== null ? { client_id: clientId } : {};
    return $api.get<Vehicle[]>("/autotrips/vehicles/", { params });
  }

  static getVehicle(id: number) {
    return $api.get<Vehicle>(`/autotrips/vehicles/${id}/`);
  }

  static getVehiclesTypes() {
    return $api.get<VehicleType[]>("/autotrips/vehicles-types/");
  }

  static async addVehicles(data: VehicleRequest[]) {
    const hasFiles = data.some(
      (vehicle) =>
        vehicle.document_photos && vehicle.document_photos.length > 0
    );

    if (hasFiles) {
      const results: Vehicle[] = [];
      for (const vehicle of data) {
        const formData = new FormData();
        formData.append("client", vehicle.client.toString());
        formData.append("year_brand_model", vehicle.year_brand_model);
        formData.append("vin", vehicle.vin);
        formData.append("price", vehicle.price.toString());
        formData.append("container_number", vehicle.container_number || "");
        formData.append("transporter", vehicle.transporter || "");
        formData.append("recipient", vehicle.recipient || "");
        if (vehicle.comment) {
          formData.append("comment", vehicle.comment);
        }
        if (vehicle.v_type) {
          formData.append("v_type", vehicle.v_type.toString());
        }
        if (vehicle.arrival_date) {
          formData.append("arrival_date", vehicle.arrival_date);
        }
        if (vehicle.document_photos && vehicle.document_photos.length > 0) {
          vehicle.document_photos.forEach((photo) => {
            formData.append("uploaded_document_photos", photo);
          });
        }

        const response = await $api.post<Vehicle>(
          "/autotrips/vehicles/",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        results.push(response.data);
      }
      return { data: results } as { data: Vehicle[] };
    } else {
      const jsonData = data.map((vehicle) => ({
        ...vehicle,
        price: vehicle.price.toString(),
        document_photos: undefined, 
      }));
      return $api.post<Vehicle[]>("/autotrips/vehicles/", jsonData);
    }
  }

  static updateVehicle(id: number, updatedRecord: VehicleRequest) {
    const hasFiles =
      updatedRecord.document_photos &&
      updatedRecord.document_photos.length > 0;
    const hasRemovedPhotos =
      updatedRecord.remove_document_photo_ids &&
      updatedRecord.remove_document_photo_ids.length > 0;

    if (hasFiles || hasRemovedPhotos) {
      const formData = new FormData();
      formData.append("client", updatedRecord.client.toString());
      formData.append("year_brand_model", updatedRecord.year_brand_model);
      formData.append("vin", updatedRecord.vin);
      formData.append("price", updatedRecord.price.toString());
      formData.append("container_number", updatedRecord.container_number || "");
      formData.append("transporter", updatedRecord.transporter || "");
      formData.append("recipient", updatedRecord.recipient || "");
      if (updatedRecord.comment) {
        formData.append("comment", updatedRecord.comment);
      }
      if (updatedRecord.v_type) {
        formData.append("v_type", updatedRecord.v_type.toString());
      }
      if (updatedRecord.arrival_date) {
        formData.append("arrival_date", updatedRecord.arrival_date);
      }

      if (
        updatedRecord.document_photos &&
        updatedRecord.document_photos.length > 0
      ) {
        updatedRecord.document_photos.forEach((photo) => {
          formData.append("uploaded_document_photos", photo);
        });
      }

      if (hasRemovedPhotos) {
        updatedRecord.remove_document_photo_ids!.forEach((photoId) => {
          formData.append("remove_document_photo_ids", photoId.toString());
        });
      }

      return $api.patch<Vehicle>(`/autotrips/vehicles/${id}/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    } else {
      const jsonData = {
        ...updatedRecord,
        price: updatedRecord.price.toString(),
        document_photos: undefined,
      };
      return $api.patch<Vehicle>(`/autotrips/vehicles/${id}/`, jsonData);
    }
  }
}
