window.SHV5={
audioEnabled:true,
init(){
this.audioEnabled=localStorage.getItem("shAudio")!=="off";
this.mountIntro();
this.mountToast();
},
mountIntro(){
if(sessionStorage.getItem("shIntroDone"))return;
const wrap=document.createElement("div");
wrap.id="shIntro";
wrap.innerHTML=`<div class="intro-core"><div class="intro-logo">🖥️</div><h1>SERVER HERO™</h1><p>V5 PREMIUM</p><div class="intro-loader"><i></i></div></div>`;
document.body.appendChild(wrap);
setTimeout(()=>wrap.classList.add("show"),50);
setTimeout(()=>{wrap.classList.add("hide");sessionStorage.setItem("shIntroDone","1");setTimeout(()=>wrap.remove(),700)},2200);
},
mountToast(){
if(document.getElementById("shToast"))return;
const el=document.createElement("div");
el.id="shToast";
document.body.appendChild(el);
},
toast(text,icon="⭐"){
const el=document.getElementById("shToast");
if(!el)return;
el.innerHTML=`<span>${icon}</span><b>${text}</b>`;
el.classList.add("show");
setTimeout(()=>el.classList.remove("show"),2200);
},
sound(type="click"){
if(!this.audioEnabled||!("AudioContext" in window||"webkitAudioContext" in window))return;
const C=window.AudioContext||window.webkitAudioContext;
const ctx=new C();
const o=ctx.createOscillator();
const g=ctx.createGain();
o.connect(g);g.connect(ctx.destination);
const map={click:[520,.05],correct:[880,.18],wrong:[180,.22],complete:[1040,.35]};
const [freq,dur]=map[type]||map.click;
o.frequency.value=freq;
g.gain.setValueAtTime(.06,ctx.currentTime);
g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+dur);
o.start();o.stop(ctx.currentTime+dur);
},
toggleAudio(){
this.audioEnabled=!this.audioEnabled;
localStorage.setItem("shAudio",this.audioEnabled?"on":"off");
this.toast(this.audioEnabled?"Audio ON":"Audio OFF",this.audioEnabled?"🔊":"🔇");
},
award(state,{xp=0,coins=0,badge=null,label=""}){
state.xp=(state.xp||0)+xp;
state.coins=(state.coins||0)+coins;
state.badges=state.badges||[];
if(badge&&!state.badges.includes(badge))state.badges.push(badge);
state.history=state.history||[];
state.history.push({time:new Date().toISOString(),xp,coins,badge,label});
SHStorage.save(state);
this.sound("complete");
this.toast(`${label||"Ganjaran"} · +${xp} XP · +${coins} Coin`,"🏆");
},
certificate(state){
const name=state.student?.name||"Pelajar";
const score=n=>Number(state.ktScores?.[String(n)]??state.ktScores?.[`kt${String(n).padStart(2,"0")}`]??state.ktScores?.[`KT${String(n).padStart(2,"0")}`]??0);
const completed=Array.from({length:10},(_,i)=>score(i+1)).filter(v=>v>=60).length;
if(completed<10){this.toast("Sijil dibuka selepas semua 10 KT lulus","🔒");return}
const w=window.open("","_blank");
w.document.write(`<!doctype html><html><head><title>Sijil SERVER HERO</title><style>
body{font-family:Arial;background:#f5f7fb;margin:0;padding:40px}.cert{max-width:1000px;margin:auto;padding:70px;border:14px double #1d4ed8;text-align:center;background:white}.logo{font-size:70px}h1{font-size:48px;color:#0f2f53}h2{font-size:34px;color:#1d4ed8}.line{height:2px;background:#d8e3f0;margin:30px}.meta{display:flex;justify-content:space-around;margin-top:45px}@media print{button{display:none}body{background:white;padding:0}}</style></head><body><div class="cert"><div class="logo">🖥️</div><h1>SIJIL PENCAPAIAN</h1><p>Dengan ini disahkan bahawa</p><h2>${name}</h2><p>telah menyelesaikan ${completed} daripada 10 modul SERVER HERO™</p><div class="line"></div><p>XP: ${state.xp||0} · Coin: ${state.coins||0}</p><div class="meta"><span>Tarikh: ${new Date().toLocaleDateString("ms-MY")}</span><span>SERVER HERO™ V5 PREMIUM</span></div><br><button onclick="print()">Cetak / Save PDF</button></div></body></html>`);
w.document.close();
},
teacherReport(state){
const score=n=>Number(state.ktScores?.[String(n)]??state.ktScores?.[`kt${String(n).padStart(2,"0")}`]??state.ktScores?.[`KT${String(n).padStart(2,"0")}`]??0);
const scores=Array.from({length:10},(_,i)=>score(i+1));
const rows=scores.map((v,i)=>`<tr><td>KT${String(i+1).padStart(2,"0")}</td><td>${v?v+"%":"—"}</td><td>${v>=60?"Terampil":v?"Belum Terampil":"Belum Dijawab"}</td></tr>`).join("");
const average=scores.filter(v=>v>0).length?Math.round(scores.filter(v=>v>0).reduce((a,b)=>a+b,0)/scores.filter(v=>v>0).length):0;
const w=window.open("","_blank");
w.document.write(`<!doctype html><html><head><title>Laporan Guru</title><style>body{font-family:Arial;padding:28px;background:#f4f7fb}.box{max-width:1000px;margin:auto;background:white;padding:30px;border-radius:16px}table{width:100%;border-collapse:collapse}th,td{padding:12px;border:1px solid #ccd6e0;text-align:left}h1{color:#14365b}</style></head><body><div class="box"><h1>Dashboard Guru</h1><p><b>Pelajar:</b> ${state.student?.name||"-"}</p><p><b>ID:</b> ${state.student?.id||"-"}</p><p><b>KP selesai:</b> ${Math.min((state.completedKP||[]).filter(n=>n>=1&&n<=10).length,10)}/10 · <b>KT lulus:</b> ${scores.filter(v=>v>=60).length}/10 · <b>Purata:</b> ${average}%</p><p><b>XP:</b> ${state.xp||0} · <b>Coin:</b> ${state.coins||0}</p><table><thead><tr><th>Penilaian</th><th>Markah</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table></div></body></html>`);
w.document.close();
}
};
document.addEventListener("DOMContentLoaded",()=>SHV5.init());
document.addEventListener("click",e=>{if(e.target.closest("button"))SHV5.sound("click")});
