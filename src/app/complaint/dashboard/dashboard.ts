import { Component, OnInit } from '@angular/core';
import { User } from 'firebase/auth';
import { ComplaintService } from '../../services/complaint.service';
import { ComplaintModel } from '../../models/complaint.model';
import { AuthService } from '../../services/auth.service';
import { CommonModule, NgFor, NgIf, DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { staggerList, fadeIn } from '../../animations';
import { Observable, of, from, switchMap, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, DatePipe, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
  animations: [staggerList, fadeIn]
})
export class DashboardComponent implements OnInit {
  complaints$: Observable<ComplaintModel[]> = of([]);

  constructor(
    private complaintService: ComplaintService,
    private auth: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.complaints$ = this.auth.user$.pipe(
      switchMap((user: User | null) => user ? from(this.complaintService.listComplaints(user.uid)) : of([]))
    );
  }

  edit(id: string) {
    this.router.navigate(['/complaint/edit', id]);
  }

  async delete(id: string) {
    if (confirm('Delete this complaint?')) {
      const user = await firstValueFrom(this.auth.user$);
      if (user) {
        await this.complaintService.deleteComplaint(user.uid, id);
      }
    }
  }
}
