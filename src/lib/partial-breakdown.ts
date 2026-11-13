/** Read only fully closed top-level JSON fields from a streamed JSON object. */
export function completedFields(text: string): Record<string, unknown> {
  const fields: Record<string, unknown> = {};
  let depth=0, quoted=false, escape=false, start=-1;
  for(let i=0;i<text.length;i++) {
    const char=text[i];
    if(quoted){if(escape) escape=false; else if(char==='\\') escape=true; else if(char==='"') quoted=false; continue;}
    if(char==='"'){quoted=true;if(depth===1&&start<0)start=i;continue;}
    if(char==='{'||char==='[')depth++;
    if(char==='}'||char===']')depth--;
    if(start>=0&&((char===','&&depth===1)||(char==='}'&&depth===0))) {
      try{Object.assign(fields,JSON.parse(`{${text.slice(start,i)}}`));}catch{}
      start=-1;
    }
  }
  return fields;
}