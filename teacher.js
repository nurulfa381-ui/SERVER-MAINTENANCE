const root = document.getElementById("teacherApp");
const TEACHER_PIN = "0505";
const ADMIN_PIN = "2019";
let selectedId = "";
let selectedKT = 1;
let activeView = "batch";
let notice = null;

const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[char]));
const keyOf = (n) => SHStorage.ktKey(n);
const ktLabel = (n) => `KT${String(n).padStart(2,"0")}`;
const fmt = (date) => date ? new Date(date).toLocaleString("ms-MY") : "—";

function isAuthenticated(){ return sessionStorage.getItem("c05TeacherAuth") === "1"; }
function setNotice(message, type="ok"){ notice = { message, type }; }

function renderLogin(){
  root.innerHTML = `<section class="login-wrap"><div class="login-card"><div class="brand">👨‍🏫 MOD PEGAWAI PENILAI C05</div><p class="muted">Markah pelatih dipautkan secara automatik pada peranti dan browser yang sama.</p><div class="field"><label>PIN Mod Pegawai Penilai</label><input id="pin" type="password" inputmode="numeric" maxlength="8" placeholder="Masukkan PIN"></div><button class="btn primary wide" onclick="loginTeacher()">MASUK</button><p><a href="index.html" style="color:#9bd2ff">← Kembali ke dashboard</a></p></div></section>`;
}
function loginTeacher(){ const pin=document.getElementById("pin").value.trim(); if(pin!==TEACHER_PIN){alert("PIN tidak betul.");return;} sessionStorage.setItem("c05TeacherAuth","1"); renderTeacher(); }
function logoutTeacher(){ sessionStorage.removeItem("c05TeacherAuth"); selectedId=""; renderLogin(); }

function stats(data){
  const students=Object.values(data.students); let practice=0,official=0,pending=0;
  students.forEach(s=>{
    practice += Object.keys(s.practiceMarks||{}).length;
    for(let i=1;i<=10;i++){
      const p=s.practiceMarks?.[keyOf(i)], r=s.officialMarks?.[keyOf(i)];
      if(r?.locked&&r?.official) official++;
      else if(p) pending++;
    }
  });
  return {students:students.length,practice,official,pending};
}

function renderTeacher(){
  const data=SHStorage.loadTeacherData();
  const students=Object.values(data.students).sort((a,b)=>(a.name||"").localeCompare(b.name||""));
  if(selectedId&&!data.students[selectedId]) selectedId="";
  if(!selectedId&&students[0]) selectedId=students[0].id;
  const selected=selectedId?data.students[selectedId]:null;
  const s=stats(data);
  root.innerHTML=`<div class="shell">
    <header class="topbar"><div><h1>👨‍🏫 MOD PEGAWAI PENILAI C05</h1><div class="muted">Markah pelatih dan markah rasmi dipaparkan bersama.</div></div><div class="actions"><button class="btn secondary" onclick="SHStorage.exportCSV()">📊 Export CSV</button><a class="btn secondary" href="index.html" style="text-decoration:none">🏠 Dashboard</a><button class="btn danger" onclick="logoutTeacher()">Keluar</button></div></header>
    <div class="device-note">ℹ️ Integrasi C05 ini menggunakan localStorage. Rekod muncul secara automatik hanya apabila pelatih dan Pegawai Penilai menggunakan domain GitHub Pages, browser dan peranti yang sama.</div>
    ${notice?`<div class="notice ${notice.type}">${esc(notice.message)}</div>`:""}
    <section class="summary"><article><span>Pelatih</span><b>${s.students}</b></article><article><span>Rekod Latihan</span><b>${s.practice}</b></article><article><span>Markah Rasmi</span><b>${s.official}</b></article><article><span>Menunggu</span><b>${s.pending}</b></article></section>
    <div class="view-tabs"><button class="btn tab ${activeView==="batch"?"active":""}" onclick="setView('batch')">📋 Paparan Satu Kelas</button><button class="btn tab ${activeView==="individual"?"active":""}" onclick="setView('individual')">👤 Seorang Pelatih</button></div>
    <div class="grid"><aside class="panel"><h2>Senarai Pelatih</h2><div class="student-list">${students.length?students.map(studentItem).join(""):`<div class="empty">Belum ada markah daripada pelatih.</div>`}</div></aside><section class="panel">${activeView==="batch"?renderBatch(students):(selected?renderIndividual(selected):`<div class="empty">Pilih pelatih.</div>`)}</section></div>
  </div>`;
  notice=null;
}
function setView(view){activeView=view;renderTeacher();}
function selectStudent(id){selectedId=id;activeView="individual";renderTeacher();}
function selectKT(n){selectedKT=n;activeView="batch";renderTeacher();}

