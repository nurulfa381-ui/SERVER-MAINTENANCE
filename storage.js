window.C05Storage = {
  key: "c05ServerMaintenanceState",
  teacherKey: "c05TeacherAssessmentV61",

  defaults() {
    return {
      version: 6.1,
      lang: "ms",
      student: null,
      xp: 0,
      coins: 0,
      unlockedKP: 1,
      unlocked: 1,
      completedKP: [],
      completedKT: [],
      ktScores: {},
      ktBestScores: {},
      ktAttempts: {},
      officialMarks: {},
      badges: [],
      projector: false,
      audio: true,
      courseCompleted: false
    };
  },

  teacherDefaults() {
    return { version: 6.1, students: {}, updatedAt: null };
  },

  normaliseId(value) {
    return String(value || "").trim().toUpperCase();
  },

  ktKey(number) {
    return `kt${String(Number(number)).padStart(2, "0")}`;
  },

  normaliseState(saved = {}) {
    const base = this.defaults();
    return {
      ...base,
      ...saved,
      completedKP: Array.isArray(saved.completedKP) ? saved.completedKP : [],
      completedKT: Array.isArray(saved.completedKT) ? saved.completedKT : [],
      badges: Array.isArray(saved.badges) ? saved.badges : [],
      ktScores: saved.ktScores && typeof saved.ktScores === "object" ? saved.ktScores : {},
      ktBestScores: saved.ktBestScores && typeof saved.ktBestScores === "object" ? saved.ktBestScores : {},
      ktAttempts: saved.ktAttempts && typeof saved.ktAttempts === "object" ? saved.ktAttempts : {},
      officialMarks: saved.officialMarks && typeof saved.officialMarks === "object" ? saved.officialMarks : {}
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      const state = this.normaliseState(raw ? JSON.parse(raw) : {});
      return this.recalculate(state, false);
    } catch (error) {
      console.error("Gagal membaca data C05:", error);
      return this.defaults();
    }
  },

  save(state) {
    try {
      localStorage.setItem(this.key, JSON.stringify(state));
      return true;
    } catch (error) {
      console.error("Gagal menyimpan data C05:", error);
      return false;
    }
  },

  reset() {
    localStorage.removeItem(this.key);
    return this.defaults();
  },

  loadTeacherData() {
    try {
      const raw = localStorage.getItem(this.teacherKey);
      const saved = raw ? JSON.parse(raw) : {};
      return {
        ...this.teacherDefaults(),
        ...saved,
        students: saved.students && typeof saved.students === "object" ? saved.students : {}
      };
    } catch (error) {
      console.error("Gagal membaca rekod guru:", error);
      return this.teacherDefaults();
    }
  },

  saveTeacherData(data) {
    try {
      data.updatedAt = new Date().toISOString();
      localStorage.setItem(this.teacherKey, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Gagal menyimpan rekod guru:", error);
      return false;
    }
  },

  registerStudent({ name, id, className = "" }) {
    const cleanId = this.normaliseId(id);
    const cleanName = String(name || "").trim();
    if (!cleanName || !cleanId) return { ok:false, message:"Nama dan ID pelajar diperlukan." };

    const data = this.loadTeacherData();
    const existing = data.students[cleanId] || {};
    data.students[cleanId] = {
      name: cleanName,
      id: cleanId,
      className: String(className || existing.className || "").trim(),
      practiceMarks: existing.practiceMarks && typeof existing.practiceMarks === "object" ? existing.practiceMarks : {},
      practiceMarks: existing.practiceMarks && typeof existing.practiceMarks === "object" ? existing.practiceMarks : {},
      officialMarks: existing.officialMarks && typeof existing.officialMarks === "object" ? existing.officialMarks : {},
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveTeacherData(data);
    return { ok:true, student:data.students[cleanId] };
  },

  ensureStudentRecord(state) {
    if (!state?.student?.id) return null;
    const id = this.normaliseId(state.student.id);
    const data = this.loadTeacherData();
    const existing = data.students[id] || {};
    data.students[id] = {
      name: String(state.student.name || existing.name || "").trim(),
      id,
      className: existing.className || "",
      officialMarks: existing.officialMarks && typeof existing.officialMarks === "object" ? existing.officialMarks : {},
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveTeacherData(data);
    return data.students[id];
  },

  mirrorPracticeToTeacher(state, ktNumber, score) {
    if (!state?.student?.id) return false;
    const id = this.normaliseId(state.student.id);
    const data = this.loadTeacherData();
    const existing = data.students[id] || {};
    const key = this.ktKey(ktNumber);
    const previous = existing.practiceMarks?.[key] || {};
    const mark = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));

    data.students[id] = {
      name: String(state.student.name || existing.name || "").trim(),
      id,
      className: String(state.student.className || state.student.class || existing.className || "").trim(),
      practiceMarks: {
        ...(existing.practiceMarks || {}),
        [key]: {
          latestScore: mark,
          bestScore: Math.max(Number(previous.bestScore || 0), mark),
          attempts: Number(previous.attempts || 0) + 1,
          status: mark >= 60 ? "TERAMPIL" : "BELUM TERAMPIL",
          source: "PELATIH",
          submittedAt: new Date().toISOString()
        }
      },
      officialMarks: existing.officialMarks && typeof existing.officialMarks === "object" ? existing.officialMarks : {},
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return this.saveTeacherData(data);
  },

  getPracticeTeacherRecord(id, ktNumber) {
    const student = this.getStudentOfficial(id);
    return student?.practiceMarks?.[this.ktKey(ktNumber)] || null;
  },

  getStudentOfficial(id) {
    const cleanId = this.normaliseId(id);
    return this.loadTeacherData().students[cleanId] || null;
  },

  deleteStudent(id) {
    const cleanId = this.normaliseId(id);
    const data = this.loadTeacherData();
    if (!data.students[cleanId]) return false;
    delete data.students[cleanId];
    return this.saveTeacherData(data);
  },

  getPracticeScore(state, ktNumber) {
    const key = this.ktKey(ktNumber);
    return Number(state.ktBestScores?.[key] ?? state.ktScores?.[key] ?? state.ktScores?.[String(ktNumber)] ?? 0);
  },

  getOfficialRecord(state, ktNumber) {
    return state.officialMarks?.[this.ktKey(ktNumber)] || null;
  },

  getOfficialScore(state, ktNumber) {
    const record = this.getOfficialRecord(state, ktNumber);
    return record?.official && record?.locked ? Number(record.score || 0) : 0;
  },

  isKTCompetent(state, ktNumber) {
    const record = this.getOfficialRecord(state, ktNumber);
    return Boolean(record?.official && record?.locked && Number(record.score) >= 60);
  },

  getKTStatus(state, ktNumber) {
    if (this.isKTCompetent(state, ktNumber)) return "TERAMPIL";
    if (this.getPracticeScore(state, ktNumber) > 0) return "BELUM TERAMPIL";
    return "BELUM DINILAI";
  },

  mirrorOfficialToTeacher(state, ktNumber, record) {
    if (!state?.student?.id || !record) return false;
    const id = this.normaliseId(state.student.id);
    const data = this.loadTeacherData();
    const student = data.students[id] || {
      name: state.student.name || "",
      id,
      className: "",
      practiceMarks: {},
      officialMarks: {},
      createdAt: new Date().toISOString()
    };
    student.practiceMarks = student.practiceMarks || {};
    student.officialMarks = student.officialMarks || {};
    const key = this.ktKey(ktNumber);
    const current = student.officialMarks[key];
    if (!(current?.official && current?.locked)) student.officialMarks[key] = { ...record };
    student.updatedAt = new Date().toISOString();
    data.students[id] = student;
    return this.saveTeacherData(data);
  },

  recalculate(state, persist = true) {
    state = this.normaliseState(state);
    if (state.student?.id) {
      const teacher = this.getStudentOfficial(state.student.id);
      if (teacher?.name) state.student.name = teacher.name;
      if (teacher?.officialMarks) {
        Object.entries(teacher.officialMarks).forEach(([key, rec]) => {
          const local = state.officialMarks[key];
          if (!local || rec?.locked || !local?.locked) state.officialMarks[key] = rec;
        });
      }
    }

    const completed = [];
    let unlocked = 1;
    state.courseCompleted = false;
    for (let i=1;i<=10;i++) {
      if (this.isKTCompetent(state, i)) {
        completed.push(i);
        if (i < 10) unlocked = Math.max(unlocked, i + 1);
        else state.courseCompleted = true;
      }
    }
    state.completedKT = completed;
    state.unlockedKP = unlocked;
    state.unlocked = unlocked;
    if (persist) this.save(state);
    return state;
  },

  syncOfficialToState(state, persist = true) {
    return this.recalculate(state, persist);
  },

  completeKP(state, kpNumber) {
    const kp = Number(kpNumber);
    if (!Number.isInteger(kp) || kp < 1 || kp > 10) return state;
    state.completedKP = Array.isArray(state.completedKP) ? state.completedKP : [];
    if (!state.completedKP.includes(kp)) state.completedKP.push(kp);
    state.completedKP.sort((a,b)=>a-b);
    this.save(state);
    return state;
  },

  saveKTResult(state, ktNumber, score) {
    const kt = Number(ktNumber);
    const raw = Number(score);
    if (!Number.isInteger(kt) || kt < 1 || kt > 10 || Number.isNaN(raw)) return state;

    const mark = Math.max(0, Math.min(100, Math.round(raw)));
    const key = this.ktKey(kt);
    state.ktScores = state.ktScores || {};
    state.ktBestScores = state.ktBestScores || {};
    state.ktAttempts = state.ktAttempts || {};
    state.officialMarks = state.officialMarks || {};

    state.ktScores[key] = mark;
    state.ktScores[String(kt)] = mark;
    state.ktBestScores[key] = Math.max(Number(state.ktBestScores[key] || 0), mark);
    state.ktAttempts[key] = Number(state.ktAttempts[key] || 0) + 1;

    // Pautkan setiap markah pelatih ke paparan Pegawai Penilai.
    this.mirrorPracticeToTeacher(state, kt, mark);

    const existing = state.officialMarks[key];
    if (!(existing?.official && existing?.locked) && mark >= 60) {
      const record = {
        score: mark,
        official: true,
        locked: true,
        status: "TERAMPIL",
        source: "STUDENT_KT",
        updatedAt: new Date().toISOString(),
        lockedAt: new Date().toISOString()
      };
      state.officialMarks[key] = record;
      this.mirrorOfficialToTeacher(state, kt, record);
    }

    state = this.recalculate(state, false);
    this.save(state);
    return state;
  },

  confirmPracticeMark(id, ktNumber, assessorName = "Pegawai Penilai") {
    const cleanId = this.normaliseId(id);
    const kt = Number(ktNumber);
    const data = this.loadTeacherData();
    const student = data.students?.[cleanId];
    const key = this.ktKey(kt);
    const practice = student?.practiceMarks?.[key];
    if (!student || !practice) return { ok:false, message:"Markah pelatih tidak ditemui." };
    if (Number(practice.bestScore) < 60) return { ok:false, message:"Markah pelatih belum mencapai 60%." };
    const current = student.officialMarks?.[key];
    if (current?.locked && current?.official) return { ok:false, locked:true, message:`${key.toUpperCase()} telah rasmi dan dikunci.` };

    student.officialMarks = student.officialMarks || {};
    student.officialMarks[key] = {
      score: Number(practice.bestScore),
      official: true,
      locked: true,
      status: "TERAMPIL",
      source: "PEGAWAI_SAHKAN_MARKAH_PELATIH",
      assessorName: String(assessorName || "Pegawai Penilai").trim(),
      practiceSubmittedAt: practice.submittedAt || null,
      updatedAt: new Date().toISOString(),
      lockedAt: new Date().toISOString()
    };
    student.updatedAt = new Date().toISOString();
    this.saveTeacherData(data);
    return { ok:true, locked:true, record:student.officialMarks[key] };
  },

  saveOfficialMark(id, ktNumber, score, note = "") {
    const cleanId = this.normaliseId(id);
    const kt = Number(ktNumber);
    const raw = Number(score);
    if (!cleanId || !Number.isInteger(kt) || kt < 1 || kt > 10 || Number.isNaN(raw)) {
      return { ok:false, message:"Maklumat markah tidak sah." };
    }
    const mark = Math.max(0, Math.min(100, Math.round(raw)));
    const data = this.loadTeacherData();
    const student = data.students[cleanId];
    if (!student) return { ok:false, message:"Pelajar belum didaftarkan." };
    const key = this.ktKey(kt);
    const existing = student.officialMarks?.[key];
    if (existing?.official && existing?.locked) return { ok:false, locked:true, message:`${key.toUpperCase()} telah rasmi dan dikunci.` };

    const official = mark >= 60;
    student.officialMarks = student.officialMarks || {};
    student.officialMarks[key] = {
      score: mark,
      official,
      locked: official,
      status: official ? "TERAMPIL" : "BELUM RASMI",
      source: "TEACHER",
      note: String(note || "").trim(),
      updatedAt: new Date().toISOString(),
      lockedAt: official ? new Date().toISOString() : null
    };
    student.updatedAt = new Date().toISOString();
    this.saveTeacherData(data);
    return { ok:true, locked:official, record:student.officialMarks[key] };
  },

  saveOfficialMarksBulk(ktNumber, entries) {
    const kt = Number(ktNumber);
    if (!Number.isInteger(kt) || kt < 1 || kt > 10 || !Array.isArray(entries)) return { ok:false, message:"Data markah tidak sah." };
    let saved=0, locked=0, pending=0, skipped=0;
    for (const entry of entries) {
      const result = this.saveOfficialMark(entry.id, kt, entry.score);
      if (!result.ok) { skipped++; continue; }
      saved++;
      if (result.locked) locked++; else pending++;
    }
    return { ok:true, saved, locked, pending, skipped };
  },

  emergencyUnlock(id, ktNumber) {
    const cleanId = this.normaliseId(id);
    const data = this.loadTeacherData();
    const key = this.ktKey(ktNumber);
    const record = data.students?.[cleanId]?.officialMarks?.[key];
    if (!record) return { ok:false, message:"Rekod tidak ditemui." };
    record.locked = false;
    record.official = false;
    record.status = "DIBUKA SEMULA";
    record.unlockedAt = new Date().toISOString();
    this.saveTeacherData(data);
    return { ok:true };
  },

  getProgress(state) {
    return Math.round(((Array.isArray(state.completedKT) ? state.completedKT.length : 0) / 10) * 100);
  },

  exportJSON(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `c05-backup-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  exportCSV() {
    const data = this.loadTeacherData();
    const headers = ["Nama Pelajar","ID Pelajar","Kelas"];
    for (let i=1;i<=10;i++) {
      headers.push(`KT${String(i).padStart(2,"0")} Latihan`);
      headers.push(`KT${String(i).padStart(2,"0")} Rasmi`);
    }
    headers.push("Purata Rasmi");
    const rows = [headers];
    Object.values(data.students).forEach(student => {
      const values = [];
      const officialValues = [];
      for (let i=1;i<=10;i++) {
        const key = this.ktKey(i);
        const p = student.practiceMarks?.[key];
        const r = student.officialMarks?.[key];
        values.push(p ? Number(p.bestScore ?? p.latestScore ?? 0) : "");
        const official = r?.official && r?.locked ? Number(r.score) : "";
        values.push(official);
        if (official !== "") officialValues.push(official);
      }
      const avg = officialValues.length ? Math.round(officialValues.reduce((a,b)=>a+b,0)/officialValues.length) : "";
      rows.push([student.name,student.id,student.className||"",...values,avg]);
    });
    const csv = rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type:"text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `c05-markah-pelatih-dan-rasmi-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }};

window.SHStorage = window.C05Storage;
