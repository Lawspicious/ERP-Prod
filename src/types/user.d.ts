export interface IUser {
  id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  zipcode: string;
  country: string;
  state: string;
  city: string;
  role: 'ADMIN' | 'LAWYER' | 'SUPERADMIN';
  typeOfLawyer?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}
