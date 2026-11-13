import {it,expect} from 'vitest';
import {completedFields} from './partial-breakdown';
it('exposes Understand before the remaining JSON finishes',()=>expect(completedFields('{"understand":{"restatement":"hi } there"},"examples":[')).toEqual({understand:{restatement:'hi } there'}}));
it('does not expose partial examples',()=>expect(completedFields('{"examples":[{"input":"a"}')).toEqual({}));