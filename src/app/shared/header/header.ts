// src/app/shared/header/header.component.ts
import { Component, Inject, PLATFORM_ID, OnInit } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FirebaseService } from '../../services/firebase.service';
import { Observable } from 'rxjs';
import { User } from 'firebase/auth';
import { UserModel } from '../../models/user.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent implements OnInit {
  user$!: Observable<User | null>;
  public userName: string = ''; // default

  theme: string = 'light'; // SSR-safe theme support

  constructor(
    public auth: AuthService,
    private fbService: FirebaseService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // SSR-safe theme restore
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme) {
        this.theme = savedTheme;
        document.body.classList.add(this.theme);
      }
    }

    // Subscribe to auth.user$
    this.auth.user$.subscribe(async (user) => {
      if (user) {
        try {
          const userModel: UserModel | null = await this.fbService.getUser(user.uid);
          this.userName = userModel?.name || user.displayName || 'User';
        } catch (error) {
          console.error('Error fetching user data:', error);
          this.userName = user.displayName || 'User';
        }
      } else {
        this.userName = '';
      }
    });
  }

  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      document.body.className = '';
      document.body.classList.add(this.theme);
      localStorage.setItem('theme', this.theme);
    }
  }

  async logout() {
    if (isPlatformBrowser(this.platformId)) {
      const confirmed = confirm('Do you want to logout?');
      if (!confirmed) return;
    }

    await this.auth.logout();

    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('userToken');
    }

    this.router.navigate(['/home']);
  }

  navigateTo(path: string) {
    this.router.navigate([path]);
  }
}
