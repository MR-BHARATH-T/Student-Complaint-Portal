import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule, FormGroup } from '@angular/forms';
import { FirebaseService } from '../services/firebase.service';
import { ComplaintService } from '../services/complaint.service';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { User } from 'firebase/auth';
import { ComplaintModel } from '../models/complaint.model';
import { firstValueFrom } from 'rxjs';
import { slideIn } from '../animations';

// Material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-complaint',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './complaint.html',
  styleUrls: ['./complaint.scss'],
  animations: [slideIn]
})
export class ComplaintComponent implements OnInit {
  categories = ['Academics', 'Infrastructure', 'Faculty', 'Administration', 'Hostel', 'Library', 'Sports', 'Canteen', 'Transport', 'Others'];

  form!: FormGroup;

  isEdit = false;
  id: string | null = null;
  uid: string | null = null;

  existingStatus: string = 'pending';

  constructor(
    private fb: FormBuilder,
    private fbService: FirebaseService,
    private complaintService: ComplaintService,
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      title: ['', Validators.required],
      date: [today, Validators.required],
      category: ['', Validators.required],
      description: ['', [Validators.required, Validators.minLength(100)]]
    });

    this.id = this.route.snapshot.paramMap.get('id');
    this.auth.user$.subscribe(async (u: User | null) => {
      if (u) {
        this.uid = u.uid;
        if (this.id) {
          this.isEdit = true;
          await this.loadComplaint(this.uid, this.id);
        }
      }
    });
  }

  async loadComplaint(uid: string, complaintId: string) {
    const complaints = await this.complaintService.listComplaints(uid);
    const complaint = complaints.find((c: ComplaintModel) => c.id === complaintId);
    if (complaint) {
      this.form.patchValue({
        title: complaint.title,
        date: complaint.date,
        category: complaint.category,
        description: complaint.description
      });
      this.existingStatus = complaint.status;
    }
  }

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user = await firstValueFrom(this.auth.user$);
    if (!user) {
      alert('You must be logged in to submit a complaint.');
      this.router.navigate(['/login']);
      return;
    }

    const formValue = this.form.value;
    const complaintData = {
      uid: user.uid,
      title: formValue.title,
      date: formValue.date,
      category: formValue.category,
      description: formValue.description
    };

    try {
      if (this.isEdit && this.id) {
        await this.complaintService.updateComplaint(user.uid, this.id, complaintData);
      } else {
        await this.complaintService.addComplaint(complaintData);
      }
      this.router.navigate(['/dashboard']);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to save complaint: ${err.message || err.code || 'Unknown error'}`);
    }
  }
}
