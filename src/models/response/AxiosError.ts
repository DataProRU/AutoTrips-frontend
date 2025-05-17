interface Error {
  error_type: string;
  message: string;
}

interface ApiErrorData {
  [key: string]: Error;
}

export interface AxiosError<T = ApiErrorData> {
  response?: {
    status?: number;
    data?: T;
  };
}
