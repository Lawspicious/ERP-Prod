export interface ICreateCase {
  caseId?: string;
  caseNo: string;
  reference: string;
  lawyerActionStatus: string;
  caseType: string;
  fillingNo: string | number;
  regNo: string;
  regDate: string;
  CNRNo: string;
  hearings: IDate[];
  nextHearing: 'string';
  decision: string;
  caseStatus: 'RUNNING' | 'ABANDONED' | 'DECIDED';
  judge?: string;
  courtName: string;
  petition: { petitioner: string; advocate: string };
  respondent: { respondentee: string; advocate: string };
  FIR: IFIR;
  caseFiles: string;
  priority?: 'HIGH' | 'MEDIUM' | 'LOW';
  lawyer: ILawyer;
  clientDetails: IClientDetails;
}

interface IDate {
  date: string;
  remarks: string;
}

interface IFIR {
  FIRNo: string;
  policeStation: string;
  FIRDate: string;
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
  phoneNumber: string;
}