function studentItem(student){
  const practice=Object.keys(student.practiceMarks||{}).length;
  const official=Object.values(student.officialMarks||{}).filter(r=>r?.locked&&r?.official).length;
  return `<div class="student-item ${selectedId===student.id?"active":""}" onclick="selectStudent('${esc(student.id)}')"><div><b>${esc(student.name||"Tanpa Nama")}</b><small>${esc(student.id)}${student.className?` · ${esc(student.className)}`:""}</small></div><span class="status-pill">L ${practice}/10 · R ${official}/10</span></div>`;
}

function renderBatch(students){
  const tabs=Array.from({length:10},(_,i)=>`<button class="btn tab ${selectedKT===i+1?"active":""}" onclick="selectKT(${i+1})">${ktLabel(i+1)}</button>`).join("");
  if(!students.length) return `<h2>Markah Pelatih ↔ Pegawai</h2><div class="tabs">${tabs}</div><div class="empty">Belum ada rekod pelatih.</div>`;
  const key=keyOf(selectedKT);
  const rows=students.map((s,index)=>{
    const p=s.practiceMarks?.[key], r=s.officialMarks?.[key];
    const official=Boolean(r?.official&&r?.locked);
    const practiceScore=p?Number(p.bestScore??p.latestScore??0):null;
    const state=official?"🔒 RASMI":p?(practiceScore>=60?"🟡 MENUNGGU / AUTO RASMI":"🔴 BELUM TERAMPIL"):"BELUM DINILAI";
    const action=official?`<button class="btn secondary mini" onclick="adminUnlockBatch('${esc(s.id)}')">🛡️ Buka</button>`:(p&&practiceScore>=60?`<button class="btn success mini" onclick="confirmPractice('${esc(s.id)}',${selectedKT})">✓ Sahkan</button>`:`<span class="muted">—</span>`);
    return `<tr class="${official?"row-locked":""}"><td>${index+1}</td><td class="name-cell"><b>${esc(s.name)}</b><small>${esc(s.id)}</small></td><td><b>${p?practiceScore+"%":"—"}</b><small>${p?`Cubaan ${p.attempts||1}<br>${fmt(p.submittedAt)}`:""}</small></td><td><b>${official?Number(r.score)+"%":"—"}</b><small>${official?fmt(r.lockedAt||r.updatedAt):""}</small></td><td><span class="state-badge ${official?"official":p?"pending":""}">${state}</span></td><td>${action}</td></tr>`;
  }).join("");
  return `<h2>Markah ${ktLabel(selectedKT)}</h2><p class="muted">Markah latihan dihantar daripada akaun pelatih. Markah 60% ke atas dalam C05 juga dikunci secara automatik sebagai rasmi.</p><div class="tabs">${tabs}</div><div class="table-wrap"><table class="report-table batch-table"><thead><tr><th>Bil</th><th>Pelatih</th><th>Markah Pelatih</th><th>Markah Rasmi</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function renderIndividual(student){
  return `<h2>${esc(student.name)} · ${esc(student.id)}</h2><div class="mark-grid">${Array.from({length:10},(_,i)=>{
    const n=i+1,key=keyOf(n),p=student.practiceMarks?.[key],r=student.officialMarks?.[key],official=Boolean(r?.official&&r?.locked);
    const ps=p?Number(p.bestScore??p.latestScore??0):null;
    return `<article class="mark-card ${official?"locked":""}"><h3>${ktLabel(n)}</h3><div class="score-pair"><div><small>Pelatih</small><b>${p?ps+"%":"—"}</b></div><div><small>Rasmi</small><b>${official?Number(r.score)+"%":"—"}</b></div></div><div class="state">${p?`Cubaan: ${p.attempts||1}<br>${fmt(p.submittedAt)}`:"Belum dijawab"}${official?`<br>🔒 ${r.status||"TERAMPIL"}<br>${fmt(r.lockedAt||r.updatedAt)}`:""}</div>${!official&&p&&ps>=60?`<button class="btn success wide" onclick="confirmPractice('${esc(student.id)}',${n})">✓ SAHKAN MARKAH PELATIH</button>`:""}${official?`<button class="btn secondary wide" onclick="adminUnlockIndividual('${esc(student.id)}',${n})">🛡️ Buka Kunci</button>`:""}</article>`;
  }).join("")}</div>`;
}

function confirmPractice(id,n){
  const name=prompt("Nama Pegawai Penilai:","Pegawai Penilai"); if(name===null)return;
  const result=SHStorage.confirmPracticeMark(id,n,name);
  setNotice(result.ok?`${ktLabel(n)} disahkan sebagai markah rasmi.`:result.message,result.ok?"ok":"error");renderTeacher();
}
function adminUnlockIndividual(id,n){const pin=prompt("PIN Admin:");if(pin!==ADMIN_PIN){alert("PIN Admin tidak betul.");return;}const result=SHStorage.emergencyUnlock(id,n);setNotice(result.ok?"Markah dibuka semula.":result.message,result.ok?"ok":"error");renderTeacher();}
function adminUnlockBatch(id){adminUnlockIndividual(id,selectedKT);}

if(isAuthenticated()) renderTeacher(); else renderLogin();
