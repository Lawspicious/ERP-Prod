interface ClientDetails {
  name: string;
  email: string;
  mobile: string;
  id: string;
}

interface LawyerDetails {
  name: string;
  phoneNumber: string;
  email: string;
  id: string;
}

export interface IAppointment {
  id?: string;
  time: string;
  date: string;
  location: string;
  clientDetails?: ClientDetails | null;
  lawyerDetails: LawyerDetails;
  status: 'PENDING' | 'COMPLETED';
  description: string;
  otherRelatedTo: string;
}
