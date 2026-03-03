import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { CoursesComponent } from './components/courses/courses.component';
import { StudentsComponent } from './components/students/students.component';

const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { path: 'courses', component: CoursesComponent },
  { path: 'students', component: StudentsComponent },
];

@NgModule({
  declarations: [
    AppComponent,
    CoursesComponent,
    StudentsComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forRoot(routes),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
