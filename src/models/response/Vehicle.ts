import { Client } from "./User";

export interface Vehicle {
  id: number;
  client: Client;
  year_brand_model: string;
  v_type: VehicleType;
  vin: string;
  price: number,
  container_number: string;
  arrival_date: string;
  transporter: string;
  recipient: string;
  comment: string | null;
  status: string;
  status_changed: string;
  creation_time: string;
}

export interface VehicleResponce {
  client: number;
  year_brand_model: string;
  v_type: number;
  vin: string;
  price: number;
  container_number: string;
  arrival_date: string;
  transporter: string;
  recipient: string;
  comment: string | null;
}

export type VehicleRequest = Omit<VehicleResponce, "arrival_date" | "v_type"> & {
  arrival_date?: string;
  v_type?: number;
};

export interface VehicleType {
  id: number;
  v_type: string;
}
