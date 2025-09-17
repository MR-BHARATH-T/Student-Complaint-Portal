import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { ComplaintModel } from '../models/complaint.model';

@Injectable({ providedIn: 'root' })
export class ComplaintService {

  constructor(private fbService: FirebaseService) {}

  async addComplaint(complaint: Omit<ComplaintModel, 'id' | 'status' | 'createdAt'>): Promise<string> {
    return this.fbService.saveComplaint({ ...complaint, status: 'pending' } as ComplaintModel);
  }

  async listComplaints(uid: string): Promise<ComplaintModel[]> {
    return this.fbService.getUserComplaints(uid);
  }

  async updateComplaint(uid: string, complaintId: string, updates: Partial<ComplaintModel>): Promise<void> {
    return this.fbService.updateComplaint(uid, complaintId, updates);
  }

  async deleteComplaint(uid: string, complaintId: string): Promise<void> {
    return this.fbService.deleteComplaint(uid, complaintId);
  }
}
