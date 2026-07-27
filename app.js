const app = document.getElementById("app"), TXT = SH_TEXT, M = SH_MISSIONS, B = SH_BADGES;
let state = SHStorage.load();
const TEACHER_PIN = "0505";
const t = k => TXT[state.lang || "ms"][k];
const save = () => SHStorage.save(state);
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]));
const ktScore = n => Number(state.ktBestScores?.[`kt${String(n).padStart(2,"0")}`] ?? state.ktScores?.[String(n)] ?? state.ktScores?.[`kt${String(n).padStart(2,"0")}`] ?? 0);
const scores = () => Array.from({length:10}, (_,i) => ktScore(i+1));
const pass = () => scores().filter(v => v >= 60).length;
const avg = () => { const v=scores().filter(x=>x>0); return v.length ? Math.round(v.reduce((a,b)=>a+b,0)/v.length) : 0; };
const level = () => 1 + Math.floor((state.xp || 0) / 500);
const rank = () => level() >= 10 ? (state.lang === "en" ? "Hero" : "Hero") : level() >= 7 ? t("specialist") : level() >= 4 ? t("technician") : t("trainee");
const progress = () => Math.round(pass()/10*100);
const unlocked = () => Math.max(1, Math.min(10, Number(state.unlocked ?? state.unlockedKP ?? 1) || 1));

