import { narrateStory } from './story-audio.functions';
const pending=new Map<string,Promise<string>>();
/** Reuse an in-flight narrator across early generation and the mounted player. */
export function prepareNarration(captions:string[]):Promise<string> {
 const key=JSON.stringify(captions);const existing=pending.get(key);if(existing)return existing;
 const task=narrateStory({data:{captions}}).then(result=>{const bytes=Uint8Array.from(atob(result.base64),c=>c.charCodeAt(0));return URL.createObjectURL(new Blob([bytes],{type:result.contentType}));});
 pending.set(key,task);return task;
}