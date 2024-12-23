import { IUser } from './user';

export interface INote {
  id: string;
  title: string;
  content: string;
  sortOrder: string;
  createdAt: string;
  updatedAt: string;
  createdBy: IUser;
}
