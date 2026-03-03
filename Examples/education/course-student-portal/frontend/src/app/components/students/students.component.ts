import { Component, OnInit } from '@angular/core';
import { Course, Student, PortalService } from '../../portal.service';

@Component({
  selector: 'app-students',
  template: `
    <div class="page">
      <h2>Students</h2>

      <!-- Add Student Form -->
      <div class="card">
        <h3 style="margin-top:0">Register New Student</h3>
        <div class="form-row">
          <div>
            <label>Student ID</label>
            <input [(ngModel)]="form.student_id" placeholder="e.g. S2024001" />
          </div>
          <div>
            <label>Email</label>
            <input [(ngModel)]="form.email" type="email" placeholder="jane@university.edu" />
          </div>
        </div>
        <div class="form-row">
          <div>
            <label>First Name</label>
            <input [(ngModel)]="form.first_name" placeholder="Jane" />
          </div>
          <div>
            <label>Last Name</label>
            <input [(ngModel)]="form.last_name" placeholder="Doe" />
          </div>
        </div>
        <p class="error" *ngIf="formError">{{ formError }}</p>
        <button class="btn-primary" (click)="addStudent()">Register</button>
      </div>

      <!-- Student List -->
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Enrolled Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of students">
              <td><span class="badge badge-green">{{ s.student_id }}</span></td>
              <td>{{ s.first_name }} {{ s.last_name }}</td>
              <td>{{ s.email }}</td>
              <td>
                <button class="btn-sm" (click)="toggleCourses(s.id)">
                  {{ expanded[s.id] ? 'Hide' : 'View' }} Courses
                </button>
              </td>
              <td class="actions">
                <button class="btn-danger btn-sm" (click)="deleteStudent(s.id)">Delete</button>
              </td>
            </tr>
            <ng-container *ngFor="let s of students">
              <tr *ngIf="expanded[s.id]">
                <td colspan="5" style="padding:0 1rem 1rem">
                  <b>{{ s.first_name }}'s courses:</b>
                  <span *ngIf="!studentCourses[s.id]?.length"> None enrolled</span>
                  <ul style="margin:0.3rem 0 0 1rem">
                    <li *ngFor="let c of studentCourses[s.id]">
                      <span class="badge badge-blue">{{ c.code }}</span> {{ c.title }}
                    </li>
                  </ul>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
        <p *ngIf="!students.length" style="color:#999;text-align:center">No students registered yet.</p>
      </div>
    </div>
  `,
})
export class StudentsComponent implements OnInit {
  students: Student[] = [];
  expanded: Record<string, boolean> = {};
  studentCourses: Record<string, Course[]> = {};
  form: Partial<Student> = {};
  formError = '';

  constructor(private svc: PortalService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.svc.getStudents().subscribe(s => (this.students = s));
  }

  addStudent(): void {
    this.formError = '';
    if (!this.form.student_id || !this.form.first_name || !this.form.last_name || !this.form.email) {
      this.formError = 'All fields are required.';
      return;
    }
    this.svc.createStudent(this.form).subscribe({ next: () => { this.form = {}; this.load(); }, error: () => (this.formError = 'Failed to register student.') });
  }

  deleteStudent(id: string): void {
    if (confirm('Delete this student?')) {
      this.svc.deleteStudent(id).subscribe(() => this.load());
    }
  }

  toggleCourses(id: string): void {
    this.expanded[id] = !this.expanded[id];
    if (this.expanded[id] && !this.studentCourses[id]) {
      this.svc.getStudentCourses(id).subscribe(c => (this.studentCourses[id] = c));
    }
  }
}
