/* =========================================================
   SERVER MAINTENANCE C05
   FIREBASE SYNC - FINAL FIX
   =========================================================

   SUMBER UTAMA DATA PELATIH:
   C05/students/{ID}

   DATA PEGAWAI / BACKUP:
   C05/teacher/students/{ID}

   Mod Pegawai Penilai membaca terus:
   C05/students

   ========================================================= */

window.FirebaseSync = {

  enabled: false,
  database: null,
  dbFunctions: null,

  pendingKey: "c05FirebasePendingV1",


  /* =======================================================
     INITIALISE FIREBASE
  ======================================================= */

  init({
    database,
    ref,
    set,
    update,
    get,
    onValue
  }) {

    this.database = database;

    this.dbFunctions = {
      ref,
      set,
      update,
      get,
      onValue
    };

    this.enabled = true;

    console.log(
      "Firebase Sync C05 aktif."
    );

    // Cuba hantar semula data yang tertangguh.
    this.flushPending();
  },


  /* =======================================================
     NORMALISE ID PELATIH
  ======================================================= */

  normaliseId(value) {

    return String(value || "")
      .trim()
      .toUpperCase()
      .replace(/[.#$/[\]]/g, "_");
  },


  /* =======================================================
     OFFLINE / PENDING QUEUE
  ======================================================= */

  readPending() {

    try {

      const raw =
        localStorage.getItem(
          this.pendingKey
        );

      const data =
        raw
          ? JSON.parse(raw)
          : {};

      return (
        data &&
        typeof data === "object"
      )
        ? data
        : {};

    } catch (error) {

      console.warn(
        "Firebase: gagal membaca queue sync.",
        error
      );

      return {};
    }
  },


  writePending(data) {

    try {

      localStorage.setItem(
        this.pendingKey,
        JSON.stringify(
          data || {}
        )
      );

    } catch (error) {

      console.warn(
        "Firebase: gagal menyimpan queue sync.",
        error
      );
    }
  },


  queueStudentState(state) {

    if (
      !state?.student?.id
    ) {
      return;
    }

    const pending =
      this.readPending();

    pending.studentState =
      state;

    this.writePending(
      pending
    );
  },


  queueTeacherData(data) {

    if (
      !data?.students
    ) {
      return;
    }

    const pending =
      this.readPending();

    pending.teacherData =
      data;

    this.writePending(
      pending
    );
  },


  /* =======================================================
     HANTAR SEMULA DATA YANG TERTANGGUH
  ======================================================= */

  async flushPending() {

    if (!this.enabled) {
      return false;
    }

    const pending =
      this.readPending();

    let changed = false;


    // =========================
    // DATA PELATIH
    // =========================

    if (
      pending.studentState
    ) {

      const ok =
        await this.saveStudentState(
          pending.studentState,
          false
        );

      if (ok) {

        delete pending.studentState;

        changed = true;
      }
    }


    // =========================
    // DATA PEGAWAI
    // =========================

    if (
      pending.teacherData
    ) {

      const ok =
        await this.saveTeacherData(
          pending.teacherData,
          false
        );

      if (ok) {

        delete pending.teacherData;

        changed = true;
      }
    }


    if (changed) {

      this.writePending(
        pending
      );
    }

    return changed;
  },


  /* =======================================================
     SIMPAN DATA PELATIH

     FIREBASE:
     C05/students/{ID}
  ======================================================= */

  async saveStudentState(
    state,
    queueOnFail = true
  ) {

    if (
      !state?.student?.id
    ) {
      return false;
    }


    // Firebase belum bersedia
    if (!this.enabled) {

      if (queueOnFail) {

        this.queueStudentState(
          state
        );
      }

      return false;
    }


    try {

      const id =
        this.normaliseId(
          state.student.id
        );


      const studentRef =
        this.dbFunctions.ref(
          this.database,
          `C05/students/${id}`
        );


      await this.dbFunctions.update(
        studentRef,
        {

          name: String(
            state.student.name || ""
          ).trim(),

          id,

          className: String(
            state.student.className ||
            state.student.class ||
            ""
          ).trim(),

          avatar:
            state.student.avatar || "",


          // =====================
          // XP & COINS
          // =====================

          xp:
            Number(
              state.xp || 0
            ),

          coins:
            Number(
              state.coins || 0
            ),


          // =====================
          // PROGRESS KP
          // =====================

          unlockedKP:
            Number(
              state.unlockedKP ||
              state.unlocked ||
              1
            ),

          completedKP:
            Array.isArray(
              state.completedKP
            )
              ? state.completedKP
              : [],


          // =====================
          // PROGRESS KT
          // =====================

          completedKT:
            Array.isArray(
              state.completedKT
            )
              ? state.completedKT
              : [],


          // =====================
          // MARKAH KT
          // =====================

          ktScores:
            state.ktScores || {},

          ktBestScores:
            state.ktBestScores || {},

          ktAttempts:
            state.ktAttempts || {},


          // =====================
          // MARKAH RASMI
          // =====================

          officialMarks:
            state.officialMarks || {},


          // =====================
          // BADGES
          // =====================

          badges:
            Array.isArray(
              state.badges
            )
              ? state.badges
              : [],


          // =====================
          // PROGRESS %
          // =====================

          progress:
            typeof window.C05Storage
              ?.getProgress ===
              "function"

              ? window.C05Storage
                  .getProgress(
                    state
                  )

              : Number(
                  state.progress || 0
                ),


          // =====================
          // COURSE COMPLETED
          // =====================

          courseCompleted:
            Boolean(
              state.courseCompleted
            ),


          // =====================
          // LAST UPDATE
          // =====================

          updatedAt:
            new Date()
              .toISOString()
        }
      );


      return true;


    } catch (error) {

      console.warn(
        "Firebase: gagal sync data pelajar.",
        error
      );


      if (queueOnFail) {

        this.queueStudentState(
          state
        );
      }


      return false;
    }
  },


  /* =======================================================
     SIMPAN DATA PEGAWAI / MARKAH RASMI

     FIREBASE:
     C05/teacher/students/{ID}

     Fungsi ini dikekalkan untuk keserasian
     dengan teacher.js / sistem C05 sedia ada.
  ======================================================= */

  async saveTeacherData(
    data,
    queueOnFail = true
  ) {

    if (
      !data?.students
    ) {
      return false;
    }


    if (!this.enabled) {

      if (queueOnFail) {

        this.queueTeacherData(
          data
        );
      }

      return false;
    }


    try {

      const updates = {};


      Object.entries(
        data.students
      ).forEach(
        ([rawId, student]) => {

          const id =
            this.normaliseId(
              rawId
            );


          updates[
            `C05/teacher/students/${id}`
          ] = {

            ...student,

            id,

            updatedAt:
              student.updatedAt ||
              new Date()
                .toISOString()
          };
        }
      );


      if (
        !Object.keys(
          updates
        ).length
      ) {

        return true;
      }


      const rootRef =
        this.dbFunctions.ref(
          this.database
        );


      await this.dbFunctions.update(
        rootRef,
        updates
      );


      return true;


    } catch (error) {

      console.warn(
        "Firebase: gagal sync rekod pengajar.",
        error
      );


      if (queueOnFail) {

        this.queueTeacherData(
          data
        );
      }


      return false;
    }
  },


  /* =======================================================
     TUKAR FORMAT DATA FIREBASE
     KEPADA FORMAT MOD PEGAWAI PENILAI

     Data pelajar:
       ktScores
       ktBestScores
       ktAttempts
       officialMarks

     Teacher perlukan:
       practiceMarks
       officialMarks
  ======================================================= */

  convertStudentForTeacher(
    rawStudent,
    rawId
  ) {

    const student =
      rawStudent &&
      typeof rawStudent ===
        "object"

        ? rawStudent
        : {};


    const id =
      this.normaliseId(
        student.id ||
        rawId
      );


    const practiceMarks = {};


    const ktScores =
      student.ktScores || {};

    const ktBestScores =
      student.ktBestScores || {};

    const ktAttempts =
      student.ktAttempts || {};


    /* =====================================================
       C05 mempunyai KT01 hingga KT10
    ===================================================== */

    for (
      let number = 1;
      number <= 10;
      number += 1
    ) {

      const padded =
        String(number)
          .padStart(
            2,
            "0"
          );


      /* ===================================================
         Sokong format key lama dan baru
      =================================================== */

      const possibleKeys = [

        `KT${padded}`,
        `kt${padded}`,

        `KT${number}`,
        `kt${number}`,

        String(number)
      ];


      let latestScore;
      let bestScore;
      let attempts;


      for (
        const key of
        possibleKeys
      ) {

        if (
          latestScore ===
            undefined &&
          ktScores[key] !==
            undefined
        ) {

          latestScore =
            ktScores[key];
        }


        if (
          bestScore ===
            undefined &&
          ktBestScores[key] !==
            undefined
        ) {

          bestScore =
            ktBestScores[key];
        }


        if (
          attempts ===
            undefined &&
          ktAttempts[key] !==
            undefined
        ) {

          attempts =
            ktAttempts[key];
        }
      }


      /* ===================================================
         BINA PRACTICE MARK
      =================================================== */

      if (
        latestScore !==
          undefined ||
        bestScore !==
          undefined ||
        attempts !==
          undefined
      ) {

        const finalLatest =
          Number(
            latestScore ??
            bestScore ??
            0
          );


        const finalBest =
          Number(
            bestScore ??
            latestScore ??
            0
          );


        practiceMarks[
          `KT${padded}`
        ] = {

          latestScore:
            finalLatest,

          bestScore:
            finalBest,

          attempts:
            Number(
              attempts || 1
            ),

          submittedAt:
            student.updatedAt ||
            null,

          source:
            "FIREBASE_LEGACY"
        };
      }
    }


    /* =====================================================
       Jika Firebase sudah mempunyai practiceMarks
       versi baharu, utamakan rekod tersebut.
    ===================================================== */

    const existingPractice =
      student.practiceMarks &&
      typeof student.practiceMarks ===
        "object"

        ? student.practiceMarks
        : {};


    return {

      ...student,

      id,

      name:
        student.name ||
        "Tanpa Nama",

      className:
        student.className ||
        student.class ||
        "",


      practiceMarks: {

        ...practiceMarks,

        ...existingPractice
      },


      officialMarks:
        student.officialMarks ||
        {},


      progress:
        Number(
          student.progress || 0
        ),


      unlockedKP:
        Number(
          student.unlockedKP || 1
        ),


      updatedAt:
        student.updatedAt ||
        null
    };
  },


  /* =======================================================
     LISTENER MOD PEGAWAI PENILAI

     *** PEMBETULAN PENTING ***

     MOD PEGAWAI MEMBACA TERUS:

     C05/students

     BUKAN:

     C05/teacher/students

     Ini memastikan semua komputer,
     telefon dan tablet membaca senarai
     pelatih daripada sumber yang sama.
  ======================================================= */

  listenTeacherStudents(
    callback
  ) {

    if (
      !this.enabled ||
      typeof callback !==
        "function"
    ) {

      return null;
    }


    const studentsRef =
      this.dbFunctions.ref(
        this.database,

        "C05/students"
      );


    const unsubscribe =
      this.dbFunctions.onValue(

        studentsRef,

        (snapshot) => {

          const rawStudents =
            snapshot.val() ||
            {};


          const convertedStudents =
            {};


          Object.entries(
            rawStudents
          ).forEach(
            ([rawId, student]) => {

              const converted =
                this.convertStudentForTeacher(
                  student,
                  rawId
                );


              convertedStudents[
                converted.id
              ] = converted;
            }
          );


          console.log(
            "Firebase → Mod Pegawai Penilai:",
            Object.keys(
              convertedStudents
            ).length,
            "pelatih diterima."
          );


          callback(
            convertedStudents
          );
        },


        (error) => {

          console.error(
            "Firebase: gagal membaca data pelatih.",
            error
          );


          callback({});
        }
      );


    return unsubscribe;
  }
};
