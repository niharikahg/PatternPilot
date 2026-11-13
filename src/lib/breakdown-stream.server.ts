import { streamResponse } from '@lovable.dev/ai-gateway';
import { BREAKDOWN_SYSTEM, breakdownSchema } from './breakdown.functions';
import { completedFields } from './partial-breakdown';
export async function streamBreakdown(request: Request) {
  const body: unknown=await request.json();
  if(!body||typeof body!=='object'||!('problem' in body)||typeof body.problem!=='string'||body.problem.trim().length<10||body.problem.length>8000) return Response.json({error:'Please use a problem between 10 and 8000 characters.'},{status:400});
  const problem=body.problem;
  const encoder=new TextEncoder();
  const output=new ReadableStream({async start(controller){
    const send=(value:unknown)=>controller.enqueue(encoder.encode(JSON.stringify(value)+'\n'));
    try {
      const stream=await streamResponse({model:'openai/gpt-6-astra',instructions:BREAKDOWN_SYSTEM,reasoning:{effort:'low'},input:[{role:'user',content:`Problem: ${problem}\nReturn JSON with Understand and Examples first.`}],text:{format:{type:'json_schema',name:'breakdown',strict:true,schema:breakdownSchema}}},{signal:request.signal});
      let text=''; const sent=new Set<string>();
      for await(const event of stream){if(event.type==='response.output_text.delta'){text+=event.delta;const fields=completedFields(text);for(const [key,value] of Object.entries(fields))if(!sent.has(key)){sent.add(key);send({section:key,value});}}}
      send({complete:JSON.parse(text)});
    }catch(error){console.error('Breakdown stream failed',error instanceof Error?error.message:'unknown');send({error:'Could not finish this problem. Your input is still saved.'});}
    finally{controller.close();}
  }});
  return new Response(output,{headers:{'Content-Type':'application/x-ndjson','Cache-Control':'no-store'}});
}