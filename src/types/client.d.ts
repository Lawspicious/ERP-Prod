// types/clientData.ts

export interface IClient {
  id?: string; // Optional field
  name: string;
  email: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  address: string;
  country: string;
  state: string;
  city: string;
  clientType: 'normal';
  rating: number;
  createdAt?: string | number;
  remark: string;
}

export interface IClientProspect {
  id?: string;
  name: string;
  email: string;
  mobile: string;
  location: string;
  followUp: boolean;
  nextFollowUpDate?: string;
  source: 'Website' | 'Social Media' | 'Newspaper' | 'Friends' | 'Others';
  gender: 'Male' | 'Female' | 'Other';
  service: string;
  client_feedback: string;
  status: 'ACTIVE' | 'IN ACTIVE';
  clientType: 'prospect';
  rating: number;
  createdAt?: string | number;
  remark: string;
}
