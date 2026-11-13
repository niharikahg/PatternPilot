import type { Breakdown } from './types';
import { LIBRARY } from './library';
import b0 from './practice-data/0.json';
import b1 from './practice-data/1.json';
import b2 from './practice-data/2.json';
import b3 from './practice-data/3.json';
import a0 from '@/assets/practice/0.mp3.asset.json';
import a1 from '@/assets/practice/1.mp3.asset.json';
import a2 from '@/assets/practice/2.mp3.asset.json';
import a3 from '@/assets/practice/3.mp3.asset.json';
const data=[b0,b1,b2,b3] as Breakdown[];
const audio=[a0,a1,a2,a3];
export function builtinBreakdown(text:string):Breakdown|null {const i=LIBRARY.findIndex(p=>p.text.trim()===text.trim());return data[i]??null;}
export function builtinAudio(title:string):string|undefined {const i=data.findIndex(b=>b.title===title);return audio[i]?.url;}