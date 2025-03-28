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
