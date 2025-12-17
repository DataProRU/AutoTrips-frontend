import { makeAutoObservable, runInAction } from "mobx";
import {
  Vehicle,
  VehicleType,
  VehicleRequest,
} from "../models/response/Vehicle";
import VehicleService from "../services/VehicleService";

class VehicleStore {
  vehicles: Vehicle[] = [];
  vehiclesTypes: VehicleType[] = [];
  currentRecord: Vehicle | null = null;
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  get vehicleTypesOptions() {
    return this.vehiclesTypes.map((vehicleType) => ({
      value: vehicleType.id.toString(),
      label: vehicleType.v_type,
    }));
  }

  async fetchVehicles(clientId: number | null = null) {
    this.isLoading = true;
    try {
      const response = await VehicleService.getVehicles(clientId);
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

  async fetchVehicle(id: number) {
    this.isLoading = true;
    try {
      const response = await VehicleService.getVehicle(id);
      runInAction(() => {
        this.currentRecord = response.data;
      });
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  async fetchVehicleTypes() {
    const response = await VehicleService.getVehiclesTypes();
    runInAction(() => {
      this.vehiclesTypes = response.data;
    });
  }

  async addVehicles(data: VehicleRequest[]) {
    await VehicleService.addVehicles(data);
  }

  async updateVehicle(id: number, updatedRecord: VehicleRequest) {
    const response = await VehicleService.updateVehicle(id, updatedRecord);
    this.vehicles = this.vehicles.map((item) =>
      item.id === response.data.id ? { ...item, ...response.data } : item
    );
  }
}

const vehicleStore = new VehicleStore();
export default vehicleStore;
