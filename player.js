import {projectBytes,connectionInfo} from './cloud-client.js';
const status=document.getElementById('status'),host=document.getElementById('stage');
let codeResolve;const codePromise=new Promise(resolve=>{codeResolve=resolve;});
window.addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='eco-init')codeResolve(String(e.data.classCode||''));});
(async()=>{try{
 if(typeof Scaffolding==='undefined')throw Error('ตัวเล่นยังโหลดไม่ครบ กรุณาเปิดหน้าใหม่');
 const id=new URLSearchParams(location.search).get('project');if(!['example','starter','movement'].includes(id)&&!/^[a-f0-9-]{36}$/.test(id||''))throw Error('รหัสผลงานไม่ถูกต้อง');
 const code=connectionInfo().google&&!['example','starter','movement'].includes(id)?await codePromise:'';
 const bytes=await projectBytes(id,code);let s=new Scaffolding.Scaffolding();s.width=480;s.height=360;s.resizeMode='preserve-ratio';s.shouldConnectPeripherals=false;
 try{s.setup();s.appendTo(host);await s.loadProject(bytes);}catch(e){if(!String(e).includes('WebGL'))throw e;s=await startBasicPlayer(bytes,host,status);}
 status.textContent='พร้อมแล้ว • กดเริ่มใหม่ แล้วเดินด้วยปุ่มลูกศร';
 const keys=new Set();function post(key,down){if(down)keys.add(key);else keys.delete(key);s.vm.postIOData('keyboard',{key,isDown:down});}
 window.addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight',' '].includes(e.key)&&e.target.tagName!=='INPUT'){e.preventDefault();post(e.key,true);}});
 window.addEventListener('keyup',e=>{if(keys.has(e.key)){e.preventDefault();post(e.key,false);}});
 const release=()=>{for(const k of [...keys])post(k,false);document.querySelectorAll('.held').forEach(el=>el.classList.remove('held'));};window.addEventListener('blur',release);document.addEventListener('visibilitychange',()=>{if(document.hidden)release();});
 for(const b of document.querySelectorAll('[data-key]')){b.addEventListener('click',()=>{post(b.dataset.key,true);b.classList.add('held');setTimeout(()=>{post(b.dataset.key,false);b.classList.remove('held');},150);});}

 const start=document.getElementById('start'),stop=document.getElementById('stop');start.disabled=false;stop.disabled=false;
 start.onclick=()=>{release();s.greenFlag();status.textContent='เดินเก็บขยะ 4 ชิ้น แล้วเลือกถังให้ถูกประเภท';host.focus();};stop.onclick=()=>{release();s.vm.stopAll();status.textContent='หยุดแล้ว • กดเริ่มใหม่เพื่อเล่นอีกครั้ง';};
 const timer=setInterval(()=>{const t=s.vm.runtime.targets.find(t=>t.getName()==='ผู้เล่น');if(t)document.getElementById('position').textContent='x: '+Math.round(t.x)+' · y: '+Math.round(t.y);},120);
 window.addEventListener('pagehide',()=>{clearInterval(timer);release();s.vm.stopAll();});
}catch(e){status.textContent=e.message||'เปิดเกมไม่ได้ กรุณาตรวจไฟล์ .sb3';}})();
