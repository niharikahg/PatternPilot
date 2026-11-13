import {it,expect} from 'vitest';
import {mergeProgress,progressKey} from './progress-sync';
it('merges streak dates across devices',()=>expect(JSON.parse(mergeProgress({'pp-practice-days':'["2026-11-12"]'},{'pp-practice-days':'["2026-11-13"]'})['pp-practice-days']??'[]')).toEqual(['2026-11-12','2026-11-13']));
it('keeps distinct logged problems from both devices',()=>expect(JSON.parse(mergeProgress({'pp-problem-log':'[{"id":"a"}]'},{'pp-problem-log':'[{"id":"b"}]'})['pp-problem-log']??'[]')).toHaveLength(2));
it('never syncs auth or unrelated storage keys',()=>{expect(progressKey('sb-account-auth-token')).toBe(false);expect(progressKey('pp-flow-Two Sum')).toBe(true);});