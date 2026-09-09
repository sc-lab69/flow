const configured=()=>globalThis.ECO_CONFIG||{backend:'platform',maxUploadMB:10};
export function connectionInfo(){const c=configured();return {google:c.backend==='google',ready:c.backend!=='google'||/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(c.appsScriptUrl||''),maxUploadMB:c.maxUploadMB||5};}
async function rpc(action,payload={},classCode=''){
 const c=configured();if(!connectionInfo().ready)throw Error('ครูยังไม่ได้เชื่อมระบบส่งงาน กรุณาเก็บไฟล์ .sb3 ไว้ก่อน');
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),90000);
 try{const r=await fetch(c.appsScriptUrl,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,classCode,...payload}),redirect:'follow',signal:controller.signal});const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error||'ติดต่อระบบส่งงานไม่สำเร็จ');return data;}
 catch(e){if(e.name==='AbortError')throw Error('ระบบตอบช้า กรุณาดูเกมของเพื่อนก่อนส่งซ้ำ');if(e instanceof TypeError)throw Error('ติดต่อ Google ไม่ได้ ตรวจอินเทอร์เน็ตและสิทธิ์ Web app กับครู');throw e;}finally{clearTimeout(timer);}
}
export async function listProjects(classCode=''){if(connectionInfo().google)return(await rpc('list',{},classCode)).projects;const r=await fetch('api/projects');if(!r.ok)throw Error('ยังโหลดผลงานไม่ได้ กรุณาลองอีกครั้ง');return r.json();}
export async function uploadProject(form,classCode=''){
 if(connectionInfo().google){const file=form.get('file');const b=await file.arrayBuffer();let binary='';for(const byte of new Uint8Array(b))binary+=String.fromCharCode(byte);return rpc('upload',{requestId:form.get('requestId'),title:form.get('title'),author:form.get('author'),description:form.get('description'),filename:file.name,base64:btoa(binary)},classCode);}
 const r=await fetch('api/projects',{method:'POST',body:form});const data=await r.json();if(!r.ok)throw Error(data.error||'ส่งงานไม่สำเร็จ');return data;
}
export async function projectBytes(id,classCode=''){
 if(id==='example'||id==='starter'||id==='movement'){const r=await fetch(id+'.sb3');if(!r.ok)throw Error('ไม่พบไฟล์ตัวอย่าง');return r.arrayBuffer();}
 if(connectionInfo().google){const result=await rpc('file',{id},classCode);return Uint8Array.from(atob(result.base64),c=>c.charCodeAt(0)).buffer;}
 if(!/^[a-f0-9-]{36}$/.test(id))throw Error('รหัสผลงานไม่ถูกต้อง');const r=await fetch('api/projects/'+id);if(!r.ok)throw Error('โหลดไฟล์ไม่ได้');return r.arrayBuffer();
}
export async function downloadProject(id,classCode=''){const bytes=await projectBytes(id,classCode);const u=URL.createObjectURL(new Blob([bytes],{type:'application/octet-stream'}));const a=document.createElement('a');a.href=u;a.download='scratch-eco-'+id+'.sb3';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);}
