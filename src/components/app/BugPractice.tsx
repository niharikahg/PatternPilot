import {useEffect,useState} from 'react';
import {Bug,Loader2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {createBugChallenge} from '@/lib/bug-practice.functions';
import {CodePractice} from './CodePractice';
import type {SavedProblem} from '@/lib/local-log';
import {builtinBug} from '@/lib/builtin-bugs';
import {bugFirstHint} from '@/lib/bug-hints';
export function BugPractice({problem,title,sessionKey}:{problem:string;title:string;sessionKey:string}) {
 const [challenge,setChallenge]=useState<{code:string;failing_input:string;expected_output:string}|null>(null);
 const [attempt,setAttempt]=useState<SavedProblem['code_attempt']>();
 const [ready,setReady]=useState(false);
 useEffect(()=>{try{const saved=JSON.parse(localStorage.getItem(`pp-bug-${sessionKey}`)??'null');if(saved){setChallenge(saved.challenge);setAttempt(saved.attempt);}}catch{}setReady(true);},[sessionKey]);
 useEffect(()=>{if(ready)try{localStorage.setItem(`pp-bug-${sessionKey}`,JSON.stringify({challenge,attempt}));}catch{}},[ready,challenge,attempt,sessionKey]);
 const [pending,setPending]=useState(false);const [error,setError]=useState('');
 const generate=async()=>{setPending(true);setError('');try{const next=(!challenge?builtinBug(title):null)??await createBugChallenge({data:{problem}});setChallenge(next);setAttempt({language:'python',code:next.code});}catch{setError('The bug challenge could not be prepared. Try again when ready.');}finally{setPending(false);}};
 return <section className="border-y py-5"><div className="flex flex-wrap items-center gap-3"><h3 className="flex items-center gap-2 font-display text-xl font-bold"><Bug className="size-5"/> Spot the bug</h3><Button variant="outline" disabled={pending} onClick={()=>void generate()}>{pending?<Loader2 className="size-4 animate-spin"/>:<Bug className="size-4"/>}{challenge?'New bug':'Give me broken code'}</Button></div>{error&&<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{challenge&&<><div className="mt-4 grid gap-3 sm:grid-cols-2"><p className="font-mono text-sm">Failing input: {challenge.failing_input}</p><p className="font-mono text-sm">Expected: {challenge.expected_output}</p></div><CodePractice heading="Find and fix the bug" failingInput={challenge.failing_input} key={challenge.code} problem={problem} attempt={attempt??{language:'python',code:challenge.code}} onSave={setAttempt} /></>}</section>;
}