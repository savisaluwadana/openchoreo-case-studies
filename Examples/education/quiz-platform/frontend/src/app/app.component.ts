import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <nav>
      <span class="brand">⚡ Quiz Platform</span>
    </nav>
    <app-quiz></app-quiz>
  `,
})
export class AppComponent {}
