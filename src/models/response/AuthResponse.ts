export interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  role: string | null;
  approved: boolean;
  onboarded: boolean;
}
