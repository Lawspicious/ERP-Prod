export interface IInvoice {
  id?: string;
  billTo: 'client' | 'organization';
  clientDetails: IClientDetails;
  createdAt: string;
  dueDate: string;
  services: IService[];
  paymentStatus: 'paid' | 'unpaid';
  totalAmount: number;
  RE: IRE[];
  teamMember?: ITeamMembers | null;
  gstNote?: string;
  panNo?: string;
  paymentDate?: string;
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
  location: string;
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
