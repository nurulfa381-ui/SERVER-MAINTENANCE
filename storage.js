window.C05Storage = {
  key: "c05ServerMaintenanceState",
  teacherKey: "c05TeacherAssessmentV5",

  defaults() {
    return {
      lang: "ms",
      student: null,
      xp: 0,
      coins: 0,
      level: 1,
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
      audio: true
    };
  },

  teacherDefaults() {
    return { version: 5, students: {}, updatedAt: null };
  },

  normaliseId(value) {
    return String(value || "").trim().toUpperCase();
  },

  ktKey(number) {
    return `kt${String(Number(number)).padStart(2, "0")}`;
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return this.defaults();
      const saved = JSON.parse(raw);
      const base = this.defaults();
      const state = {
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
      return this.syncOfficialToState(state, false);
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
      if (!raw) return this.teacherDefaults();
      const saved = JSON.parse(raw);
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
    if (!cleanName || !cleanId) return { ok: false, message: "Nama dan ID pelajar diperlukan." };

    const data = this.loadTeacherData();
    const existing = data.students[cleanId] || {};
    data.students[cleanId] = {
      name: cleanName,
      id: cleanId,
      className: String(className || existing.className || "").trim(),
      officialMarks: existing.officialMarks && typeof existing.officialMarks === "object" ? existing.officialMarks : {},
      createdAt: existing.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.saveTeacherData(data);
    return { ok: true, student: data.students[cleanId] };
  },

  deleteStudent(id) {
    const cleanId = this.normaliseId(id);
    const data = this.loadTeacherData();
    if (!data.students[cleanId]) return false;
    delete data.students[cleanId];
    return this.saveTeacherData(data);
  },

  saveOfficialMark(id, ktNumber, score, note = "") {
    const cleanId = this.normaliseId(id);
    const kt = Number(ktNumber);
    const mark = Math.max(0, Math.min(100, Math.round(Number(score))));
    if (!cleanId || !Number.isInteger(kt) || kt < 1 || kt > 10 || Number.isNaN(mark)) {
      return { ok: false, message: "Maklumat markah tidak sah." };
    }

    const data = this.loadTeacherData();
    const student = data.students[cleanId];
    if (!student) return { ok: false, message: "Pelajar belum didaftarkan." };

    const key = this.ktKey(kt);
    const existing = student.officialMarks?.[key];
    if (existing?.locked) {
      return { ok: false, locked: true, message: `${key.toUpperCase()} telah rasmi dan dikunci.` };
    }

    const locked = mark >= 60;
    student.officialMarks[key] = {
      score: mark,
      official: locked,
      locked,
      status: locked ? "TERAMPIL" : "BELUM RASMI",
      note: String(note || "").trim(),
      updatedAt: new Date().toISOString(),
      lockedAt: locked ? new Date().toISOString() : null
    };
    student.updatedAt = new Date().toISOString();
    this.saveTeacherData(data);
    return { ok: true, locked, record: student.officialMarks[key] };
  },

  emergencyUnlock(id, ktNumber) {
    const cleanId = this.normaliseId(id);
    const data = this.loadTeacherData();
    const key = this.ktKey(ktNumber);
    const record = data.students?.[cleanId]?.officialMarks?.[key];
    if (!record) return { ok: false, message: "Rekod tidak ditemui." };
    record.locked = false;
    record.official = false;
    record.status = "DIBUKA SEMULA";
    record.unlockedAt = new Date().toISOString();
    this.saveTeacherData(data);
    return { ok: true };
  },

  getStudentOfficial(id) {
    const cleanId = this.normaliseId(id);
    return this.loadTeacherData().students[cleanId] || null;
  },

  syncOfficialToState(state, persist = true) {
    if (!state?.student?.id) return state;
    const studentRecord = this.getStudentOfficial(state.student.id);
    if (!studentRecord) {
      state.officialMarks = {};
      state.completedKT = [];
      state.unlockedKP = 1;
      state.unlocked = 1;
      if (persist) this.save(state);
      return state;
    }

    state.student.name = studentRecord.name || state.student.name;
    state.officialMarks = studentRecord.officialMarks || {};
    state.completedKT = [];
    let highestUnlocked = 1;
    for (let i = 1; i <= 10; i++) {
      const record = state.officialMarks[this.ktKey(i)];
      if (record?.official && record?.locked && Number(record.score) >= 60) {
        state.completedKT.push(i);
        if (i < 10) highestUnlocked = Math.max(highestUnlocked, i + 1);
      }
    }
    state.unlockedKP = highestUnlocked;
    state.unlocked = highestUnlocked;
    if (persist) this.save(state);
    return state;
  },

  completeKP(state, kpNumber) {
    const kp = Number(kpNumber);
    if (!Number.isInteger(kp) || kp < 1 || kp > 10) return state;
    if (!state.completedKP.includes(kp)) state.completedKP.push(kp);
    this.save(state);
    return state;
  },

  // KT dalam sistem ialah latihan/ulang kaji sahaja.
  saveKTResult(state, ktNumber, score) {
    const kt = Number(ktNumber);
    const mark = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    if (!Number.isInteger(kt) || kt < 1 || kt > 10) return state;
    const key = this.ktKey(kt);
    state.ktScores[key] = mark;
    state.ktAttempts[key] = (state.ktAttempts[key] || 0) + 1;
    state.ktBestScores[key] = Math.max(Number(state.ktBestScores[key] || 0), mark);
    this.save(state);
    return state;
  },

  isKTCompetent(state, ktNumber) {
    const record = state.officialMarks?.[this.ktKey(ktNumber)];
    return Boolean(record?.official && record?.locked && Number(record.score) >= 60);
  },

  getKTStatus(state, ktNumber) {
    const record = state.officialMarks?.[this.ktKey(ktNumber)];
    if (record?.locked && record?.official) return "TERAMPIL";
    if (record) return "BELUM RASMI";
    return "BELUM DINILAI";
  },

  getProgress(state) {
    return Math.round(((state.completedKT?.length || 0) / 10) * 100);
  },

  exportJSON(state) {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `c05-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportCSV() {
    const data = this.loadTeacherData();
    const rows = [["Nama Pelajar", "ID Pelajar", "Kelas", ...Array.from({ length: 10 }, (_, i) => `KT${String(i + 1).padStart(2, "0")}`), "Purata Rasmi"]];
    Object.values(data.students).forEach((student) => {
      const marks = Array.from({ length: 10 }, (_, i) => {
        const r = student.officialMarks?.[this.ktKey(i + 1)];
        return r?.official && r?.locked ? Number(r.score) : "";
      });
      const valid = marks.filter((m) => m !== "");
      const average = valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length) : "";
      rows.push([student.name, student.id, student.className || "", ...marks, average]);
    });
    const csv = rows.map((row) => row.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `c05-markah-rasmi-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
};

window.SHStorage = window.C05Storage;