function renderLanguage(){
  app.innerHTML=`<section class="center"><div class="card hero"><div class="logo">🖥️</div><h1>SERVER HERO™</h1><p>V4 PREMIUM</p><h2>${TXT.ms.choose}<br><small>${TXT.en.choose}</small></h2><div class="lang-grid"><button onclick="choose('ms')">🇲🇾<b>${TXT.ms.bm}</b></button><button class="en" onclick="choose('en')">🇬🇧<b>${TXT.en.en}</b></button></div></div></section>`;
}
function choose(l){ state.lang=l; save(); state.student ? renderDashboard() : renderLogin(); }
function renderLogin(){
  const a=["👨‍💻","👩‍💻","🛡️","⚙️","🧠","🚀"];
  app.innerHTML=`<section class="center"><div class="card login"><h1>SERVER HERO™</h1><h2>${t("login")}</h2><label>${t("name")}</label><input id="name" autocomplete="name"><label>${t("id")}</label><input id="id" autocomplete="off"><h3>${t("avatar")}</h3><div class="avatars">${a.map((x,i)=>`<button class="${i===0?"active":""}" data-a="${x}" onclick="pick(this)">${x}</button>`).join("")}</div><button class="primary wide" onclick="saveLogin()">${t("enter")}</button><button class="teacher-entry" onclick="openTeacherMode()">👨‍🏫 ${state.lang==="en"?"Teacher Mode":"Mod Guru"}</button></div></section>`;
}
function pick(b){ document.querySelectorAll(".avatars button").forEach(x=>x.classList.remove("active")); b.classList.add("active"); }
function saveLogin(){
  const name=document.getElementById("name").value.trim(), id=document.getElementById("id").value.trim();
  if(!name||!id){ alert(t("required")); return; }
  const record=state.teacherRecords?.[id.toLowerCase()];
  if(record){ SHStorage.applyTeacherRecordToState(state, record); }
  else state.student={name,id,avatar:document.querySelector(".avatars .active")?.dataset.a||"👨‍💻"};
  state.xp=Math.max(state.xp||0,50);
  if(!state.badges.includes("first-login")) state.badges.push("first-login");
  save(); renderDashboard();
}
function renderDashboard(){
  const courseComplete=pass()===10;
  const next=courseComplete?null:(M.find(x=>x.id===unlocked())||M.find(x=>!state.completedKP.includes(x.id))||M[M.length-1]);
  app.innerHTML=`<div class="shell ${state.projector?"projector":""}">
<header><div class="student"><span>${state.student.avatar||"👨‍💻"}</span><div><b>${esc(state.student.name)}</b><small>${esc(state.student.id)}</small></div></div><div class="tools"><button onclick="renderLanguage()">🌍 ${t("language")}</button><button onclick="toggleProjector()">📽️ ${t("projector")}</button><button onclick="toggleFullscreen()">⛶ ${t("fullscreen")}</button><button onclick="changeProfile()">👤 ${t("change")}</button><button class="warn" onclick="resetProgress()">↻ ${t("reset")}</button><button class="danger" onclick="logout()">⏻ ${t("logout")}</button></div></header>
<section class="dash-grid"><article class="card profile"><div class="avatar">${state.student.avatar||"👨‍💻"}</div><h2>${esc(state.student.name)}</h2><p>${esc(state.student.id)}</p><div class="rank">⭐ ${rank()}</div><div class="bar"><i style="width:${progress()}%"></i></div><strong>${progress()}%</strong></article>
<article class="card overview"><h1>${t("dashboard")}</h1><p>${courseComplete?(state.lang==="en"?"COURSE COMPLETED — Congratulations, Server Hero!":"KURSUS TAMAT — Tahniah, Server Hero!"):t("welcome")}</p><div class="stats"><article><span>${t("progress")}</span><b>${progress()}%</b></article><article><span>${t("average")}</span><b>${avg()}%</b></article><article><span>${t("level")}</span><b>${level()}</b></article><article><span>${t("xp")}</span><b>${state.xp||0}</b></article><article><span>🪙 ${t("coins")}</span><b class="coin-stat">${state.coins||0}</b></article></div><div class="next"><div><small>${courseComplete?"Status":t("next")}</small><h3>${courseComplete?(state.lang==="en"?"🏆 ALL 10 MISSIONS COMPLETED":"🏆 SEMUA 10 MISI SELESAI"):`KP${String(next.id).padStart(2,"0")} · ${next[state.lang]}`}</h3></div>${courseComplete?`<button onclick="printCertificate()">🎓 ${state.lang==="en"?"Certificate":"Sijil"}</button>`:`<button onclick="openMission(${next.id})">${t("start")} →</button>`}</div>
<div class="v5-actions"><button onclick="toggleAudio()">${state.audio===false?"🔇":"🔊"} Audio</button><button ${courseComplete?"":"disabled"} onclick="printCertificate()">🎓 Sijil</button><button class="teacher-keyin" onclick="openTeacherMode()">📝 Key In Markah</button><button onclick="SHStorage.exportCSV(state)">📊 Export CSV</button><button onclick="SHStorage.exportJSON(state)">💾 Backup JSON</button></div></article></section>
<section class="card missions"><h2>${t("missionMap")}</h2><div class="mission-list">${M.map((m,i)=>{const open=m.id<=unlocked(),done=state.completedKP.includes(m.id);return `<article class="${open?"open":"locked"} ${done?"done":""}"><div class="num">${done?"✓":String(m.id).padStart(2,"0")}</div><div class="icon">${m.icon}</div><div><small>KP${String(m.id).padStart(2,"0")}</small><h3>${m[state.lang]}</h3><small>KT${String(m.id).padStart(2,"0")}: ${ktScore(m.id)>0?`${ktScore(m.id)}% · ${ktScore(m.id)>=60?t("competent"):t("notCompetent")}`:t("ktNotAnswered")}</small></div><span>${done?t("completed"):open?t("available"):t("locked")}</span><button ${open?"":"disabled"} onclick="openMission(${m.id})">${t("start")}</button></article>${i<M.length-1?'<div class="line"></div>':""}`}).join("")}</div></section>
<section class="bottom"><article class="card badges"><h2>${t("badges")}</h2><div class="badge-grid">${B.map(b=>`<article class="${state.badges.includes(b.id)?"earned":"locked"}"><span>${b.icon}</span><small>${b[state.lang]}</small></article>`).join("")}</div></article><article class="card achievements"><h2>${t("achievements")}</h2><div><span>📘</span><b>${state.completedKP.length}/10 KP</b></div><div><span>✅</span><b>${pass()}/10 KT</b></div><div><span>🏆</span><b>${rank()}</b></div></article></section></div>`;
}
function openMission(id){ if(id>=1&&id<=10&&id<=unlocked()){ window.location.href=`kp/kp${String(id).padStart(2,"0")}.html`; return; } renderDashboard(); }
function toggleProjector(){ state.projector=!state.projector; save(); renderDashboard(); }
function toggleFullscreen(){ if(!document.fullscreenElement) document.documentElement.requestFullscreen?.(); else document.exitFullscreen?.(); }
function toggleAudio(){ state.audio=state.audio===false; save(); renderDashboard(); }
function changeProfile(){ state.student=null; save(); renderLogin(); }
function logout(){ if(confirm(t("confirmLogout"))){ state.student=null; save(); renderLanguage(); } }
function resetProgress(){ if(confirm(t("confirmReset"))){ const s=state.student,l=state.lang,records=state.teacherRecords,history=state.teacherHistory; state=SHStorage.defaults(); state.student=s; state.lang=l; state.teacherRecords=records||{}; state.teacherHistory=history||[]; state.xp=50; state.badges=["first-login"]; save(); renderDashboard(); } }
function printCertificate(){ window.print(); }

