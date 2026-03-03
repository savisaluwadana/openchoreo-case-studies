import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Quiz, Session, Question, WsMessage, QuizService } from '../../quiz.service';

type Stage = 'lobby' | 'join' | 'quiz' | 'result';

@Component({
  selector: 'app-quiz',
  template: `
    <div class="page">

      <!-- ── LOBBY: pick a quiz ── -->
      <ng-container *ngIf="stage === 'lobby'">
        <h2>📝 Available Quizzes</h2>
        <div class="quiz-list">
          <div class="quiz-card" *ngFor="let q of quizzes">
            <div>
              <h4>{{ q.title }}</h4>
              <p>{{ q.description }}</p>
            </div>
            <button class="btn-primary" (click)="selectQuiz(q)">Start</button>
          </div>
          <p *ngIf="!quizzes.length" style="color:#64748b;text-align:center">No quizzes available.</p>
        </div>
      </ng-container>

      <!-- ── JOIN: enter name ── -->
      <ng-container *ngIf="stage === 'join'">
        <h2>Join: {{ selectedQuiz?.title }}</h2>
        <div class="card" style="max-width:420px">
          <div class="form-row single">
            <div>
              <label>Your Name</label>
              <input [(ngModel)]="participantName" placeholder="e.g. Jane Doe" (keyup.enter)="joinQuiz()" />
            </div>
          </div>
          <p class="error" *ngIf="joinError">{{ joinError }}</p>
          <div style="display:flex;gap:0.7rem">
            <button class="btn-primary" (click)="joinQuiz()">Join Quiz</button>
            <button class="btn-outline" (click)="stage = 'lobby'">Back</button>
          </div>
        </div>
      </ng-container>

      <!-- ── QUIZ: real-time Q&A ── -->
      <ng-container *ngIf="stage === 'quiz'">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem">
          <h2 style="margin:0">{{ selectedQuiz?.title }}</h2>
          <span class="ws-status" [class.connected]="wsConnected" [class.disconnected]="!wsConnected">
            {{ wsConnected ? '● Live' : '○ Disconnected' }}
          </span>
        </div>

        <!-- Score bar -->
        <div class="score-bar">
          <span class="label">Question {{ currentIndex + 1 }} / {{ questions.length }}</span>
          <span class="label">Player: {{ session?.participant }}</span>
          <span class="value">{{ session?.score ?? 0 }} pts</span>
        </div>

        <!-- Progress bar -->
        <div class="progress-bar-wrap">
          <div class="progress-bar" [style.width]="progressPct + '%'"></div>
        </div>

        <!-- Current question -->
        <div class="question-card" *ngIf="currentQuestion">
          <div class="question-text">{{ currentQuestion.text }}</div>
          <div class="options">
            <button
              class="option-btn"
              *ngFor="let opt of currentQuestion.options; let i = index"
              [class.correct]="answered && i === lastCorrectIdx"
              [class.wrong]="answered && i === lastAnswerIdx && !lastCorrect"
              [class.selected]="answered && i === lastAnswerIdx"
              [disabled]="answered"
              (click)="submitAnswer(i)"
            >
              {{ optionLabel(i) }}. {{ opt }}
            </button>
          </div>

          <!-- Answer feedback -->
          <div *ngIf="answered" style="margin-top:1.2rem">
            <span *ngIf="lastCorrect" style="color:#86efac;font-weight:600">✓ Correct! +{{ lastPoints }} pts</span>
            <span *ngIf="!lastCorrect" style="color:#fca5a5;font-weight:600">✗ Incorrect</span>
            <button
              class="btn-primary"
              style="margin-left:1.5rem"
              (click)="nextQuestion()"
            >
              {{ currentIndex + 1 < questions.length ? 'Next Question →' : 'Finish Quiz' }}
            </button>
          </div>
        </div>
      </ng-container>

      <!-- ── RESULT ── -->
      <ng-container *ngIf="stage === 'result'">
        <div class="card result-card">
          <div style="font-size:3rem;margin-bottom:0.5rem">🎉</div>
          <h2>Quiz Complete!</h2>
          <p>Player: <b>{{ session?.participant }}</b></p>
          <div class="big-score">{{ session?.score }} pts</div>
          <p>out of {{ possibleScore }} possible points ({{ questions.length }} questions)</p>
          <button class="btn-primary" style="margin-top:1rem" (click)="restart()">Play Again</button>
        </div>
      </ng-container>

    </div>
  `,
})
export class QuizComponent implements OnInit, OnDestroy {
  stage: Stage = 'lobby';
  quizzes: Quiz[] = [];

