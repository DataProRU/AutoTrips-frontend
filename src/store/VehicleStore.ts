import { makeAutoObservable, runInAction } from "mobx";
import { Vehicle } from "../models/response/Vehicle";
import VehicleService from "../services/VehicleService";

class VehicleStore {
  vehicles: Vehicle[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  async fetchVehicles() {
    this.isLoading = true;
    try {
      const response = await VehicleService.getVehicles();
      runInAction(() => {
        this.vehicles = response.data;
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }
}

const vehicleStore = new VehicleStore();
export default vehicleStore;
