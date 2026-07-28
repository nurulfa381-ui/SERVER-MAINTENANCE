window.FirebaseSync = {
  enabled: false,
  database: null,
  dbFunctions: null,

  init({ database, ref, set, update, get, onValue }) {
    this.database = database;
    this.dbFunctions = { ref, set, update, get, onValue };
    this.enabled = true;
    console.log("Firebase Sync C05 aktif.");
  },

  normaliseId(value) {
    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[.#$/[\]]/g, "_");
  },

  async saveStudentState(state) {
    if (!this.enabled || !state?.student?.id) return false;

    try {
      const id = this.normaliseId(state.student.id);
      const studentRef = this.dbFunctions.ref(
        this.database,
        `C05/students/${id}`
      );

      await this.dbFunctions.update(studentRef, {
        name: String(state.student.name || "").trim(),
        id,
        className: String(
          state.student.className || state.student.class || ""
        ).trim(),
        avatar: state.student.avatar || "",
        xp: Number(state.xp || 0),
        coins: Number(state.coins || 0),
        unlockedKP: Number(state.unlockedKP || state.unlocked || 1),
        completedKP: Array.isArray(state.completedKP)
          ? state.completedKP
          : [],
        completedKT: Array.isArray(state.completedKT)
          ? state.completedKT
          : [],
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
      return false;
    }
  },

  async saveTeacherData(data) {
    if (!this.enabled || !data?.students) return false;

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
      return false;
    }
  },

  listenTeacherStudents(callback) {
    if (!this.enabled || typeof callback !== "function") return null;

    const studentsRef = this.dbFunctions.ref(
      this.database,
      "C05/teacher/students"
    );

    return this.dbFunctions.onValue(studentsRef, snapshot => {
      callback(snapshot.val() || {});
    });
  }
};
