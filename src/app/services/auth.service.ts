import { Injectable } from '@angular/core';
import { FirebaseService } from './firebase.service';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, User, UserCredential, onAuthStateChanged } from 'firebase/auth';
import { ReplaySubject, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private userSubject = new ReplaySubject<User | null>(1);
  user$: Observable<User | null> = this.userSubject.asObservable();
  
  constructor(private fbService: FirebaseService) {
    onAuthStateChanged(this.fbService.auth, (user) => {
      this.userSubject.next(user);
    });
  }

  register(email: string, password: string): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.fbService.auth, email, password);
  }

  login(email: string, password: string): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.fbService.auth, email, password);
  }

  logout(): Promise<void> {
    return this.fbService.auth.signOut().then(() => {
      this.userSubject.next(null);
    });
  }
}
