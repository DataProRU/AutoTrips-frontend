import { Vehicle } from "../models/response/Vehicle";
import $api from "../setup/http";

export default class VehicleService {
  static getVehicles() {
    return $api.get<Vehicle[]>("/autotrips/vehicles/");
  }
}
