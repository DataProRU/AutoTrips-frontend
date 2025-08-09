import { Client } from "./User";

export interface Vehicle {
  id: number;
  client: Client;
  brand: string;
  model: string;
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
  brand: string;
  model: string;
  v_type: number;
  vin: string;
  price: number;
  container_number: string;
  arrival_date: string;
  transporter: string;
  recipient: string;
  comment: string | null;
}

export interface VehicleType {
  id: number;
  v_type: string;
}
