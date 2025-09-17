import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { fadeIn } from '../../animations';

// Material imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-logout',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule],
  templateUrl: './logout.html',
  styleUrls: ['./logout.scss'],
  animations: [fadeIn]
})
export class LogoutComponent implements OnInit {
  constructor(private auth: AuthService, private router: Router) {}

  async ngOnInit() {
    if (confirm('Are you sure you want to logout?')) {
      await this.auth.logout();
      this.router.navigate(['/home']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }
}
