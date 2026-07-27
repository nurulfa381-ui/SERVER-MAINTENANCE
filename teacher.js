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

function isAuthenticated(){ return sessionStorage.getItem("c05TeacherAuth") === "1"; }
function setNotice(message, type="ok"){ notice = { message, type }; }

function renderLogin(){
  root.innerHTML = `<section class="login-wrap"><div class="login-card"><div class="brand">👨‍🏫 MOD GURU C05</div><p class="muted">Rekod Markah Rasmi Kertas Tugasan</p><div class="field"><label>PIN Mod Guru</label><input id="pin" type="password" inputmode="numeric" maxlength="8" placeholder="Masukkan PIN"></div><button class="btn primary wide" onclick="loginTeacher()">MASUK</button><p><a href="index.html" style="color:#9bd2ff">← Kembali ke dashboard</a></p></div></section>`;
}

function loginTeacher(){
  const pin = document.getElementById("pin").value.trim();
  if(pin !== TEACHER_PIN){ alert("PIN Mod Guru tidak betul."); return; }
  sessionStorage.setItem("c05TeacherAuth","1");
  renderTeacher();
}

function logoutTeacher(){ sessionStorage.removeItem("c05TeacherAuth"); selectedId=""; renderLogin(); }

function stats(data){
  const students = Object.values(data.students);
  let official=0, pending=0;
  students.forEach((s)=>Object.values(s.officialMarks||{}).forEach((r)=>{ if(r.locked&&r.official) official++; else pending++; }));
  return { students:students.length, official, pending };
}

function renderTeacher(){
  const data = SHStorage.loadTeacherData();
  const students = Object.values(data.students).sort((a,b)=>a.name.localeCompare(b.name));
  if(selectedId && !data.students[selectedId]) selectedId="";
  if(!selectedId && students[0]) selectedId=students[0].id;
  const selected = selectedId ? data.students[selectedId] : null;
  const s = stats(data);

  root.innerHTML = `<div class="shell">
    <header class="topbar"><div><h1>👨‍🏫 MOD GURU C05</h1><div class="muted">Markah ≥60% menjadi rasmi dan dikunci secara automatik.</div></div><div class="actions"><button class="btn secondary" onclick="SHStorage.exportCSV()">📊 Export CSV</button><a class="btn secondary" href="index.html" style="text-decoration:none">🏠 Dashboard</a><button class="btn danger" onclick="logoutTeacher()">Keluar</button></div></header>
    ${notice ? `<div class="notice ${notice.type}">${esc(notice.message)}</div>` : ""}
    <section class="summary"><article><span>Pelajar</span><b>${s.students}</b></article><article><span>Markah Rasmi</span><b>${s.official}</b></article><article><span>Belum Rasmi</span><b>${s.pending}</b></article><article><span>KT Dipilih</span><b>${ktLabel(selectedKT)}</b></article></section>
    <div class="view-tabs"><button class="btn tab ${activeView==="batch"?"active":""}" onclick="setView('batch')">📝 Isi Satu Kelas</button><button class="btn tab ${activeView==="individual"?"active":""}" onclick="setView('individual')">👤 Seorang Pelajar</button></div>
    <div class="grid">
      <aside class="panel"><h2>Daftar Pelajar</h2><div class="field"><label>Nama Pelajar</label><input id="studentName" placeholder="Nama penuh"></div><div class="field"><label>ID Pelajar</label><input id="studentId" placeholder="Contoh: A001"></div><div class="field"><label>Kelas</label><input id="className" placeholder="Contoh: SKM3A"></div><button class="btn primary wide" onclick="addStudent()">＋ Daftar / Kemas Kini</button><hr style="border-color:#21435e;margin:20px 0"><h2>Senarai Pelajar</h2><div class="student-list">${students.length ? students.map((st)=>studentItem(st)).join("") : `<div class="empty">Belum ada pelajar.</div>`}</div></aside>
      <section class="panel">${activeView === "batch" ? renderBatch(students) : (selected ? `<h2>${esc(selected.name)} · ${esc(selected.id)}</h2>${renderMarks(selected)}` : `<div class="empty">Daftar atau pilih pelajar untuk memasukkan markah rasmi.</div>`)}</section>
    </div>
  </div>`;
  notice = null;
}

function setView(view){ activeView = view; renderTeacher(); }

function studentItem(student){
  const count = Object.values(student.officialMarks||{}).filter((r)=>r.locked&&r.official).length;
  return `<div class="student-item ${selectedId===student.id?"active":""}" onclick="selectStudent('${esc(student.id)}')"><div><b>${esc(student.name)}</b><small>${esc(student.id)}${student.className?` · ${esc(student.className)}`:""}</small></div><span class="status-pill">${count}/10</span></div>`;
}

