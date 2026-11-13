import {useState} from 'react';
import {Bug,Loader2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {createBugChallenge} from '@/lib/bug-practice.functions';
import {CodePractice} from './CodePractice';
export function BugPractice({problem}:{problem:string}) {
 const [challenge,setChallenge]=useState<{code:string;failing_input:string;expected_output:string}|null>(null);
 const [pending,setPending]=useState(false);const [error,setError]=useState('');
 const generate=async()=>{setPending(true);setError('');try{setChallenge(await createBugChallenge({data:{problem}}));}catch{setError('The bug challenge could not be prepared. Try again when ready.');}finally{setPending(false);}};
 return <section className="border-y py-5"><div className="flex flex-wrap items-center gap-3"><h3 className="flex items-center gap-2 font-display text-xl font-bold"><Bug className="size-5"/> Spot the bug</h3><Button variant="outline" disabled={pending} onClick={()=>void generate()}>{pending?<Loader2 className="size-4 animate-spin"/>:<Bug className="size-4"/>}{challenge?'New bug':'Give me broken code'}</Button></div>{error&&<p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}{challenge&&<><div className="mt-4 grid gap-3 sm:grid-cols-2"><p className="font-mono text-sm">Failing input: {challenge.failing_input}</p><p className="font-mono text-sm">Expected: {challenge.expected_output}</p></div><CodePractice key={challenge.code} problem={problem} attempt={{language:'python',code:challenge.code}} onSave={()=>{}} /></>}</section>;
}