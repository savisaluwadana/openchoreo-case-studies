import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav>
      <span class="brand">🎓 Course Portal</span>
      <a routerLink="/courses" routerLinkActive="active">Courses</a>
      <a routerLink="/students" routerLinkActive="active">Students</a>
    </nav>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
