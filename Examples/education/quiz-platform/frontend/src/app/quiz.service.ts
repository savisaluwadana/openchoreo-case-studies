import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, BehaviorSubject } from 'rxjs';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  created_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  points: number;
  position: number;
}

export interface Session {
  id: string;
  quiz_id: string;
  participant: string;
  score: number;
  total_questions: number;
  finished: boolean;
  created_at: string;
}

export type WsMessage =
  | { type: 'QUIZ_STATE'; quiz: Quiz; session: Session; currentQuestionIndex: number }
  | { type: 'ANSWER_RESULT'; correct: boolean; pointsEarned: number; totalScore: number; participant: string }
  | { type: 'FINISHED'; session: Session }
  | { type: 'ERROR'; message: string };

function getRestBase(): string {
  const w = typeof window !== 'undefined' ? (window as any) : null;
  return w?.configs?.apiUrl ?? (process.env['CHOREO_API_URL'] ?? 'http://localhost:8080');
}

function getWsBase(): string {
  const w = typeof window !== 'undefined' ? (window as any) : null;
  // Choreo injects wsUrl for WebSocket service endpoints
  if (w?.configs?.wsUrl) return w.configs.wsUrl;
  if (w?.configs?.apiUrl) {
    return w.configs.apiUrl.replace(/^http/, 'ws');
  }
  return process.env['CHOREO_WS_URL'] ?? 'ws://localhost:8080';
}

@Injectable({ providedIn: 'root' })
export class QuizService implements OnDestroy {
  private restBase = getRestBase();
  private wsBase = getWsBase();

  private ws: WebSocket | null = null;
  readonly messages$ = new Subject<WsMessage>();
  readonly connected$ = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) {}

  // ── REST ────────────────────────────────────────────────────────────────────
  listQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${this.restBase}/api/v1/quizzes`);
  }

  getQuiz(id: string): Observable<Quiz> {
    return this.http.get<Quiz>(`${this.restBase}/api/v1/quizzes/${id}`);
  }

  createSession(quizId: string, participant: string): Observable<Session & { possible_score: number }> {
    return this.http.post<Session & { possible_score: number }>(
      `${this.restBase}/api/v1/quizzes/${quizId}/sessions`,
      { participant }
    );
  }

  // ── WebSocket ────────────────────────────────────────────────────────────────
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(`${this.wsBase}/ws`);

    this.ws.onopen = () => {
      console.log('[ws] Connected');
      this.connected$.next(true);
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        this.messages$.next(msg);
      } catch {
        console.error('[ws] Failed to parse message:', event.data);
      }
    };

    this.ws.onclose = () => {
      console.log('[ws] Disconnected');
      this.connected$.next(false);
    };

    this.ws.onerror = (err) => {
      console.error('[ws] Error', err);
      this.connected$.next(false);
    };
  }

  send(msg: object): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    } else {
      console.warn('[ws] Cannot send, connection not open');
    }
  }

  join(sessionId: string, quizId: string): void {
    this.send({ type: 'JOIN', sessionId, quizId });
  }

  submitAnswer(sessionId: string, questionId: string, answerIdx: number): void {
    this.send({ type: 'SUBMIT_ANSWER', sessionId, questionId, answerIdx });
  }

  finish(sessionId: string): void {
    this.send({ type: 'FINISH', sessionId });
  }

  disconnect(): void {
    this.ws?.close();
    this.ws = null;
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
