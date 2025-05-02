export type RegisterFormData = {
  fullName: string;
  phoneNumber: string;
  telegramLogin: string;
  identityPhotos?: FileList;
  password: string;
  confirmPassword: string;
};

export type RegisterClientFormData = {
  fullName: string;
  company: string;
  phoneNumber: string;
  telegramLogin: string;
  address: string;
  email: string;
  password: string;
  confirmPassword: string;
}
