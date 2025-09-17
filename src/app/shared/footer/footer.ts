import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// Material imports
import { MatToolbarModule } from '@angular/material/toolbar';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.html',
  styleUrls: ['./footer.scss'],
  imports: [CommonModule, MatToolbarModule]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
