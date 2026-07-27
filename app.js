const app=document.getElementById("app"),TXT=SH_TEXT,M=SH_MISSIONS,B=SH_BADGES;
let state=SHStorage.load();
const t=k=>TXT[state.lang||"ms"][k],save=()=>SHStorage.save(state);
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const ktKey=n=>SHStorage.ktKey(n);
const practiceScore=n=>SHStorage.getPracticeScore(state,n);
const officialRecord=n=>SHStorage.getOfficialRecord(state,n);
const officialScore=n=>SHStorage.getOfficialScore(state,n);
const competent=n=>SHStorage.isKTCompetent(state,n);
const statusLabel=n=>{
  const status=SHStorage.getKTStatus(state,n);
  if(status==="TERAMPIL")return t("officialCompetent");
  if(status==="BELUM TERAMPIL")return state.lang==="en"?"NOT YET COMPETENT":"BELUM TERAMPIL";
  return t("officialNotAssessed");
};
const officialScores=()=>Array.from({length:10},(_,i)=>officialScore(i+1));
const pass=()=>state.completedKT?.length||0;
const avg=()=>{const v=officialScores().filter(x=>x>=60);return v.length?Math.round(v.reduce((a,b)=>a+b,0)/v.length):0};
const level=()=>1+Math.floor((state.xp||0)/500);
const rank=()=>level()>=10?t("expert"):level()>=7?t("specialist"):level()>=4?t("technician"):t("trainee");
const progress=()=>SHStorage.getProgress(state);

