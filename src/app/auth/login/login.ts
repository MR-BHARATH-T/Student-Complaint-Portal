import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { fadeIn } from '../../animations';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, ReactiveFormsModule],
  animations: [fadeIn]
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50)]]
    });

    // If already logged in, navigate to dashboard
    this.auth.user$.subscribe(user => {
      if (user) {
        this.router.navigate(['/dashboard']);
      }
    });
  }

  async submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    try {
      await this.auth.login(this.form.value.email, this.form.value.password);
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error(err);
      let message = 'Login failed';
      if (err.code === 'auth/invalid-credential') {
        message = 'Invalid email or password';
      } else if (err.code === 'auth/user-not-found') {
        message = 'User not found. Please register first.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'Wrong password';
      } else if (err.code === 'auth/invalid-email') {
        message = 'Invalid email format';
      }
      alert(message);
    }
  }

  goToRegister(event: Event) {
    if (event) {
      event.preventDefault(); // prevent page reload
    }
    this.router.navigate(['/register']);
  }
}