function renderBatch(students){
  const tabs = Array.from({length:10},(_,i)=>`<button class="btn tab ${selectedKT===i+1?"active":""}" onclick="selectKT(${i+1})">${ktLabel(i+1)}</button>`).join("");
  if(!students.length) return `<h2>Rekod Markah Satu Kelas</h2><div class="tabs">${tabs}</div><div class="empty">Daftar pelajar dahulu.</div>`;
  const rows = students.map((student,index)=>{
    const r = student.officialMarks?.[keyOf(selectedKT)];
    const locked = Boolean(r?.locked && r?.official);
    const status = locked ? "🔒 RASMI" : r ? "✏️ BELUM RASMI" : "BELUM DINILAI";
    return `<tr class="${locked?"row-locked":""}"><td>${index+1}</td><td class="name-cell"><b>${esc(student.name)}</b><small>${esc(student.id)}${student.className?` · ${esc(student.className)}`:""}</small></td><td><input class="batch-mark" id="batch_${esc(student.id)}" type="number" min="0" max="100" value="${r?.score ?? ""}" ${locked?"disabled":""} placeholder="0–100"></td><td><span class="state-badge ${locked?"official":r?"pending":""}">${status}</span></td><td>${locked?`<button class="btn secondary mini" onclick="adminUnlockBatch('${esc(student.id)}')">🛡️ Buka</button>`:`<span class="muted">Boleh dikemas kini</span>`}</td></tr>`;
  }).join("");
  return `<div class="batch-head"><div><h2>Rekod Markah ${ktLabel(selectedKT)}</h2><p class="muted">Isi markah semua pelajar. Markah 60% ke atas terus rasmi dan dikunci.</p></div><button class="btn primary" onclick="saveAllMarks()">💾 SIMPAN SEMUA</button></div><div class="tabs">${tabs}</div><div class="table-wrap"><table class="report-table batch-table"><thead><tr><th>Bil</th><th>Pelajar</th><th>Markah</th><th>Status</th><th>Tindakan</th></tr></thead><tbody>${rows}</tbody></table></div><button class="btn primary save-bottom" onclick="saveAllMarks()">💾 SIMPAN SEMUA MARKAH ${ktLabel(selectedKT)}</button>`;
}

function renderMarks(student){
  return `<div class="mark-grid">${Array.from({length:10},(_,i)=>{
    const n=i+1,key=keyOf(n),r=student.officialMarks?.[key],locked=Boolean(r?.locked&&r?.official);
    const state = locked ? `🔒 RASMI · TERAMPIL` : r ? `✏️ BELUM RASMI · boleh diubah` : `Belum dinilai`;
    return `<article class="mark-card ${locked?"locked":""}"><h3>${ktLabel(n)}</h3><input id="mark${n}" type="number" min="0" max="100" value="${r?.score ?? ""}" ${locked?"disabled":""} placeholder="0–100"><div class="state">${state}${r?.updatedAt?`<br><small>${new Date(r.updatedAt).toLocaleString("ms-MY")}</small>`:""}</div><button class="btn ${locked?"success":"primary"} wide" ${locked?"disabled":""} onclick="saveMark(${n})">${locked?"DIKUNCI":"SIMPAN"}</button>${locked?`<button class="btn secondary wide" style="margin-top:8px" onclick="adminUnlock(${n})">🛡️ Buka Kunci</button>`:""}</article>`;
  }).join("")}</div>`;
}

function addStudent(){
  const result = SHStorage.registerStudent({ name:document.getElementById("studentName").value, id:document.getElementById("studentId").value, className:document.getElementById("className").value });
  if(!result.ok){ setNotice(result.message,"error"); renderTeacher(); return; }
  selectedId=result.student.id; setNotice("Pelajar berjaya didaftarkan."); renderTeacher();
}
function selectStudent(id){ selectedId=id; activeView="individual"; renderTeacher(); }
function selectKT(n){ selectedKT=n; activeView="batch"; renderTeacher(); }

function saveMark(n){
  if(!selectedId) return;
  const input=document.getElementById(`mark${n}`);
  if(input.value===""){ setNotice("Masukkan markah 0 hingga 100.","error"); renderTeacher(); return; }
  const result=SHStorage.saveOfficialMark(selectedId,n,input.value);
  if(!result.ok){ setNotice(result.message,"error"); renderTeacher(); return; }
  setNotice(result.locked ? `${ktLabel(n)} mencapai 60% ke atas: markah rasmi dan telah dikunci.` : `${ktLabel(n)} masih belum rasmi dan boleh dikemas kini.`);
  renderTeacher();
}

function saveAllMarks(){
  const data = SHStorage.loadTeacherData();
  const entries = [];
  Object.values(data.students).forEach((student)=>{
    const input = document.getElementById(`batch_${student.id}`);
    if(!input || input.disabled || input.value === "") return;
    entries.push({ id: student.id, score: input.value });
  });
  if(!entries.length){ setNotice("Tiada markah baharu untuk disimpan.","error"); renderTeacher(); return; }
  const result = SHStorage.saveOfficialMarksBulk(selectedKT, entries);
  if(!result.ok){ setNotice(result.message || "Markah gagal disimpan.","error"); renderTeacher(); return; }
  setNotice(`${ktLabel(selectedKT)}: ${result.saved} rekod disimpan, ${result.locked} menjadi rasmi dan dikunci, ${result.pending} masih belum rasmi.`);
  renderTeacher();
}

function adminUnlock(n){
  const pin=prompt("Masukkan PIN Admin untuk membuka markah rasmi:");
  if(pin!==ADMIN_PIN){ alert("PIN Admin tidak betul."); return; }
  if(!confirm(`Buka semula markah ${ktLabel(n)}?`)) return;
  const result=SHStorage.emergencyUnlock(selectedId,n);
  setNotice(result.ok?"Markah berjaya dibuka semula oleh Admin.":result.message,result.ok?"ok":"error");
  renderTeacher();
}

function adminUnlockBatch(studentId){
  const pin=prompt("Masukkan PIN Admin untuk membuka markah rasmi:");
  if(pin!==ADMIN_PIN){ alert("PIN Admin tidak betul."); return; }
  if(!confirm(`Buka semula markah ${ktLabel(selectedKT)} untuk pelajar ini?`)) return;
  const result=SHStorage.emergencyUnlock(studentId,selectedKT);
  setNotice(result.ok?"Markah berjaya dibuka semula oleh Admin.":result.message,result.ok?"ok":"error");
  renderTeacher();
}

if(isAuthenticated()) renderTeacher(); else renderLogin();
