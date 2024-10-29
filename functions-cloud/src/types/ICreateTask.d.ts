export interface ICreateTask {
  taskStatus: 'PENDING' | 'COMPLETED'; // Based on status types
  taskType: 'string'; // Add more task types as needed
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // Add more priorities if applicable
  caseDetails: ICase;
  lawyerDetails: ILawyer[];
  taskName: string;
  startDate: string;
  endDate: string;
  timeLimit: string;
  taskDescription: string;
  payable?: boolean;
  amount?: number;
  clientDetails: IClientDetails;
  createdBy: ICreatorDetails;
}

interface ILawyer {
  name: string;
  email: string;
  phoneNumber: string;
  id: string;
}

interface ICase {
  caseId: string;
  caseType: string;
  petition: { petitioner: string };
  respondent: { respondentee: string };
  courtName: string;
  caseNo: string;
}

interface IClientDetails {
  name: string;
  email: string;
  phoneNumber: string;
  id: string;
}
interface ICreatorDetails {
  id: string;
  name: string;
}
