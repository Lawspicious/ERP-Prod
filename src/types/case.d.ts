import { Timestamp } from '@google-cloud/firestore';

export interface ICase {
  caseId?: string;
  caseNo: string;
  caseType: string;
  regDate: string;
  CNRNo: string;
  hearings?: IDate[];
  nextHearing: 'YYYY-MM-DD';
  decision: string;
  caseStatus: 'RUNNING' | 'DECIDED';
  courtName: string;
  reference: string;
  petition: { petitioner: string };
  respondent: { respondentee: string };
  caseFiles: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  lawyerActionStatus: string;
  lawyer: ILawyer;
  clientDetails: IClientDetails;
  createdAt?: Timestamp;
}

interface IDate {
  date: string;
  remarks: string;
}

interface ILawyer {
  name: string;
  email: string;
  phoneNumber: string;
  id: string;
}

interface IClientDetails {
  name: string;
  email: string;
  id: string;
  mobile: string;
}
