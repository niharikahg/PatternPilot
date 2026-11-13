import {describe,it,expect} from 'vitest';
import {award,earlyReveal,freshSession,reviewBadge,dailyStreak,todaysReview} from './practice';
import builtin from './practice-data/0.json';
import type {Breakdown} from './types';
import type {SavedProblem} from './local-log';
describe('try before reveal',()=>{
 it('does not pick a just-solved problem for today',()=>{const row={id:'a',pattern:'Stack',confidence:1,created_at:'2026-11-13T08:00:00Z',last_practiced_at:'2026-11-13T08:00:00Z',practice_status:'solved'} as SavedProblem;expect(todaysReview([row],new Date('2026-11-13T08:10:00Z'))).toBeUndefined();});
 it('holds scheduled problems until the first due date',()=>{const row={id:'a',title:'Example',problem_text:'example',difficulty:'Easy',breakdown:builtin as Breakdown,pattern:'Stack',confidence:1,created_at:'2020-01-01',review:{flagged_at:'2026-11-13T08:00:00Z',dates:['2026-11-14T08:00:00Z'],completed:[]}} as SavedProblem;expect(todaysReview([row],new Date('2026-11-13T08:10:00Z'))).toBeUndefined();expect(todaysReview([row],new Date('2026-11-14T08:00:00Z'))?.id).toBe('a');});
 it('awards pattern XP only before reveal',()=>{expect(award(freshSession(),'pattern',true).xp).toBe(20);expect(award(earlyReveal(freshSession()),'pattern',true).xp).toBe(0);});
 it('awards complexity XP only before reveal',()=>{expect(award(freshSession(),'complexity',true).xp).toBe(20);expect(award({...freshSession(),submitted:true},'complexity',true).xp).toBe(0);});
 it('gives early reveal less successful code XP',()=>{expect(award({...freshSession(),submitted:true},'code',true).xp).toBe(50);expect(award(earlyReveal(freshSession()),'code',true).xp).toBe(10);});
 it('does not reward failed code and permits a corrected resubmission',()=>{const failed=award(freshSession(),'code',false);expect(failed.xp).toBe(0);expect(award(failed,'code',true).xp).toBe(50);});
 it('does not duplicate a reward',()=>{expect(award(award(freshSession(),'code',true),'code',true).xp).toBe(50);});
 it('early reveal reduces intuition',()=>{expect(earlyReveal({...freshSession(),correct:1,attempts:1}).attempts).toBe(2);});
 it('uses requested result badges',()=>{expect(reviewBadge('Looks correct',[])).toBe('Solved');expect(reviewBadge('Needs work',['Missing empty input'])).toBe('Almost (1 bug)');expect(reviewBadge('Needs work',['a','b'])).toBe('Needs work');});
 it('tracks consecutive practice dates',()=>expect(dailyStreak(['2026-11-12','2026-11-13'],new Date('2026-11-13T12:00:00'))).toBe(2));
 it('picks the lowest-confidence problem in the weakest pattern',()=>{const rows=[{id:'a',pattern:'Stack',confidence:1,created_at:'2020-01-01'},{id:'b',pattern:'Arrays & Hashing',confidence:4,created_at:'2020-01-01'},{id:'c',pattern:'Stack',confidence:2,created_at:'2020-01-01'}] as SavedProblem[];expect(todaysReview(rows)?.id).toBe('a');});
});