function openTeacherMode(){
  const pin=prompt(state.lang==="en"?"Enter Teacher PIN:":"Masukkan PIN Guru:");
  if(pin===null) return;
  if(pin!==TEACHER_PIN){ alert(state.lang==="en"?"Invalid PIN.":"PIN tidak sah."); return; }
  showTeacherModal();
}
function showTeacherModal(editId=""){
  document.getElementById("teacherModal")?.remove();
  const record=editId?state.teacherRecords?.[editId.toLowerCase()]:null;
  const scoreOptions=Array.from({length:10},(_,i)=>{const n=i+1,key=`kt${String(n).padStart(2,"0")}`;return `<tr><td>KT${String(n).padStart(2,"0")}</td><td>${record?.scores?.[key]??"—"}%</td><td>${Number(record?.scores?.[key])>=60?"TERAMPIL":record?.scores?.[key]!==undefined?"BELUM TERAMPIL":"BELUM DIJAWAB"}</td></tr>`}).join("");
  const records=Object.values(state.teacherRecords||{}).sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
  const modal=document.createElement("div"); modal.id="teacherModal"; modal.className="teacher-modal";
  modal.innerHTML=`<div class="teacher-dialog"><div class="teacher-head"><div><small>SERVER HERO C05</small><h2>📝 Key In Markah Pelajar</h2></div><button onclick="closeTeacherModal()" aria-label="Tutup">✕</button></div>
  <div class="teacher-tabs"><button class="active" onclick="teacherTab('form',this)">Key In Markah</button><button onclick="teacherTab('records',this)">Senarai Pelajar (${records.length})</button></div>
  <section id="teacher-form" class="teacher-panel active"><div class="teacher-grid"><label>Nama Pelajar<input id="tmName" value="${esc(record?.name||state.student?.name||"")}" placeholder="Contoh: Nur Aina"></label><label>ID Pelajar<input id="tmId" value="${esc(record?.id||state.student?.id||"")}" placeholder="Contoh: P001"></label><label>Kelas<input id="tmClass" value="${esc(record?.className||state.student?.className||"")}" placeholder="Contoh: SKM 3"></label><label>Pilih KT<select id="tmKT">${Array.from({length:10},(_,i)=>`<option value="${i+1}">KT${String(i+1).padStart(2,"0")} / KP${String(i+1).padStart(2,"0")}</option>`).join("")}</select></label><label>Markah (%)<input id="tmScore" type="number" min="0" max="100" step="1" placeholder="0 - 100"></label><label class="span2">Catatan<input id="tmNote" placeholder="Catatan pilihan"></label></div><div class="teacher-info">Markah <b>60% dan ke atas</b> akan menetapkan status TERAMPIL dan membuka KP seterusnya. Rekod yang disimpan akan terus diaktifkan sebagai profil pelajar semasa.</div><div class="teacher-actions"><button class="secondary" onclick="clearTeacherForm()">Kosongkan</button><button class="primary" onclick="saveTeacherEntry()">💾 Simpan Markah</button></div>${record?`<h3>Rekod ${esc(record.name)}</h3><div class="teacher-table-wrap"><table><thead><tr><th>KT</th><th>Markah</th><th>Status</th></tr></thead><tbody>${scoreOptions}</tbody></table></div>`:""}</section>
  <section id="teacher-records" class="teacher-panel"><div class="teacher-record-tools"><input id="recordSearch" oninput="filterTeacherRecords()" placeholder="Cari nama atau ID"><button onclick="SHStorage.exportTeacherCSV(state)">📊 Export Semua CSV</button></div><div id="teacherRecordList" class="teacher-record-list">${renderTeacherRecords(records)}</div></section></div>`;
  document.body.appendChild(modal);
}
function renderTeacherRecords(records){
  if(!records.length) return `<div class="empty-record">Belum ada rekod markah manual.</div>`;
  return records.map(r=>{const marks=Object.values(r.scores||{}).map(Number),valid=marks.filter(Number.isFinite),average=valid.length?Math.round(valid.reduce((a,b)=>a+b,0)/valid.length):0,passed=valid.filter(v=>v>=60).length;return `<article class="teacher-record" data-search="${esc((r.name+" "+r.id+" "+(r.className||"")).toLowerCase())}"><div><h3>${esc(r.name)}</h3><p>${esc(r.id)}${r.className?` · ${esc(r.className)}`:""}</p><small>${passed}/10 KT terampil · Purata ${average}%</small></div><div class="record-actions"><button onclick="activateTeacherRecord('${esc(r.id)}')">Aktifkan</button><button onclick="editTeacherRecord('${esc(r.id)}')">Edit</button><button class="danger" onclick="deleteTeacherRecord('${esc(r.id)}')">Padam</button></div></article>`}).join("");
}
function teacherTab(name,button){ document.querySelectorAll(".teacher-tabs button").forEach(b=>b.classList.remove("active")); button.classList.add("active"); document.querySelectorAll(".teacher-panel").forEach(p=>p.classList.remove("active")); document.getElementById(`teacher-${name}`).classList.add("active"); }
function closeTeacherModal(){ document.getElementById("teacherModal")?.remove(); }
function clearTeacherForm(){ ["tmName","tmId","tmClass","tmScore","tmNote"].forEach(id=>{const el=document.getElementById(id);if(el)el.value="";}); document.getElementById("tmKT").value="1"; }
function saveTeacherEntry(){
  try{
    const payload={name:document.getElementById("tmName").value,id:document.getElementById("tmId").value,className:document.getElementById("tmClass").value,kt:document.getElementById("tmKT").value,score:document.getElementById("tmScore").value,note:document.getElementById("tmNote").value,activate:true};
    if(payload.score===""||Number(payload.score)<0||Number(payload.score)>100) throw new Error("Masukkan markah antara 0 hingga 100.");
    SHStorage.saveTeacherMark(state,payload); state=SHStorage.load(); alert(`Markah ${payload.name} bagi KT${String(payload.kt).padStart(2,"0")} berjaya disimpan.`); closeTeacherModal(); renderDashboard();
  }catch(error){ alert(error.message||"Markah tidak dapat disimpan."); }
}
function activateTeacherRecord(id){ const record=state.teacherRecords?.[String(id).toLowerCase()]; if(!record)return; SHStorage.applyTeacherRecordToState(state,record); state=SHStorage.load(); closeTeacherModal(); renderDashboard(); }
function editTeacherRecord(id){ showTeacherModal(id); }
function deleteTeacherRecord(id){ if(!confirm("Padam semua rekod markah pelajar ini?"))return; SHStorage.deleteTeacherRecord(state,id); state=SHStorage.load(); showTeacherModal(); }
function filterTeacherRecords(){ const q=document.getElementById("recordSearch").value.toLowerCase(); document.querySelectorAll(".teacher-record").forEach(el=>el.hidden=!el.dataset.search.includes(q)); }

state.lang ? (state.student ? renderDashboard() : renderLogin()) : renderLanguage();
