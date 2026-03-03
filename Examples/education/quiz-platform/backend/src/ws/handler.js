/**
 * WebSocket message handler for the quiz platform.
 *
 * Message protocol (JSON):
 *
 * Client → Server:
 *   { type: "JOIN",          sessionId, quizId }
 *   { type: "SUBMIT_ANSWER", sessionId, questionId, answerIdx }
 *   { type: "FINISH",        sessionId }
 *
 * Server → Client:
 *   { type: "QUIZ_STATE",    quiz, session, currentQuestionIndex }
 *   { type: "ANSWER_RESULT", correct, pointsEarned, totalScore, explanation? }
 *   { type: "FINISHED",      session }
 *   { type: "ERROR",         message }
 */

const db = require('../db');

// Map sessionId → Set of WebSocket clients
const sessionClients = new Map();

// Map sessionId → { answeredQuestions: Set<questionId>, currentIndex: number }
const sessionState = new Map();

function broadcast(sessionId, message) {
  const clients = sessionClients.get(sessionId);
  if (!clients) return;
  const payload = JSON.stringify(message);
  for (const ws of clients) {
    if (ws.readyState === 1 /* OPEN */) {
      ws.send(payload);
    }
  }
}

function send(ws, message) {
  if (ws.readyState === 1) ws.send(JSON.stringify(message));
}

async function handleJoin(ws, { sessionId, quizId }) {
  try {
    const { rows: sessions } = await db.query(
      'SELECT * FROM sessions WHERE id = $1 AND quiz_id = $2',
      [sessionId, quizId]
    );
    if (!sessions.length) {
      return send(ws, { type: 'ERROR', message: 'Session not found' });
    }

    const session = sessions[0];

    const { rows: questions } = await db.query(
      'SELECT id, text, options, points, position FROM questions WHERE quiz_id = $1 ORDER BY position',
      [quizId]
    );

    const { rows: [quiz] } = await db.query('SELECT * FROM quizzes WHERE id = $1', [quizId]);

    // Track this client under the session
    if (!sessionClients.has(sessionId)) {
      sessionClients.set(sessionId, new Set());
    }
    sessionClients.get(sessionId).add(ws);

    // Init state if first join
    if (!sessionState.has(sessionId)) {
      sessionState.set(sessionId, {
        answeredQuestions: new Set(),
        currentIndex: 0,
      });
    }

    const state = sessionState.get(sessionId);

    send(ws, {
      type: 'QUIZ_STATE',
      quiz: { ...quiz, questions },
      session,
      currentQuestionIndex: state.currentIndex,
    });
  } catch (err) {
    console.error('[ws] JOIN error:', err);
    send(ws, { type: 'ERROR', message: 'Failed to join session' });
  }
}

async function handleSubmitAnswer(ws, { sessionId, questionId, answerIdx }) {
  try {
    const state = sessionState.get(sessionId);
    if (!state) return send(ws, { type: 'ERROR', message: 'Session not active. Send JOIN first.' });

    if (state.answeredQuestions.has(questionId)) {
      return send(ws, { type: 'ERROR', message: 'Question already answered' });
    }

    // Fetch question to check correct answer
    const { rows: questions } = await db.query(
      'SELECT answer_idx, points FROM questions WHERE id = $1',
      [questionId]
    );
    if (!questions.length) return send(ws, { type: 'ERROR', message: 'Question not found' });

    const question = questions[0];
    const correct = question.answer_idx === answerIdx;
    const pointsEarned = correct ? question.points : 0;

    // Update session score
    const { rows: [session] } = await db.query(
      'UPDATE sessions SET score = score + $1 WHERE id = $2 RETURNING *',
      [pointsEarned, sessionId]
    );

    state.answeredQuestions.add(questionId);
    state.currentIndex++;

    broadcast(sessionId, {
      type: 'ANSWER_RESULT',
      correct,
      pointsEarned,
      totalScore: session.score,
      participant: session.participant,
    });
  } catch (err) {
    console.error('[ws] SUBMIT_ANSWER error:', err);
    send(ws, { type: 'ERROR', message: 'Failed to process answer' });
  }
}

async function handleFinish(ws, { sessionId }) {
  try {
    const { rows: [session] } = await db.query(
      'UPDATE sessions SET finished = true WHERE id = $1 RETURNING *',
      [sessionId]
    );

    if (!session) return send(ws, { type: 'ERROR', message: 'Session not found' });

    broadcast(sessionId, { type: 'FINISHED', session });

    // Clean up session tracking
    sessionState.delete(sessionId);
  } catch (err) {
    console.error('[ws] FINISH error:', err);
    send(ws, { type: 'ERROR', message: 'Failed to finish session' });
  }
}

function handleDisconnect(ws, sessionId) {
  if (!sessionId) return;
  const clients = sessionClients.get(sessionId);
  if (clients) {
    clients.delete(ws);
    if (clients.size === 0) {
      sessionClients.delete(sessionId);
    }
  }
}

module.exports = { handleJoin, handleSubmitAnswer, handleFinish, handleDisconnect };
