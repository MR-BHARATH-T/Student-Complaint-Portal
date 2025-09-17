import { Injectable, inject } from '@angular/core';
import { Firestore, doc, setDoc, getDoc, collection, addDoc, getDocs, updateDoc, deleteDoc, serverTimestamp, DocumentReference, CollectionReference, query } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { UserModel } from '../models/user.model';
import { ComplaintModel } from '../models/complaint.model';

@Injectable({ providedIn: 'root' })
export class FirebaseService {
  private db: Firestore = inject(Firestore); // keep private
  public auth: Auth = inject(Auth);

  // Users
  async createUser(user: UserModel) {
  if (!user.uid) throw new Error("UID required");
  const userRef = doc(this.db, 'users', user.uid);
  await setDoc(userRef, { ...user, createdAt: serverTimestamp() });
}

  async getUser(uid: string): Promise<UserModel | null> {
    const userRef: DocumentReference = doc(this.db, 'users', uid);
    const snap = await getDoc(userRef);
    return snap.exists() ? { ...snap.data() as UserModel, uid } : null;
  }

  // Complaints
  async saveComplaint(complaint: Omit<ComplaintModel, 'id' | 'createdAt'>) {
  if (!complaint.uid) throw new Error("UID required");
  const userDocRef = doc(this.db, 'users', complaint.uid);
  const complaintsRef = collection(userDocRef, 'complaints');
  const docRef = await addDoc(complaintsRef, { ...complaint, status: 'pending', createdAt: serverTimestamp() });
  return docRef.id;
}

  async getUserComplaints(uid: string): Promise<ComplaintModel[]> {
    const userDocRef: DocumentReference = doc(this.db, 'users', uid);
    const complaintsRef: CollectionReference = collection(userDocRef, 'complaints');
    const q = query(complaintsRef);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data() as ComplaintModel, id: d.id }));
  }

  async updateComplaint(uid: string, complaintId: string, updates: Partial<ComplaintModel>) {
    const complaintRef: DocumentReference = doc(this.db, 'users', uid, 'complaints', complaintId);
    await updateDoc(complaintRef, { ...updates, updatedAt: serverTimestamp() });
  }

  async deleteComplaint(uid: string, complaintId: string) {
    const complaintRef: DocumentReference = doc(this.db, 'users', uid, 'complaints', complaintId);
    await deleteDoc(complaintRef);
  }
}
