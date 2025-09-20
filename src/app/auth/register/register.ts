// src/app/auth/register/register.component.ts
import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormGroup,
  AbstractControl,
  ValidationErrors
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FirebaseService } from '../../services/firebase.service';
import { DEPARTMENTS } from '../../services/data.constants';
import { fadeIn, fadeInOut } from '../../animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
  animations: [fadeInOut, fadeIn]
})
export class RegisterComponent implements OnInit {
  departments = DEPARTMENTS;
  form!: FormGroup;
  passwordStrength = '';
  passwordEmoji = '';
  showPassword = false;

  // error/success messages
  formMessage: string | null = null;
  formMessageType: 'error' | 'success' | null = null;
  formMessageVisible = false;

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router,
    private fbService: FirebaseService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      srn: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{8}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
      department: ['', Validators.required],
      level: ['', Validators.required],
      course: ['', Validators.required],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
          Validators.maxLength(50),
          this.passwordValidator.bind(this)
        ]
      ]
    });

    this.form.get('level')?.valueChanges.subscribe(() => this.updateCourseControl());
    this.form.get('department')?.valueChanges.subscribe(() => this.updateCourseControl());

    this.form.get('password')?.valueChanges.subscribe(pw => {
      this.updatePasswordStrength(pw || '');
    });

    this.updateCourseControl();
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;
    const errors: any = {};
    if (!/[A-Z]/.test(value)) errors.upper = true;
    if (!/[a-z]/.test(value)) errors.lower = true;
    if (!/\d/.test(value)) errors.digit = true;
    if (!/[!@#$%^&*]/.test(value)) errors.special = true;
    return Object.keys(errors).length ? { passwordRequirements: errors } : null;
  }

  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      this.passwordEmoji = '';
      return;
    }
    let strength = 0;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*]/.test(password)) strength++;

    if (strength <= 1) {
      this.passwordStrength = 'Weak';
      this.passwordEmoji = '😞';
    } else if (strength === 2) {
      this.passwordStrength = 'Medium';
      this.passwordEmoji = '😐';
    } else {
      this.passwordStrength = 'Strong';
      this.passwordEmoji = '😊';
    }
  }

  updateCourseControl() {
    const courseControl = this.form.get('course');
    if (!this.filteredCourses.length) {
      courseControl?.disable({ emitEvent: false });
      courseControl?.setValue('', { emitEvent: false });
    } else {
      courseControl?.enable();
    }
  }

  get filteredCourses(): string[] {
    const department = this.form.get('department')?.value;
    const level = this.form.get('level')?.value;
    if (!department || !level) return [];
    const dep = this.departments.find(d => d.name === department);
    return level === 'UG' ? dep?.ug || [] : dep?.pg || [];
  }

  public async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, ...other } = this.form.value;

    const result = await this.auth.register(email, password, {
      name: other.name,
      srn: other.srn,
      email,
      phone: other.phone,
      school: other.department,
      department: other.course
    });

    if (result.success) {
      this.showMessage(result.message, 'success', true);
    } else {
      this.showMessage(result.message, 'error');
    }
  }

  public goToLogin(event: Event) {
    if (isPlatformBrowser(this.platformId)) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);
  }

  private showMessage(msg: string, type: 'error' | 'success' = 'error', navigate = false) {
    this.formMessage = msg;
    this.formMessageType = type;
    this.formMessageVisible = true;

    if (isPlatformBrowser(this.platformId)) {
      // Start fade-out after 5 seconds only on browser
      setTimeout(() => {
        this.formMessageVisible = false;
        setTimeout(() => {
          this.formMessage = null;
          this.formMessageType = null;
        }, 500);
      }, 5000);

      if (navigate) {
        setTimeout(() => this.router.navigate(['/login']), 1200);
      }
    } else if (navigate) {
      // On server just navigate instantly
      this.router.navigate(['/login']);
    }
  }
}
