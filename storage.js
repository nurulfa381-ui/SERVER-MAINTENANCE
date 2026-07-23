window.C05Storage = {
  key: "c05ServerMaintenanceState",

  defaults() {
    return {
      lang: "ms",
      student: null,

      xp: 0,
      coins: 0,
      level: 1,

      unlockedKP: 1,

      completedKP: [],
      completedKT: [],

      ktScores: {},
      ktBestScores: {},
      ktAttempts: {},

      badges: [],

      projector: false,
      audio: true
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(this.key);

      if (!raw) {
        return this.defaults();
      }

      const saved = JSON.parse(raw);
      const base = this.defaults();

      return {
        ...base,
        ...saved,

        completedKP: Array.isArray(saved.completedKP)
          ? saved.completedKP
          : [],

        completedKT: Array.isArray(saved.completedKT)
          ? saved.completedKT
          : [],

        badges: Array.isArray(saved.badges)
          ? saved.badges
          : [],

        ktScores:
          saved.ktScores &&
          typeof saved.ktScores === "object"
            ? saved.ktScores
            : {},

        ktBestScores:
          saved.ktBestScores &&
          typeof saved.ktBestScores === "object"
            ? saved.ktBestScores
            : {},

        ktAttempts:
          saved.ktAttempts &&
          typeof saved.ktAttempts === "object"
            ? saved.ktAttempts
            : {}
      };
    } catch (error) {
      console.error("Gagal membaca data C05:", error);
      return this.defaults();
    }
  },

  save(state) {
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify(state)
      );

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

    if (
      !Number.isInteger(kp) ||
      kp < 1 ||
      kp > 10
    ) {
      return state;
    }

    if (!state.completedKP.includes(kp)) {
      state.completedKP.push(kp);
    }

    this.save(state);
    return state;
  },

  saveKTResult(state, ktNumber, score) {
    const kt = Number(ktNumber);
    const mark = Math.max(
      0,
      Math.min(100, Math.round(Number(score) || 0))
    );

    if (
      !Number.isInteger(kt) ||
      kt < 1 ||
      kt > 10
    ) {
      return state;
    }

    const key = `kt${String(kt).padStart(2, "0")}`;

    state.ktScores[key] = mark;

    state.ktAttempts[key] =
      (state.ktAttempts[key] || 0) + 1;

    const previousBest =
      Number(state.ktBestScores[key] || 0);

    state.ktBestScores[key] =
      Math.max(previousBest, mark);

    if (
      mark >= 60 &&
      !state.completedKT.includes(kt)
    ) {
      state.completedKT.push(kt);
    }

    if (mark >= 60) {
      if (kt < 10) {
        state.unlockedKP = Math.max(
          state.unlockedKP || 1,
          kt + 1
        );
      } else {
        state.unlockedKP = 10;
      }
    }

    this.save(state);
    return state;
  },

  isKTCompetent(state, ktNumber) {
    const key =
      `kt${String(ktNumber).padStart(2, "0")}`;

    return Number(
      state.ktBestScores?.[key] || 0
    ) >= 60;
  },

  getKTStatus(state, ktNumber) {
    const key =
      `kt${String(ktNumber).padStart(2, "0")}`;

    const score = Number(
      state.ktBestScores?.[key] || 0
    );

    if (score >= 60) {
      return "TERAMPIL";
    }

    if (
      Object.prototype.hasOwnProperty.call(
        state.ktScores || {},
        key
      )
    ) {
      return "BELUM TERAMPIL";
    }

    return "BELUM DIJAWAB";
  },

  getProgress(state) {
    const competent =
      state.completedKT?.filter(
        (kt) => kt >= 1 && kt <= 10
      ).length || 0;

    return Math.round(
      (competent / 10) * 100
    );
  },

  exportJSON(state) {
    const data = JSON.stringify(
      state,
      null,
      2
    );

    const blob = new Blob(
      [data],
      { type: "application/json" }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `c05-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.json`;

    link.click();
    URL.revokeObjectURL(url);
  },

  exportCSV(state) {
    const rows = [
      [
        "Nama Pelajar",
        "No. Kad Pengenalan",
        "KT",
        "Markah Tertinggi",
        "Status",
        "Bilangan Percubaan"
      ]
    ];

    for (let i = 1; i <= 10; i++) {
      const key =
        `kt${String(i).padStart(2, "0")}`;

      const best =
        Number(
          state.ktBestScores?.[key] || 0
        );

      const status =
        best >= 60
          ? "TERAMPIL"
          : Object.prototype.hasOwnProperty.call(
              state.ktScores || {},
              key
            )
            ? "BELUM TERAMPIL"
            : "BELUM DIJAWAB";

      rows.push([
        state.student?.name || "",
        state.student?.id || "",
        `KT${String(i).padStart(2, "0")}`,
        best,
        status,
        state.ktAttempts?.[key] || 0
      ]);
    }

    const csv = rows
      .map((row) =>
        row
          .map((value) =>
            `"${String(value)
              .replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;"
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;
    link.download =
      `c05-keputusan-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    link.click();
    URL.revokeObjectURL(url);
  }
};

window.SHStorage = window.C05Storage;