  selectedQuiz: Quiz | null = null;
  participantName = '';
  joinError = '';

  session: Session | null = null;
  questions: Question[] = [];
  currentIndex = 0;

  answered = false;
  lastAnswerIdx = -1;
  lastCorrectIdx = -1;
  lastCorrect = false;
  lastPoints = 0;
  possibleScore = 0;

  wsConnected = false;

  private subs = new Subscription();

  constructor(private svc: QuizService) {}

  get currentQuestion(): Question | null {
    return this.questions[this.currentIndex] ?? null;
  }

  get progressPct(): number {
    return this.questions.length ? ((this.currentIndex) / this.questions.length) * 100 : 0;
  }

  ngOnInit(): void {
    this.svc.listQuizzes().subscribe(q => (this.quizzes = q));
    this.subs.add(this.svc.connected$.subscribe(c => (this.wsConnected = c)));
    this.subs.add(this.svc.messages$.subscribe(msg => this.handleWsMessage(msg)));
  }

  selectQuiz(q: Quiz): void {
    this.selectedQuiz = q;
    this.stage = 'join';
  }

  joinQuiz(): void {
    this.joinError = '';
    if (!this.participantName.trim()) {
      this.joinError = 'Please enter your name.';
      return;
    }

    this.svc.createSession(this.selectedQuiz!.id, this.participantName.trim()).subscribe({
      next: (s) => {
        this.session = s;
        this.possibleScore = s.possible_score;
        this.svc.connect();
        // Wait a tick for connection to open
        setTimeout(() => {
          this.svc.join(s.id, this.selectedQuiz!.id);
        }, 300);
      },
      error: () => (this.joinError = 'Failed to create session. Please try again.'),
    });
  }

  handleWsMessage(msg: WsMessage): void {
    if (msg.type === 'QUIZ_STATE') {
      this.questions = msg.quiz.questions ?? [];
      this.session = msg.session;
      this.currentIndex = msg.currentQuestionIndex;
      this.answered = false;
      this.stage = 'quiz';
    } else if (msg.type === 'ANSWER_RESULT') {
      this.lastCorrect = msg.correct;
      this.lastPoints = msg.pointsEarned;
      if (this.session) this.session.score = msg.totalScore;
    } else if (msg.type === 'FINISHED') {
      this.session = msg.session;
      this.stage = 'result';
      this.svc.disconnect();
    } else if (msg.type === 'ERROR') {
      console.error('[quiz] WS error:', msg.message);
    }
  }

  submitAnswer(idx: number): void {
    if (this.answered || !this.session || !this.currentQuestion) return;
    this.lastAnswerIdx = idx;
    this.answered = true;
    this.svc.submitAnswer(this.session.id, this.currentQuestion.id, idx);
  }

  nextQuestion(): void {
    const isLast = this.currentIndex + 1 >= this.questions.length;
    if (isLast) {
      this.svc.finish(this.session!.id);
    } else {
      this.currentIndex++;
      this.answered = false;
      this.lastAnswerIdx = -1;
      this.lastCorrectIdx = -1;
    }
  }

  optionLabel(i: number): string {
    return ['A', 'B', 'C', 'D'][i] ?? String(i + 1);
  }

  restart(): void {
    this.stage = 'lobby';
    this.selectedQuiz = null;
    this.participantName = '';
    this.session = null;
    this.questions = [];
    this.currentIndex = 0;
    this.answered = false;
    this.possibleScore = 0;
    this.svc.listQuizzes().subscribe(q => (this.quizzes = q));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.svc.disconnect();
  }
}
