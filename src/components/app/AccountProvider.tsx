import {createContext,useContext,useEffect,useState,type ReactNode} from 'react';
import {useQueryClient} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {deviceProgress,loadProgress,saveProgress,progressKey} from '@/lib/progress-sync';
import {useRouter} from '@tanstack/react-router';
type Account={userId:string|null;sync:string;signOut:()=>Promise<void>};
const Context=createContext<Account>({userId:null,sync:'',signOut:async()=>{}});
export const useAccount=()=>useContext(Context);
export function AccountProvider({children}:{children:ReactNode}){
 const [userId,setUserId]=useState<string|null>(null);const [sync,setSync]=useState('');const qc=useQueryClient();const router=useRouter();
 useEffect(()=>{let alive=true;let active:string|null=null;let timer:ReturnType<typeof setInterval>|undefined;let previous='';let busy=false;
 const attach=async(id:string|null)=>{if(active===id)return;active=id;if(timer)clearInterval(timer);setUserId(id);setSync('');if(!id)return;setSync('Syncing…');try{await loadProgress(id);if(!alive||active!==id)return;await saveProgress(id,deviceProgress());previous=JSON.stringify(deviceProgress());setSync('Progress synced');qc.invalidateQueries();router.invalidate();timer=setInterval(async()=>{if(busy)return;const values=deviceProgress();const serialized=JSON.stringify(values);if(serialized===previous)return;busy=true;try{await saveProgress(id,values);previous=serialized;setSync('Progress synced');}catch{setSync('Sync paused — progress is safe on this device');}finally{busy=false;}},2000);}catch{setSync('Sync paused — progress is safe on this device');}};
 void supabase.auth.getUser().then(({data})=>{if(alive)void attach(data.user?.id??null);});
 const {data:{subscription}}=supabase.auth.onAuthStateChange((event,session)=>{if(!['SIGNED_IN','SIGNED_OUT','USER_UPDATED'].includes(event))return;setTimeout(()=>{if(alive)void attach(session?.user.id??null);},0);});
 return()=>{alive=false;subscription.unsubscribe();if(timer)clearInterval(timer);};},[qc,router]);
 const signOut=async()=>{await qc.cancelQueries();if(userId)await saveProgress(userId,deviceProgress());qc.clear();await supabase.auth.signOut();for(const key of Object.keys(deviceProgress()))if(progressKey(key))localStorage.removeItem(key);setUserId(null);await router.navigate({to:'/auth',replace:true});};
 return <Context.Provider value={{userId,sync,signOut}}>{children}</Context.Provider>;
}