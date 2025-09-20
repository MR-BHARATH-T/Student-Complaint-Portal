// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User,
  UserCredential,
  onAuthStateChanged,
} from '@angular/fire/auth';
import { ReplaySubject, Observable } from 'rxjs';
import { FirebaseService } from './firebase.service';
import { UserModel } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new ReplaySubject<User | null>(1);
  user$: Observable<User | null> = this.userSubject.asObservable();

  constructor(private auth: Auth, private fbService: FirebaseService) {
    onAuthStateChanged(this.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  /** 🔹 Registration with Firestore write + unified return */
  async register(
  email: string,
  password: string,
  userData: Omit<UserModel, 'uid' | 'createdAt'>
): Promise<{ success: boolean; message: string }> {
  try {
    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const uid = cred.user.uid;

    const user: UserModel = { uid, ...userData, email, createdAt: new Date() };
    await this.fbService.createUser(user);

    await signOut(this.auth);

    return { success: true, message: 'Registration successful! Please log in.' };
  } catch (err: any) {
    let message = 'Registration failed. Please try again.';

    switch (err.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered. Please try logging in.';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email format.';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 8 characters.';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later.';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password authentication is not enabled. Contact support.';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection and try again.';
        break;
      default:
        if (err.code === 'permission-denied') {
          message = 'Firestore permission denied – check Firestore rules.';
        } else if (err.message) {
          message = err.message;
        }
    }

    return { success: false, message };
  }
}


  /** 🔹 Login + unified return */
  async login(
  email: string,
  password: string
): Promise<{ success: boolean; message: string }> {
  try {
    await signInWithEmailAndPassword(this.auth, email, password);
    return { success: true, message: 'Login successful!' };
  } catch (err: any) {
    switch (err.code) {
      case 'auth/user-not-found':
        return { success: false, message: 'This email is not registered. Please sign up first.' };
      case 'auth/invalid-email':
        return { success: false, message: 'Invalid email format.' };
      case 'auth/wrong-password':
        return { success: false, message: 'Incorrect password. Please try again.' };
      case 'auth/user-disabled':
        return { success: false, message: 'This account has been disabled.' };
      case 'auth/too-many-requests':
        return { success: false, message: 'Too many failed attempts. Please try again later.' };
      case 'auth/operation-not-allowed':
        return { success: false, message: 'Email/password authentication is not enabled. Contact support.' };
      case 'auth/network-request-failed':
        return { success: false, message: 'Network error. Please check your connection and try again.' };
      default:
        return { success: false, message: 'Login failed. Please try again.' };
    }
  }
}


  /** 🔹 Logout */
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.userSubject.next(null);
  }
}
