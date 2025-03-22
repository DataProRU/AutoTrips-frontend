import { makeAutoObservable, runInAction } from "mobx";
import ReportsService from "../services/ReportsService";

interface VinData {
  [vin: string]: string;
}

class ReportsStore {
  vins: VinData = {};

  constructor() {
    makeAutoObservable(this);
  }

  async fetchCars() {
    try {
      const response = await ReportsService.getCars();
      const data = response.data;
      runInAction(() => {
        this.vins = data.vins || {};
      });
    } catch (error) {
      console.error("Ошибка получения автомобилей:", error);
    }
  }

  get vinOptions() {
    return Object.entries(this.vins).map(([vin]) => ({
      value: vin,
      label: vin,
    }));
  }
}

const reportsStore = new ReportsStore();
export default reportsStore;
