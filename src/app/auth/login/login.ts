// src/app/auth/login/login.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { fadeInOut } from '../../animations';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  animations: [fadeInOut]
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;
  errorMessage: string | null = null;
  private errorTimeout: any;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]]
    });

    // Auto-redirect if already logged in
    this.auth.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    // Reset previous error + timer
    this.errorMessage = null;
    if (isPlatformBrowser(this.platformId)) {
      clearTimeout(this.errorTimeout);
    }

    const { email, password } = this.form.value;
    const result = await this.auth.login(email, password);

    if (result.success) {
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage = result.message;

      if (isPlatformBrowser(this.platformId)) {
        // Auto fade-out after 3s (browser only)
        this.errorTimeout = setTimeout(() => {
          this.errorMessage = null;
        }, 3000);
      }
    }
  }

  goToRegister(event: Event) {
    if (isPlatformBrowser(this.platformId) && event) {
      event.preventDefault();
    }
    this.router.navigate(['/register']);
  }
}
