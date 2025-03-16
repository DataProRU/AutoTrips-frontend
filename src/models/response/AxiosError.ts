export interface AxiosError {
    response?: {
      status?: number;
      data?: {
        phone?: string[];
        telegram?: string[];
      };
    };
  }