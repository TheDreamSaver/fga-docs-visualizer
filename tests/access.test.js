const {test}=require('node:test');
const assert=require('node:assert/strict');
const {once}=require('node:events');
const {createApp}=require('../server');
const Retriever=require('../lib/FgaRetriever');
const docs=[{pageContent:'Public API',metadata:{doc_id:'document:public_api_docs'}},{pageContent:'Secret budget',metadata:{doc_id:'document:finance_performance'}},{pageContent:'Missing metadata',metadata:{}}];
async function run(t,overrides={}) {
 const seen=[];
 const app=createApp({env:{DEMO_MODE:'true'},vectorStore:{similaritySearch:async()=>docs},fgaClient:{listObjects:async()=>({objects:['document:public_api_docs']})},generate:async(q,d)=>{seen.push(d);return 'Public summary'},...overrides});
 const server=app.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>{server.closeAllConnections();server.close()});
 const request=(body,headers={})=>fetch(`http://127.0.0.1:${server.address().port}/api/chat`,{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)});
 return{request,seen};
}
test('only authorized excerpts reach generation',async t=>{const f=await run(t);const r=await f.request({userId:'sales_bob',message:'What is public?'});assert.equal(r.status,200);assert.deepEqual(f.seen[0].map(d=>d.metadata.doc_id),['document:public_api_docs']);assert.equal((await r.json()).documentsAccessed,1)});
test('caller cannot disable authorization without server opt-in',async t=>{const f=await run(t);assert.equal((await f.request({userId:'sales_bob',message:'budget',fgaEnabled:false})).status,403);assert.equal(f.seen.length,0)});
test('authorization outage prevents generation',async t=>{const f=await run(t,{fgaClient:{listObjects:async()=>{throw Error('down')}}});assert.equal((await f.request({userId:'sales_bob',message:'budget'})).status,503);assert.equal(f.seen.length,0)});
test('empty authorization result returns no context and makes no model call',async t=>{const f=await run(t,{fgaClient:{listObjects:async()=>({objects:[]})}});const r=await f.request({userId:'sales_bob',message:'budget'});assert.equal((await r.json()).accessDenied,true);assert.equal(f.seen.length,0)});
test('invalid personas and malformed comparison flags are rejected',async t=>{const f=await run(t);assert.equal((await f.request({userId:'__proto__',message:'hello'})).status,400);assert.equal((await f.request({userId:'sales_bob',message:'hello',fgaEnabled:'false'})).status,400)});
test('cross-origin requests cannot use the local API',async t=>{const f=await run(t);assert.equal((await f.request({userId:'sales_bob',message:'hello'},{Origin:'https://evil.example'})).status,403)});
test('persona demo refuses a public or production server',()=>{assert.throws(()=>createApp({env:{DEMO_MODE:'true',HOST:'0.0.0.0'}}));assert.throws(()=>createApp({env:{DEMO_MODE:'true',NODE_ENV:'production'}}));assert.throws(()=>createApp({env:{}}))});
test('missing metadata never grants document access',async()=>{const r=new Retriever({similaritySearch:async()=>docs},{listObjects:async()=>({objects:['document:finance_performance']})},'user:test');assert.deepEqual((await r.getRelevantDocuments('query')).map(d=>d.pageContent),['Secret budget'])});
