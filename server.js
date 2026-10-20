const express=require('express');const {JSDOM}=require('jsdom');const {Readability}=require('@mozilla/readability');const TurndownService=require('turndown');
const PAY_TO='0x3d95D4A6DbaE0Cd0643a82b13A13b08921D6ADf7';const FAC='https://facilitator.payai.network';
const PORT=process.env.PORT||4021;
const PUBLIC=process.env.RENDER_EXTERNAL_URL||process.env.PUBLIC_URL||('http://localhost:'+PORT);
const app=express();
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64');
function reqs(){return {scheme:'exact',network:'eip155:8453',amount:'10000',asset:'0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',payTo:PAY_TO,maxTimeoutSeconds:120,extra:{name:'USD Coin',version:'2'}}}
function pr(err){return {x402Version:2,error:err,resource:{url:PUBLIC+'/markdown',description:'Fetch any public web page and return clean, readable Markdown (Readability main-content extraction). GET /markdown?url=<page>',mimeType:'application/json'},accepts:[reqs()],
 extensions:{bazaar:{info:{input:{type:'http',method:'GET',queryParams:{url:'https://example.com'}},output:{type:'json',example:{title:'Example Domain',markdown:'# Example Domain ...'}}},schema:{type:'object',properties:{input:{type:'object',properties:{queryParams:{type:'object',properties:{url:{type:'string',description:'Public http(s) URL to convert'}},required:['url']}}}}}}}}}
app.get('/',(q,r)=>r.json({service:'web-to-markdown',paid:'GET /markdown?url=... $0.01 USDC on Base (x402 v2)',payTo:PAY_TO}));
app.get('/markdown',async(q,r)=>{
 const sig=q.get('payment-signature')||q.get('x-payment');
 if(!sig){const p=pr('Payment required');r.set('PAYMENT-REQUIRED',b64(p));return r.status(402).json(p);}
 let payload;try{payload=JSON.parse(Buffer.from(sig,'base64').toString())}catch{const p=pr('Malformed payment');r.set('PAYMENT-REQUIRED',b64(p));return r.status(402).json(p)}
 const body={x402Version:2,paymentPayload:payload,paymentRequirements:reqs()};
 const post=(p)=>fetch(FAC+p,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).then(x=>x.json());
 try{const v=await post('/verify');if(!v.isValid){const p=pr(v.invalidReason||'invalid');r.set('PAYMENT-REQUIRED',b64(p));return r.status(402).json(p)}}catch(e){return r.status(502).json({error:'facilitator verify failed'})}
 const url=q.query.url;if(!/^https?:\/\//.test(url||''))return r.status(400).json({error:'url query param required'});
 let out;try{const res=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 x402-md'},signal:AbortSignal.timeout(15000)});const html=await res.text();const dom=new JSDOM(html,{url});const art=new Readability(dom.window.document).parse();const td=new TurndownService({headingStyle:'atx',codeBlockStyle:'fenced'});out={url,title:art?.title||dom.window.document.title,markdown:td.turndown(art?.content||html)}}catch(e){return r.status(422).json({error:'fetch/convert failed: '+e.message})}
 try{const s=await post('/settle');if(!s.success)return r.status(402).json({error:'settle failed',detail:s});r.set('PAYMENT-RESPONSE',b64(s));r.set('X-PAYMENT-RESPONSE',b64(s))}catch(e){return r.status(502).json({error:'settle failed'})}
 r.json(out)});
app.listen(PORT,()=>console.log('listening',PORT,PUBLIC));
