interface ApiErrorData {
  [key: string]: string[];
}

export interface AxiosError<T = ApiErrorData> {
  response?: {
    status?: number;
    data?: T;
  };
}
