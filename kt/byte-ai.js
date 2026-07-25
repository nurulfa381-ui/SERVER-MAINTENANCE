window.ByteAI=(function(){
let context="dashboard";
let root=null;
let open=false;

const text={
ms:{
name:"BYTE AI",status:"Pembantu Pembelajaran",
welcome:"Hai! Saya BYTE. Saya akan membantu anda sepanjang misi SERVER HERO.",
tip:"Berikan tip",read:"Baca halaman",progress:"Semak kemajuan",close:"Tutup",
placeholder:"Taip soalan ringkas...",send:"Hantar",
unknown:"Saya belum mempunyai jawapan khusus untuk itu. Cuba pilih Tip atau Baca Halaman.",
dashboardTip:"Mulakan dengan KP yang berstatus TERBUKA. Selesaikan aktiviti dan kuiz untuk membuka misi seterusnya.",
kp01Tip:"Fokus pada Tag/ID server, spesifikasi, sistem operasi, waranti dan manual operasi.",
kp02Tip:"Bezakan penyelenggaraan pencegahan, pembetulan dan ramalan. Jangan lupa backup dan rekod.",kp03Tip:"Fokus pada kawalan akses, suhu, kelembapan, kebakaran, UPS dan prosedur kecemasan.",kp04Tip:"Pilih alat mengikut tugas. Utamakan ESD, shutdown selamat dan jangan paksa komponen.",kp05Tip:"Ikut urutan pemasangan: boot media, bahasa, edisi, Custom Installation, partisi dan kata laluan Administrator.",
progressText:"Kemajuan disimpan secara automatik pada peranti ini."
},
en:{
name:"BYTE AI",status:"Learning Assistant",
welcome:"Hi! I am BYTE. I will help you throughout your SERVER HERO mission.",
tip:"Give a tip",read:"Read page",progress:"Check progress",close:"Close",
placeholder:"Type a short question...",send:"Send",
unknown:"I do not have a specific answer for that yet. Try Tip or Read Page.",
dashboardTip:"Start with a mission marked AVAILABLE. Complete its activity and quiz to unlock the next mission.",
kp01Tip:"Focus on the server Tag/ID, specifications, operating system, warranty and operating manual.",
kp02Tip:"Distinguish preventive, corrective and predictive maintenance. Remember backups and records.",kp03Tip:"Focus on access control, temperature, humidity, fire safety, UPS and emergency procedures.",kp04Tip:"Select tools according to the task. Prioritise ESD protection, safe shutdown and never force components.",kp05Tip:"Follow the installation order: boot media, language, edition, Custom Installation, partition and Administrator password.",
progressText:"Progress is saved automatically on this device."
}
};

function lang(){try{return SHStorage.load().lang||"ms"}catch(e){return"ms"}}
function t(k){return text[lang()][k]}
function addMessage(msg,user=false){
const body=root.querySelector(".byte-body");
const div=document.createElement("div");
div.className="byte-message"+(user?" user":"");
div.textContent=msg;
body.appendChild(div);
body.scrollTop=body.scrollHeight;
}
function speak(textToRead){
if(!("speechSynthesis" in window))return;
speechSynthesis.cancel();
const u=new SpeechSynthesisUtterance(textToRead);
u.lang=lang()==="ms"?"ms-MY":"en-US";
u.rate=.95;
speechSynthesis.speak(u);
}
function pageText(){
const h=document.querySelector("h1")?.innerText||"";
const lead=document.querySelector(".kp-lead")?.innerText||document.querySelector(".welcome")?.innerText||"";
return (h+". "+lead).trim();
}
function tip(){
const key=context==="kp01"?"kp01Tip":context==="kp02"?"kp02Tip":context==="kp03"?"kp03Tip":context==="kp04"?"kp04Tip":context==="kp05"?"kp05Tip":"dashboardTip";
addMessage(t(key));
}
function readPage(){
const txt=pageText();
if(txt){addMessage(txt);speak(txt)}
}
function progress(){
addMessage(t("progressText"));
}
function ask(){
const input=root.querySelector("input");
const q=input.value.trim();
if(!q)return;
addMessage(q,true);
input.value="";
const lower=q.toLowerCase();
if(lower.includes("tip")||lower.includes("petunjuk"))tip();
else if(lower.includes("baca")||lower.includes("read"))readPage();
else if(lower.includes("progress")||lower.includes("kemajuan"))progress();
else addMessage(t("unknown"));
}
function toggle(){
open=!open;
root.querySelector(".byte-panel").classList.toggle("open",open);
root.querySelector(".byte-launcher").style.display=open?"none":"block";
}
function mount(ctx="dashboard"){
context=ctx;
if(document.getElementById("byteAiRoot"))document.getElementById("byteAiRoot").remove();
root=document.createElement("div");
root.id="byteAiRoot";
root.innerHTML=`<button class="byte-launcher" aria-label="BYTE AI">🤖</button>
<div class="byte-panel">
<div class="byte-head"><div class="byte-id"><div class="byte-avatar">🤖</div><div><b>${t("name")}</b><small>${t("status")}</small></div></div><button class="byte-close">×</button></div>
<div class="byte-body"><div class="byte-message">${t("welcome")}</div>
<div class="byte-actions"><button data-a="tip">💡 ${t("tip")}</button><button data-a="read">🔊 ${t("read")}</button><button data-a="progress">📊 ${t("progress")}</button><button data-a="close">✕ ${t("close")}</button></div></div>
<div class="byte-footer"><input placeholder="${t("placeholder")}"><button>${t("send")}</button></div>
</div>`;
document.body.appendChild(root);
root.querySelector(".byte-launcher").onclick=toggle;
root.querySelector(".byte-close").onclick=toggle;
root.querySelector('[data-a="tip"]').onclick=tip;
root.querySelector('[data-a="read"]').onclick=readPage;
root.querySelector('[data-a="progress"]').onclick=progress;
root.querySelector('[data-a="close"]').onclick=toggle;
root.querySelector(".byte-footer button").onclick=ask;
root.querySelector(".byte-footer input").addEventListener("keydown",e=>{if(e.key==="Enter")ask()});
}
return{mount};
})();