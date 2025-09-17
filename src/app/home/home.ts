import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from 'firebase/auth';
import { fadeIn, slideIn } from '../animations';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
  animations: [fadeIn, slideIn]
})
export class HomeComponent implements OnInit {
  user: User | null = null;
  isLoggedIn = false;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.auth.user$.subscribe((user) => {
      this.user = user;
      this.isLoggedIn = !!user;
    });
  }

  logout() {
    this.auth.logout().then(() => {
      this.router.navigate(['/home']);
    });
  }
}
