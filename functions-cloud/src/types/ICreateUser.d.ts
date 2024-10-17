export interface ICreateUser {
  uid: string;
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  address: string;
  zipcode: string;
  country: string;
  state: string;
  city: string;
  role: 'ADMIN' | 'LAWYER' | 'SUPERADMIN';
  typeOfLawyer?: string;
}
