import type { SavedProblem } from './local-log';
import { weakestPatterns } from './stats';
import { isReviewDue, nextReview } from './review';
export type PracticeSession = { step: string; patternGuess?: string; complexityGuess?: string; submitted: boolean; early: boolean; xp: number; rewards: string[]; correct: number; attempts: number; combo: number };
export function freshSession(step = 'understand'): PracticeSession { return { step, submitted:false, early:false, xp:0, rewards:[],correct:0,attempts:0,combo:0 }; }
export function award(session: PracticeSession, key: string, correct: boolean): PracticeSession {
 if(session.rewards.includes(key)) return session;
 const value = key === 'code' ? 50 : 20;
 return { ...session, rewards: key==='code'&&!correct ? session.rewards : [...session.rewards,key], xp:session.xp+(correct && !session.early ? value : key==='code' && correct ? (session.early ? 10 : value) : 0), correct:session.correct+(correct?1:0),attempts:session.attempts+1,combo:correct?session.combo+1:0 };
}
export function earlyReveal(session: PracticeSession): PracticeSession { return {...session,early:true,attempts:session.attempts+1,combo:0}; }
export function reviewBadge(verdict: string, issues: string[]) { return verdict==='Looks correct' ? 'Solved' : issues.length===1 ? 'Almost (1 bug)' : 'Needs work'; }
export function todaysReview(rows: SavedProblem[], now = new Date()) {
 const due=rows.filter(row=>isReviewDue(row.review,now)).sort((a,b)=>String(nextReview(a.review)).localeCompare(String(nextReview(b.review))));
 if(due[0]) return due[0];
 const eligible=rows.filter(row=>!nextReview(row.review)&&new Date(row.last_practiced_at??row.created_at).getTime()<=now.getTime()-86400000);
 const weakest=weakestPatterns(eligible,1)[0]?.pattern;
 return eligible.filter(row=>row.pattern===weakest).sort((a,b)=>a.confidence-b.confidence)[0];
}
export function dayKey(date = new Date()) { return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`; }
export function recordPracticeDay() { try { const days: string[]=JSON.parse(localStorage.getItem('pp-practice-days')??'[]'); const today=dayKey(); if(!days.includes(today)) localStorage.setItem('pp-practice-days',JSON.stringify([...days,today])); } catch { /* Device storage unavailable. */ } }
export function dailyStreak(days: string[], now = new Date()) { let count=0; const date=new Date(now); if(!days.includes(dayKey(date))) date.setDate(date.getDate()-1); while(days.includes(dayKey(date))){count++;date.setDate(date.getDate()-1);} return count; }