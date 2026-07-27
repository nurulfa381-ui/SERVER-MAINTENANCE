window.C05Storage = {
  key: "c05ServerMaintenanceState",

  defaults() {
    return {
      lang: "ms",
      student: null,
      xp: 0,
      coins: 0,
      level: 1,
      unlocked: 1,
      unlockedKP: 1,
      completedKP: [],
      completedKT: [],
      ktScores: {},
      ktBestScores: {},
      ktAttempts: {},
      badges: [],
      teacherRecords: {},
      teacherHistory: [],
      projector: false,
      audio: true
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return this.defaults();
      const saved = JSON.parse(raw);
      const base = this.defaults();
      const unlocked = Math.max(1, Math.min(10, Number(saved.unlocked ?? saved.unlockedKP ?? 1) || 1));
      return {
        ...base,
        ...saved,
        unlocked,
        unlockedKP: unlocked,
        completedKP: Array.isArray(saved.completedKP) ? saved.completedKP : [],
        completedKT: Array.isArray(saved.completedKT) ? saved.completedKT : [],
        badges: Array.isArray(saved.badges) ? saved.badges : [],
        ktScores: saved.ktScores && typeof saved.ktScores === "object" ? saved.ktScores : {},
        ktBestScores: saved.ktBestScores && typeof saved.ktBestScores === "object" ? saved.ktBestScores : {},
        ktAttempts: saved.ktAttempts && typeof saved.ktAttempts === "object" ? saved.ktAttempts : {},
        teacherRecords: saved.teacherRecords && typeof saved.teacherRecords === "object" ? saved.teacherRecords : {},
        teacherHistory: Array.isArray(saved.teacherHistory) ? saved.teacherHistory : []
      };
    } catch (error) {
      console.error("Gagal membaca data C05:", error);
      return this.defaults();
    }
  },

  save(state) {
    try {
      const unlocked = Math.max(1, Math.min(10, Number(state.unlocked ?? state.unlockedKP ?? 1) || 1));
      state.unlocked = unlocked;
      state.unlockedKP = unlocked;
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

  completeKP(state, kpNumber) {
    const kp = Number(kpNumber);
    if (!Number.isInteger(kp) || kp < 1 || kp > 10) return state;
    if (!state.completedKP.includes(kp)) state.completedKP.push(kp);
    this.save(state);
    return state;
  },

  saveKTResult(state, ktNumber, score, options = {}) {
    const kt = Number(ktNumber);
    const mark = Math.max(0, Math.min(100, Math.round(Number(score) || 0)));
    if (!Number.isInteger(kt) || kt < 1 || kt > 10) return state;

    const key = `kt${String(kt).padStart(2, "0")}`;
    const previousBest = Number(state.ktBestScores?.[key] ?? state.ktScores?.[key] ?? state.ktScores?.[String(kt)] ?? 0);
    state.ktScores[key] = mark;
    state.ktScores[String(kt)] = mark;
    state.ktAttempts[key] = (state.ktAttempts[key] || 0) + 1;
    state.ktBestScores[key] = Math.max(previousBest, mark);

    if (mark >= 60) {
      if (!state.completedKT.includes(kt)) state.completedKT.push(kt);
      if (!state.completedKP.includes(kt)) state.completedKP.push(kt);
      const nextKP = kt < 10 ? kt + 1 : 10;
      state.unlocked = Math.max(Number(state.unlocked) || 1, nextKP);
      state.unlockedKP = state.unlocked;
    }

    if (options.reward !== false && previousBest < 60 && mark >= 60) {
      state.xp = (Number(state.xp) || 0) + 150;
      state.coins = (Number(state.coins) || 0) + 75;
    }

    this.refreshBadges(state);
    this.save(state);
    return state;
  },

  refreshBadges(state) {
    if (!Array.isArray(state.badges)) state.badges = [];
    const add = id => { if (!state.badges.includes(id)) state.badges.push(id); };
    if (state.student) add("first-login");
    if ((state.completedKP || []).includes(1)) add("kp01-complete");
    if ((state.completedKT || []).includes(1)) add("kt01-competent");
    if ((state.completedKP || []).length >= 5) add("five-kp");
    if ((state.completedKT || []).length >= 5) add("five-kt");
    if (Object.values(state.ktBestScores || {}).some(v => Number(v) === 100)) add("perfect-score");
    if ((state.completedKP || []).length >= 10) add("all-kp");
    if ((state.completedKT || []).length >= 10) add("all-kt");
    if ((state.completedKT || []).length >= 10) add("c05-master");
  },

  saveTeacherMark(state, payload) {
    const name = String(payload.name || "").trim();
    const id = String(payload.id || "").trim();
    const className = String(payload.className || "").trim();
    const note = String(payload.note || "").trim();
    const kt = Number(payload.kt);
    const score = Math.max(0, Math.min(100, Math.round(Number(payload.score) || 0)));
    if (!name || !id || !Number.isInteger(kt) || kt < 1 || kt > 10) {
      throw new Error("Maklumat pelajar, KT dan markah mesti lengkap.");
    }

    const recordKey = id.toLowerCase();
    const existing = state.teacherRecords[recordKey] || {
      name, id, className, avatar: "👨‍💻", scores: {}, notes: {}, updatedAt: null
    };
    existing.name = name;
    existing.id = id;
    existing.className = className;
    existing.scores[`kt${String(kt).padStart(2, "0")}`] = score;
    existing.notes[`kt${String(kt).padStart(2, "0")}`] = note;
    existing.updatedAt = new Date().toISOString();
    state.teacherRecords[recordKey] = existing;
    state.teacherHistory.unshift({ name, id, className, kt, score, note, date: existing.updatedAt });
    state.teacherHistory = state.teacherHistory.slice(0, 250);

    if (payload.activate !== false) {
      state.student = { name, id, className, avatar: existing.avatar || "👨‍💻" };
      this.applyTeacherRecordToState(state, existing);
    }
    this.save(state);
    return existing;
  },

  applyTeacherRecordToState(state, record) {
    state.student = {
      name: record.name,
      id: record.id,
      className: record.className || "",
      avatar: record.avatar || "👨‍💻"
    };
    state.ktScores = {};
    state.ktBestScores = {};
    state.ktAttempts = {};
    state.completedKT = [];
    state.completedKP = [];
    state.unlocked = 1;
    state.unlockedKP = 1;
    state.xp = Math.max(Number(state.xp) || 0, 50);
    Object.entries(record.scores || {}).forEach(([key, value]) => {
      const kt = Number(String(key).replace(/\D/g, ""));
      if (kt >= 1 && kt <= 10) this.saveKTResult(state, kt, value, { reward: false });
    });
    this.refreshBadges(state);
    this.save(state);
  },

  deleteTeacherRecord(state, id) {
    const key = String(id || "").toLowerCase();
    delete state.teacherRecords[key];
    this.save(state);
  },

  isKTCompetent(state, ktNumber) {
    const key = `kt${String(ktNumber).padStart(2, "0")}`;
    return Number(state.ktBestScores?.[key] ?? state.ktScores?.[key] ?? 0) >= 60;
  },

  getKTStatus(state, ktNumber) {
    const key = `kt${String(ktNumber).padStart(2, "0")}`;
    const score = Number(state.ktBestScores?.[key] ?? state.ktScores?.[key] ?? 0);
    if (score >= 60) return "TERAMPIL";
    if (Object.prototype.hasOwnProperty.call(state.ktScores || {}, key)) return "BELUM TERAMPIL";
    return "BELUM DIJAWAB";
  },

  getProgress(state) {
    const competent = state.completedKT?.filter(kt => kt >= 1 && kt <= 10).length || 0;
    return Math.round((competent / 10) * 100);
  },

  download(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  },

  exportJSON(state) {
    this.download(`c05-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2), "application/json");
  },

  exportCSV(state) {
    const rows = [["Nama Pelajar", "ID Pelajar", "Kelas", "KT", "Markah Tertinggi", "Status", "Bilangan Percubaan"]];
    for (let i = 1; i <= 10; i++) {
      const key = `kt${String(i).padStart(2, "0")}`;
      const best = Number(state.ktBestScores?.[key] ?? state.ktScores?.[key] ?? 0);
      const answered = Object.prototype.hasOwnProperty.call(state.ktScores || {}, key);
      rows.push([state.student?.name || "", state.student?.id || "", state.student?.className || "", `KT${String(i).padStart(2, "0")}`, best, best >= 60 ? "TERAMPIL" : answered ? "BELUM TERAMPIL" : "BELUM DIJAWAB", state.ktAttempts?.[key] || 0]);
    }
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    this.download(`c05-keputusan-${new Date().toISOString().slice(0, 10)}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8;");
  },

  exportTeacherCSV(state) {
    const rows = [["Nama", "ID Pelajar", "Kelas", ...Array.from({length:10}, (_,i)=>`KT${String(i+1).padStart(2,"0")}`), "Purata", "Kemajuan"]];
    Object.values(state.teacherRecords || {}).forEach(record => {
      const marks = Array.from({length:10}, (_,i) => Number(record.scores?.[`kt${String(i+1).padStart(2,"0")}`] ?? ""));
      const valid = marks.filter(v => Number.isFinite(v));
      const average = valid.length ? Math.round(valid.reduce((a,b)=>a+b,0)/valid.length) : 0;
      const progress = marks.filter(v => v >= 60).length * 10;
      rows.push([record.name, record.id, record.className || "", ...marks.map(v => Number.isFinite(v) ? v : ""), average, `${progress}%`]);
    });
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")).join("\n");
    this.download(`c05-rekod-markah-guru-${new Date().toISOString().slice(0,10)}.csv`, "\uFEFF" + csv, "text/csv;charset=utf-8;");
  }
};

window.SHStorage = window.C05Storage;
