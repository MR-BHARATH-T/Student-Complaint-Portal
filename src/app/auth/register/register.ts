import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { doc, setDoc } from 'firebase/firestore';
import { FirebaseService } from '../../services/firebase.service';
import { UserModel } from '../../models/user.model';
import { DEPARTMENTS } from '../../services/data.constants';
import { fadeIn } from '../../animations';

 @Component({
   selector: 'app-register',
   standalone: true,
   imports: [
     CommonModule,
     ReactiveFormsModule
   ],
   templateUrl: './register.html',
   styleUrls: ['./register.scss'],
   animations: [fadeIn]
 })
export class RegisterComponent implements OnInit {
  departments = DEPARTMENTS;
  form!: FormGroup;
  passwordStrength = '';
  passwordEmoji = '';
  showPassword = false;

  constructor(private fb: FormBuilder, private auth: AuthService, private router: Router, private fbService: FirebaseService) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z\s]+$/)]],
      srn: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9]{8}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9._%+-]+@gmail\.com$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^[6-9][0-9]{9}$/)]],
      department: ['', Validators.required],
      level: ['', Validators.required],
      course: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(50), this.passwordValidator.bind(this)]]
    });

    // Subscribe to level changes to update course
    this.form.get('level')?.valueChanges.subscribe(() => {
      this.form.get('course')?.setValue('');
    });

    // Subscribe to department and level changes to update course control
    this.form.get('department')?.valueChanges.subscribe(() => {
      this.updateCourseControl();
    });
    this.form.get('level')?.valueChanges.subscribe(() => {
      this.updateCourseControl();
    });

    // Real-time password strength
    this.form.get('password')?.valueChanges.subscribe(password => {
      this.updatePasswordStrength(password || '');
    });

    // Initial course control state
    this.updateCourseControl();
  }

  passwordValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasDigit = /\d/.test(value);
    const hasSpecial = /[!@#$%^&*]/.test(value);

    const errors: any = {};
    if (!hasUpper) errors.upper = true;
    if (!hasLower) errors.lower = true;
    if (!hasDigit) errors.digit = true;
    if (!hasSpecial) errors.special = true;

    return Object.keys(errors).length ? { passwordRequirements: errors } : null;
  }

  updatePasswordStrength(password: string) {
    if (!password) {
      this.passwordStrength = '';
      this.passwordEmoji = '';
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);
    const hasSpecial = /[!@#$%^&*]/.test(password);

    let strength = 0;
    if (hasUpper) strength++;
    if (hasLower) strength++;
    if (hasDigit) strength++;
    if (hasSpecial) strength++;

    if (strength <= 1) {
      this.passwordStrength = 'Weak';
      this.passwordEmoji = '😞';
    } else if (strength <= 2) {
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
    return level === 'UG' ? (dep?.ug || []) : (dep?.pg || []);
  }

  async submit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const formValue = this.form.value;
  const { email, password, ...other } = formValue;

  try {
    // Register user
    const userCredential = await this.auth.register(email, password);
    const uid = userCredential.user.uid;

    const userData: UserModel = {
      uid,
      name: other.name,
      srn: other.srn,
      email,
      phone: other.phone,
      school: other.department,
      department: other.course,
      createdAt: new Date()
    };

    // Save user in Firestore
    await this.fbService.createUser(userData);

    // Sign out immediately so login page works
    await this.auth.logout();

    alert('Registration successful! Please log in.');
    this.router.navigate(['/login']);
  } catch (err: any) {
    console.error("Registration error:", err);
    let message = 'Registration failed';

    if (err.code === 'auth/email-already-in-use') {
      message = 'Email already in use';
    } else if (err.code === 'auth/weak-password') {
      message = 'Password is too weak';
    } else if (err.code === 'permission-denied') {
      message = 'Firestore permission denied – check Firestore rules';
    } else if (err.message) {
      message = err.message;
    }

    alert(message);
  
  }

  }

  goToLogin(event: Event) {
    if (event) {
      event.preventDefault();
    }
    this.router.navigate(['/login']);
  }
}