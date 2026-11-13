import {describe,it,expect} from 'vitest';
import {award,earlyReveal,freshSession,reviewBadge,dailyStreak,todaysReview} from './practice';
import type {SavedProblem} from './local-log';
describe('try before reveal',()=>{
 it('awards pattern XP only before reveal',()=>{expect(award(freshSession(),'pattern',true).xp).toBe(20);expect(award(earlyReveal(freshSession()),'pattern',true).xp).toBe(0);});
 it('awards complexity XP only before reveal',()=>{expect(award(freshSession(),'complexity',true).xp).toBe(20);expect(award({...freshSession(),submitted:true},'complexity',true).xp).toBe(0);});
 it('gives early reveal less successful code XP',()=>{expect(award({...freshSession(),submitted:true},'code',true).xp).toBe(50);expect(award(earlyReveal(freshSession()),'code',true).xp).toBe(10);});
 it('does not reward failed code and permits a corrected resubmission',()=>{const failed=award(freshSession(),'code',false);expect(failed.xp).toBe(0);expect(award(failed,'code',true).xp).toBe(50);});
 it('does not duplicate a reward',()=>{expect(award(award(freshSession(),'code',true),'code',true).xp).toBe(50);});
 it('early reveal reduces intuition',()=>{expect(earlyReveal({...freshSession(),correct:1,attempts:1}).attempts).toBe(2);});
 it('uses requested result badges',()=>{expect(reviewBadge('Looks correct',[])).toBe('Solved');expect(reviewBadge('Needs work',['Missing empty input'])).toBe('Almost (1 bug)');expect(reviewBadge('Needs work',['a','b'])).toBe('Needs work');});
 it('tracks consecutive practice dates',()=>expect(dailyStreak(['2026-11-12','2026-11-13'],new Date('2026-11-13T12:00:00'))).toBe(2));
 it('picks the lowest-confidence problem in the weakest pattern',()=>{const rows=[{id:'a',pattern:'Stack',confidence:1},{id:'b',pattern:'Arrays & Hashing',confidence:4},{id:'c',pattern:'Stack',confidence:2}] as SavedProblem[];expect(todaysReview(rows)?.id).toBe('a');});
});