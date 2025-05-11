import {
  Vehicle,
  VehicleType,
  VehicleUpdate,
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

  static updateVehicle(id: number, updatedRecord: VehicleUpdate) {
    return $api.patch<Vehicle>(`/autotrips/vehicles/${id}/`, updatedRecord);
  }
}
