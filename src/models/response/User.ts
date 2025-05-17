import { Photo } from "./Photo";

export interface User {
  id: number;
  full_name: string;
  phone: string;
  telegram: string;
  role: string;
  is_approved: boolean;
  is_onboarded: boolean;
  documents: Photo[];
}

export interface Client {
  id: number;
  full_name: string;
  email: string;
  telegram: string;
  phone: string;
  company: string | null;
  address: string | null;
}
