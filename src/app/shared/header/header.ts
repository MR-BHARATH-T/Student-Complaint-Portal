import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-header',
  standalone: true,
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
  imports: [CommonModule, RouterModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
})
export class HeaderComponent implements OnInit {
  userName: string | null = null;
  user$: Observable<User | null>;

  constructor(public auth: AuthService, private router: Router, private fbService: FirebaseService) {
    this.user$ = this.auth.user$;
  }

  ngOnInit() {
    // Subscribe to auth state changes
    this.auth.user$.subscribe(async (user: User | null) => {
      if (user?.uid) {
        // Use FirebaseService to get user document
        const userData = await this.fbService.getUser(user.uid);
        this.userName = userData?.name || null;
      } else {
        this.userName = null;
      }
    });
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/home']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
