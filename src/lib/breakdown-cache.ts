import type { Breakdown } from './types';
const KEY='pp-breakdown-cache-v2';
export function cachedBreakdown(text:string):Breakdown|null {try{return JSON.parse(localStorage.getItem(KEY)??'{}')[text.trim()]??null;}catch{return null;}}
export function cacheBreakdown(text:string,b:Breakdown){try{const cache=JSON.parse(localStorage.getItem(KEY)??'{}');cache[text.trim()]=b;localStorage.setItem(KEY,JSON.stringify(cache));}catch{}}