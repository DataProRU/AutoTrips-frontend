import { makeAutoObservable, runInAction, toJS } from "mobx";
import ReportsService from "../services/ReportsService";
import dayjs from "dayjs";
import { Report } from "../models/response/Report";

interface VinData {
  [vin: string]: string;
}

class ReportsStore {
  vins: VinData = {};
  vinReports: Report[] = [];

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

  async fetchVinReports(vin: string) {
    try {
      const response = await ReportsService.getVinReports(vin);
      runInAction(() => {
        this.vinReports = response.data;
      });
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  }

  get vinOptions() {
    return Object.entries(this.vins).map(([vin]) => ({
      value: vin,
      label: vin,
    }));
  }

  get reportDatesOptions() {
    return this.vinReports.map(report => {
      const plainReport: Report = {
        ...report
      };
      return {
        value: String(plainReport.id),
        label: dayjs(report.acceptance_date).format('DD.MM.YYYY') || "No date",
        rawReport: toJS(plainReport) as Report
      };
    });
  }
}

const reportsStore = new ReportsStore();
export default reportsStore;