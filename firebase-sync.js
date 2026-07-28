window.FirebaseSync = {
  enabled: false,
  database: null,
  dbFunctions: null,
  pendingKey: "c05FirebasePendingV1",

  init({ database, ref, set, update, get, onValue }) {
    this.database = database;
    this.dbFunctions = { ref, set, update, get, onValue };
    this.enabled = true;
    console.log("Firebase Sync C05 aktif.");
    this.flushPending();
  },

  normaliseId(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[.#$/[\]]/g, "_");
  },

  readPending() {
    try {
      const raw = localStorage.getItem(this.pendingKey);
      const data = raw ? JSON.parse(raw) : {};
      return data && typeof data === "object" ? data : {};
    } catch (error) {
      console.warn("Firebase: gagal membaca queue sync.", error);
      return {};
    }
  },

  writePending(data) {
    try {
      localStorage.setItem(this.pendingKey, JSON.stringify(data || {}));
    } catch (error) {
      console.warn("Firebase: gagal menyimpan queue sync.", error);
    }
  },

  queueStudentState(state) {
    if (!state?.student?.id) return;
    const pending = this.readPending();
    pending.studentState = state;
    this.writePending(pending);
  },

  queueTeacherData(data) {
    if (!data?.students) return;
    const pending = this.readPending();
    pending.teacherData = data;
    this.writePending(pending);
  },

  async flushPending() {
    if (!this.enabled) return false;
    const pending = this.readPending();
    let changed = false;

    if (pending.studentState) {
      const ok = await this.saveStudentState(pending.studentState, false);
      if (ok) {
        delete pending.studentState;
        changed = true;
      }
    }

    if (pending.teacherData) {
      const ok = await this.saveTeacherData(pending.teacherData, false);
      if (ok) {
        delete pending.teacherData;
        changed = true;
      }
    }

    if (changed) this.writePending(pending);
    return changed;
  },

  async saveStudentState(state, queueOnFail = true) {
    if (!state?.student?.id) return false;
    if (!this.enabled) {
      if (queueOnFail) this.queueStudentState(state);
      return false;
    }

    try {
      const id = this.normaliseId(state.student.id);
      const studentRef = this.dbFunctions.ref(this.database, `C05/students/${id}`);

      await this.dbFunctions.update(studentRef, {
        name: String(state.student.name || "").trim(),
        id,
        className: String(state.student.className || state.student.class || "").trim(),
        avatar: state.student.avatar || "",
        xp: Number(state.xp || 0),
        coins: Number(state.coins || 0),
        unlockedKP: Number(state.unlockedKP || state.unlocked || 1),
        completedKP: Array.isArray(state.completedKP) ? state.completedKP : [],
        completedKT: Array.isArray(state.completedKT) ? state.completedKT : [],
        ktScores: state.ktScores || {},
        ktBestScores: state.ktBestScores || {},
        ktAttempts: state.ktAttempts || {},
        officialMarks: state.officialMarks || {},
        badges: Array.isArray(state.badges) ? state.badges : [],
        progress:
          typeof window.C05Storage?.getProgress === "function"
            ? window.C05Storage.getProgress(state)
            : 0,
        courseCompleted: Boolean(state.courseCompleted),
        updatedAt: new Date().toISOString()
      });

      return true;
    } catch (error) {
      console.warn("Firebase: gagal sync data pelajar.", error);
      if (queueOnFail) this.queueStudentState(state);
      return false;
    }
  },

  async saveTeacherData(data, queueOnFail = true) {
    if (!data?.students) return false;
    if (!this.enabled) {
      if (queueOnFail) this.queueTeacherData(data);
      return false;
    }

    try {
      const updates = {};

      Object.entries(data.students).forEach(([rawId, student]) => {
        const id = this.normaliseId(rawId);
        updates[`C05/teacher/students/${id}`] = {
          ...student,
          id,
          updatedAt: student.updatedAt || new Date().toISOString()
        };
      });

      if (!Object.keys(updates).length) return true;
      const rootRef = this.dbFunctions.ref(this.database);
      await this.dbFunctions.update(rootRef, updates);
      return true;
    } catch (error) {
      console.warn("Firebase: gagal sync rekod pengajar.", error);
      if (queueOnFail) this.queueTeacherData(data);
      return false;
    }
  },

  listenTeacherStudents(callback) {
    if (!this.enabled || typeof callback !== "function") return null;
    const studentsRef = this.dbFunctions.ref(this.database, "C05/teacher/students");
    return this.dbFunctions.onValue(studentsRef, (snapshot) => {
      callback(snapshot.val() || {});
    });
  }
};
