import { Reporter } from "./Reporter";
import { ReportPhoto } from "./ReportPhoto";

export interface Report {
  id: number;
  vin: string;
  reporter: Reporter;
  model: string;
  place: string;
  comment: string;
  report_number: number;
  report_time: string;
  acceptance_date: string;
  status: string;
  car_photos: ReportPhoto[];
  key_photos: ReportPhoto[];
  document_photos: ReportPhoto[];
}
