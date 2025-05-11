export interface Vehicle {
  id: number;
  client_name: string;
  brand: string;
  model: string;
  v_type_name: string;
  vin: string;
  container_number: string;
  arrival_date: string;
  transporter: string;
  recipient: string;
  comment: string | null;
  status: string;
  status_changed: string;
  creation_time: string;
}

export interface VehicleUpdate {
  client_id: number;
  brand: string;
  model: string;
  v_type_id: number;
  vin: string;
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
