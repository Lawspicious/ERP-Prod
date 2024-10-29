import { IClient, IClientProspect } from './client';

export interface ITask {
  id?: string;
  taskStatus: 'PENDING' | 'COMPLETED'; // Based on status types
  taskType: 'string'; // Add more task types as needed
  priority: 'HIGH' | 'MEDIUM' | 'LOW'; // Add more priorities if applicable
  caseDetails: ICase;
  lawyerDetails: ILawyer[];
  clientDetails?: IClientDetails | null;
  taskName: string;
  startDate: string;
  endDate: string;
  timeLimit: string;
  taskDescription: string;
  payable?: boolean;
  amount?: number;
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
  petition: { petitioner: string; advocate: string };
  respondent: { respondentee: string; advocate: string };
  courtName: string;
  caseNo: string;
}

interface IClientDetails {
  id: string;
  name: string;
  email: string;
  id: string;
  mobile: string;
}

interface ICreatorDetails {
  id: string;
  name: string;
}
