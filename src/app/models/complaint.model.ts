export interface ComplaintModel {
  id?: string;
  uid?: string;
  title: string;
  date: string;
  category: string;
  description: string;
  status: 'pending' | 'in-progress' | 'resolved';
  createdAt?: any;
  updatedAt?: any;
}
