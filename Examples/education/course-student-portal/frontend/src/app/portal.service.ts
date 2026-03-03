import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  instructor: string;
  created_at: string;
}

export interface Student {
  id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  email: string;
  created_at: string;
}

export interface Enrollment {
  id: string;
  course: string;
  student: string;
  grade: string | null;
  enrolled_at: string;
}

function getApiBase(): string {
  const w = typeof window !== 'undefined' ? (window as any) : null;
  return (w?.configs?.apiUrl) ?? (process.env['CHOREO_API_URL'] ?? 'http://localhost:8080');
}

@Injectable({ providedIn: 'root' })
export class PortalService {
  private base = getApiBase();

  constructor(private http: HttpClient) {}

  // Courses
  getCourses(): Observable<Course[]>                          { return this.http.get<Course[]>(`${this.base}/api/v1/courses/`); }
  getCourse(id: string): Observable<Course>                  { return this.http.get<Course>(`${this.base}/api/v1/courses/${id}/`); }
  createCourse(c: Partial<Course>): Observable<Course>       { return this.http.post<Course>(`${this.base}/api/v1/courses/`, c); }
  updateCourse(id: string, c: Partial<Course>): Observable<Course> { return this.http.put<Course>(`${this.base}/api/v1/courses/${id}/`, c); }
  deleteCourse(id: string): Observable<void>                 { return this.http.delete<void>(`${this.base}/api/v1/courses/${id}/`); }
  getCourseStudents(id: string): Observable<Student[]>       { return this.http.get<Student[]>(`${this.base}/api/v1/courses/${id}/students/`); }

  // Students
  getStudents(): Observable<Student[]>                           { return this.http.get<Student[]>(`${this.base}/api/v1/students/`); }
  getStudent(id: string): Observable<Student>                    { return this.http.get<Student>(`${this.base}/api/v1/students/${id}/`); }
  createStudent(s: Partial<Student>): Observable<Student>        { return this.http.post<Student>(`${this.base}/api/v1/students/`, s); }
  updateStudent(id: string, s: Partial<Student>): Observable<Student> { return this.http.put<Student>(`${this.base}/api/v1/students/${id}/`, s); }
  deleteStudent(id: string): Observable<void>                    { return this.http.delete<void>(`${this.base}/api/v1/students/${id}/`); }
  getStudentCourses(id: string): Observable<Course[]>            { return this.http.get<Course[]>(`${this.base}/api/v1/students/${id}/courses/`); }

  // Enrollments
  getEnrollments(): Observable<Enrollment[]>                          { return this.http.get<Enrollment[]>(`${this.base}/api/v1/enrollments/`); }
  enroll(courseId: string, studentId: string): Observable<Enrollment> { return this.http.post<Enrollment>(`${this.base}/api/v1/enrollments/`, { course: courseId, student: studentId }); }
  updateGrade(enrollmentId: string, grade: string): Observable<Enrollment> { return this.http.patch<Enrollment>(`${this.base}/api/v1/enrollments/${enrollmentId}/grade/`, { grade }); }
}