function renderLanguage(){
app.innerHTML=`<section class="center"><div class="card hero"><div class="logo">🖥️</div><h1>SERVER HERO™</h1><p>V6 CLEAN ENGINE</p><h2>${TXT.ms.choose}<br><small>${TXT.en.choose}</small></h2><div class="lang-grid"><button onclick="choose('ms')">🇲🇾<b>${TXT.ms.bm}</b></button><button class="en" onclick="choose('en')">🇬🇧<b>${TXT.en.en}</b></button></div></div></section>`;
}
function choose(l){state.lang=l;save();state.student?renderDashboard():renderLogin()}
function renderLogin(){
const a=["👨‍💻","👩‍💻","🛡️","⚙️","🧠","🚀"];
app.innerHTML=`<section class="center"><div class="card login"><h1>SERVER HERO™</h1><h2>${t("login")}</h2><label>${t("name")}</label><input id="name"><label>${t("id")}</label><input id="id"><h3>${t("avatar")}</h3><div class="avatars">${a.map((x,i)=>`<button class="${i===0?"active":""}" data-a="${x}" onclick="pick(this)">${x}</button>`).join("")}</div><button class="primary wide" onclick="saveLogin()">${t("enter")}</button><div class="teacher-entry"><span>${state.lang==="en"?"OR":"ATAU"}</span><button class="teacher-login-btn wide" onclick="location.href='teacher.html'">👨‍🏫 ${t("teacherMode")}</button><small>${state.lang==="en"?"Official KT score record":"Rekod markah rasmi KT"}</small></div></div></section>`;
}
function pick(b){document.querySelectorAll(".avatars button").forEach(x=>x.classList.remove("active"));b.classList.add("active")}
function saveLogin(){
const name=document.getElementById("name").value.trim(),id=document.getElementById("id").value.trim();
if(!name||!id){alert(t("required"));return}
state.student={name,id:SHStorage.normaliseId(id),avatar:document.querySelector(".avatars .active")?.dataset.a||"👨‍💻"};
SHStorage.registerStudent({name:state.student.name,id:state.student.id});
state=SHStorage.recalculate(state,false);
state.xp=Math.max(state.xp||0,50);
state.badges=Array.isArray(state.badges)?state.badges:[];
if(!state.badges.includes("first-login"))state.badges.push("first-login");
save();renderDashboard();
}
function renderDashboard(){
state=SHStorage.load();
state=SHStorage.recalculate(state,true);
const courseComplete=pass()===10;
const next=courseComplete?null:(M.find(x=>x.id===Math.min(Number(state.unlocked)||1,10))||M[M.length-1]);
app.innerHTML=`<div class="shell ${state.projector?"projector":""}">
<header><div class="student"><span>${state.student.avatar}</span><div><b>${esc(state.student.name)}</b><small>${esc(state.student.id)}</small></div></div><div class="tools"><button onclick="renderLanguage()">🌍 ${t("language")}</button><button onclick="toggleProjector()">📽️ ${t("projector")}</button><button onclick="toggleFullscreen()">⛶ ${t("fullscreen")}</button><button onclick="changeProfile()">👤 ${t("change")}</button><button class="warn" onclick="resetProgress()">↻ ${t("reset")}</button><button class="danger" onclick="logout()">⏻ ${t("logout")}</button></div></header>
<section class="dash-grid"><article class="card profile"><div class="avatar">${state.student.avatar}</div><h2>${esc(state.student.name)}</h2><p>${esc(state.student.id)}</p><div class="rank">⭐ ${rank()}</div><div class="bar"><i style="width:${progress()}%"></i></div><strong>${progress()}%</strong></article>
<article class="card overview"><h1>${t("dashboard")}</h1><p>${courseComplete?(state.lang==="en"?"COURSE COMPLETED — Congratulations, Server Hero!":"KURSUS TAMAT — Tahniah, Server Hero!"):t("welcome")}</p><div class="stats"><article><span>${t("progress")}</span><b>${progress()}%</b></article><article><span>${t("average")}</span><b>${avg()}%</b></article><article><span>${t("level")}</span><b>${level()}</b></article><article><span>${t("xp")}</span><b>${state.xp}</b></article><article><span>🪙 ${t("coins")}</span><b class="coin-stat">${state.coins||0}</b></article></div><div class="next"><div><small>${courseComplete?"Status":t("next")}</small><h3>${courseComplete?(state.lang==="en"?"🏆 ALL 10 MISSIONS COMPLETED":"🏆 SEMUA 10 MISI SELESAI"):`KP${String(next.id).padStart(2,"0")} · ${next[state.lang]}`}</h3></div>${courseComplete?`<button onclick="showCertificate()">🎓 ${t("certificate")}</button>`:`<button onclick="openMission(${next.id})">${t("start")} →</button>`}</div>
<div class="v5-actions"><button onclick="toggleAudio()">${state.audio?"🔊":"🔇"} ${t("audio")}</button><button ${courseComplete?"":"disabled"} onclick="showCertificate()">🎓 ${t("certificate")}</button><button onclick="location.href='teacher.html'">👨‍🏫 ${t("teacherMode")}</button><button onclick="SHStorage.exportCSV()">📊 ${t("exportCSV")}</button><button onclick="SHStorage.exportJSON(state)">💾 ${t("backupJSON")}</button></div>
</article></section>
<section class="card missions"><h2>${t("missionMap")}</h2><p class="mission-help">${t("officialUnlockNotice")}</p><div class="mission-list">${M.map((m,i)=>{const open=m.id<=state.unlocked,done=state.completedKP.includes(m.id),practice=practiceScore(m.id),official=officialRecord(m.id),officialValue=official?`${Number(official.score)}%`:"—",isCompetent=competent(m.id);return `<article class="${open?"open":"locked"} ${done?"done":""}"><div class="num">${done?"✓":String(m.id).padStart(2,"0")}</div><div class="icon">${m.icon}</div><div class="mission-main"><small>KP${String(m.id).padStart(2,"0")} · KT${String(m.id).padStart(2,"0")}</small><h3>${m[state.lang]}</h3><div class="score-strip"><span><small>${t("practiceScore")}</small><b>${practice?`${practice}%`:"—"}</b></span><span><small>${t("officialScore")}</small><b>${officialValue}</b></span><span class="status-pill ${isCompetent?"competent":practice?"pending":"empty"}">${statusLabel(m.id)}</span></div></div><span class="mission-access">${done?t("completed"):open?t("available"):t("locked")}</span><button ${open?"":"disabled"} onclick="openMission(${m.id})">${open?t("start"):"🔒"}</button></article>${i<M.length-1?'<div class="line"></div>':""}`}).join("")}</div></section>
<section class="bottom"><article class="card badges"><h2>${t("badges")}</h2><div class="badge-grid">${B.map(b=>`<article class="${state.badges.includes(b.id)?"earned":"locked"}"><span>${b.icon}</span><small>${b[state.lang]}</small></article>`).join("")}</div></article><article class="card achievements"><h2>${t("achievements")}</h2><div><span>📘</span><b>${state.completedKP.length}/10 KP</b></div><div><span>✅</span><b>${pass()}/10 KT</b></div><div><span>🏆</span><b>${rank()}</b></div></article></section>
</div>`;
}
function openMission(id){if(id>=1&&id<=10&&id<=Number(state.unlocked||1)){location.href=`kp/kp${String(id).padStart(2,"0")}.html`;return}alert(t("locked"));}
function toggleAudio(){state.audio=!state.audio;save();renderDashboard()}
function showCertificate(){if(pass()!==10){alert(state.lang==="en"?"Complete all KT first.":"Selesaikan semua KT dahulu.");return}window.print()}
function toggleProjector(){state.projector=!state.projector;save();renderDashboard()}
function toggleFullscreen(){if(!document.fullscreenElement)document.documentElement.requestFullscreen?.();else document.exitFullscreen?.()}
function changeProfile(){state.student=null;save();renderLogin()}
function logout(){if(confirm(t("confirmLogout"))){state.student=null;save();renderLanguage()}}
function resetProgress(){if(confirm(t("confirmReset"))){const s=state.student,l=state.lang;state=SHStorage.defaults();state.student=s;state.lang=l;state.xp=50;state.badges=["first-login"];SHStorage.registerStudent({name:s.name,id:s.id});save();renderDashboard()}}
state.lang?(state.student?renderDashboard():renderLogin()):renderLanguage();
