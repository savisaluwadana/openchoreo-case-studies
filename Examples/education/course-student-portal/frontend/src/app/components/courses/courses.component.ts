import { Component, OnInit } from '@angular/core';
import { Course, Student, Enrollment, PortalService } from '../../portal.service';

@Component({
  selector: 'app-courses',
  template: `
    <div class="page">
      <h2>Courses</h2>

      <!-- Add Course Form -->
      <div class="card">
        <h3 style="margin-top:0">Add New Course</h3>
        <div class="form-row">
          <div>
            <label>Course Code</label>
            <input [(ngModel)]="form.code" placeholder="e.g. CS101" />
          </div>
          <div>
            <label>Title</label>
            <input [(ngModel)]="form.title" placeholder="Introduction to Computer Science" />
          </div>
        </div>
        <div class="form-row">
          <div>
            <label>Instructor</label>
            <input [(ngModel)]="form.instructor" placeholder="Dr. Jane Smith" />
          </div>
          <div>
            <label>Description</label>
            <input [(ngModel)]="form.description" placeholder="Short description" />
          </div>
        </div>
        <p class="error" *ngIf="formError">{{ formError }}</p>
        <button class="btn-primary" (click)="addCourse()">Add Course</button>
      </div>

      <!-- Course List -->
      <div class="card">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>Instructor</th>
              <th>Students</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of courses">
              <td><span class="badge badge-blue">{{ c.code }}</span></td>
              <td>{{ c.title }}</td>
              <td>{{ c.instructor }}</td>
              <td>
                <button class="btn-sm" (click)="toggleStudents(c.id)">
                  {{ expanded[c.id] ? 'Hide' : 'View' }} Students
                </button>
              </td>
              <td class="actions">
                <button class="btn-danger btn-sm" (click)="deleteCourse(c.id)">Delete</button>
              </td>
            </tr>
            <ng-container *ngFor="let c of courses">
              <tr *ngIf="expanded[c.id]">
                <td colspan="5" style="padding:0 1rem 1rem">
                  <b>Enrolled students in {{ c.code }}:</b>
                  <span *ngIf="!courseStudents[c.id]?.length"> None</span>
                  <ul style="margin:0.3rem 0 0 1rem">
                    <li *ngFor="let s of courseStudents[c.id]">
                      {{ s.first_name }} {{ s.last_name }} ({{ s.student_id }})
                    </li>
                  </ul>
                  <!-- Quick enroll -->
                  <div style="margin-top:0.7rem;display:flex;gap:0.5rem;align-items:center">
                    <select [(ngModel)]="enrollStudentId[c.id]" style="width:200px">
                      <option value="">— Enroll a student —</option>
                      <option *ngFor="let s of allStudents" [value]="s.id">
                        {{ s.first_name }} {{ s.last_name }}
                      </option>
                    </select>
                    <button class="btn-primary btn-sm" (click)="enroll(c.id)">Enroll</button>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>
        <p *ngIf="!courses.length" style="color:#999;text-align:center">No courses yet.</p>
      </div>
    </div>
  `,
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  allStudents: Student[] = [];
  expanded: Record<string, boolean> = {};
  courseStudents: Record<string, Student[]> = {};
  enrollStudentId: Record<string, string> = {};
  form: Partial<Course> = {};
  formError = '';

  constructor(private svc: PortalService) {}

  ngOnInit(): void {
    this.load();
    this.svc.getStudents().subscribe(s => (this.allStudents = s));
  }

  load(): void {
    this.svc.getCourses().subscribe(c => (this.courses = c));
  }

  addCourse(): void {
    this.formError = '';
    if (!this.form.code || !this.form.title || !this.form.instructor) {
      this.formError = 'Code, title and instructor are required.';
      return;
    }
    this.svc.createCourse(this.form).subscribe({ next: () => { this.form = {}; this.load(); }, error: () => (this.formError = 'Failed to create course.') });
  }

  deleteCourse(id: string): void {
    if (confirm('Delete this course?')) {
      this.svc.deleteCourse(id).subscribe(() => this.load());
    }
  }

  toggleStudents(id: string): void {
    this.expanded[id] = !this.expanded[id];
    if (this.expanded[id] && !this.courseStudents[id]) {
      this.svc.getCourseStudents(id).subscribe(s => (this.courseStudents[id] = s));
    }
  }

  enroll(courseId: string): void {
    const studentId = this.enrollStudentId[courseId];
    if (!studentId) return;
    this.svc.enroll(courseId, studentId).subscribe(() => {
      this.svc.getCourseStudents(courseId).subscribe(s => (this.courseStudents[courseId] = s));
      this.enrollStudentId[courseId] = '';
    });
  }
}
