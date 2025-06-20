export interface IInvoice {
  id?: string;
  billTo: 'client' | 'organization';
  clientDetails?: IClientDetails | null;
  createdAt: string;
  dueDate: string;
  services: IService[];
  paymentStatus: 'paid' | 'unpaid' | 'rejected';
  totalAmount: number;
  invoiceType?: 'abhradip' | 'lawspicious' | null;
  RE: IRE[];
  teamMember?: ITeamMembers[] | null;
  gstNote?: string;
  panNo?: string;
  paymentDate?: string;
  rejectionDate?: string;
  remark?: string;
  tasks?: {
    name: string;
    id: string;
  }[];
}

export interface IService {
  name: string;
  description: string;
  amount: number;
}
interface IClientDetails {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  location?: string;
}

interface IRE {
  caseId: string;
}

interface ITeamMembers {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
}

// interface IBankDetails {
//   bankName: string;
//   accNo: string;
//   ifsc: string;
//   pan: string;
// }
