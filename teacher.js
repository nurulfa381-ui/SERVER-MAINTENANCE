const root = document.getElementById("teacherApp");

const TEACHER_PIN = "0505";
const ADMIN_PIN = "2019";

let selectedId = "";
let selectedKT = 1;
let activeView = "batch";
let notice = null;

let firebaseListenerStarted = false;
let firebaseUnsubscribe = null;
let firebaseRetryTimer = null;

/* =========================================================
   UTILITI
========================================================= */

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));

const keyOf = (number) => SHStorage.ktKey(number);

const ktLabel = (number) =>
  `KT${String(number).padStart(2, "0")}`;

const fmt = (date) =>
  date
    ? new Date(date).toLocaleString("ms-MY")
    : "—";

function isAuthenticated() {
  return sessionStorage.getItem("c05TeacherAuth") === "1";
}

function setNotice(message, type = "ok") {
  notice = { message, type };
}

/* =========================================================
   FIREBASE REALTIME SYNC
========================================================= */

function saveRemoteStudentsToLocal(remoteStudents = {}) {
  try {
    const localData = SHStorage.loadTeacherData();

    const mergedStudents = {
      ...(localData.students || {}),
      ...(remoteStudents || {})
    };

    const updatedData = {
      ...localData,
      students: mergedStudents,
      updatedAt: new Date().toISOString()
    };

    /*
      Simpan terus ke localStorage.

      Kita tidak menggunakan saveTeacherData() di sini supaya data
      yang baru diterima daripada Firebase tidak dihantar semula
      berulang kali ke Firebase.
    */
    localStorage.setItem(
      SHStorage.teacherKey,
      JSON.stringify(updatedData)
    );

    return true;
  } catch (error) {
    console.error(
      "Gagal menyimpan data Firebase ke localStorage:",
      error
    );

    return false;
  }
}

function startFirebaseTeacherListener() {
  if (firebaseListenerStarted) return;

  let attempts = 0;
  const maximumAttempts = 40;

  function connect() {
    attempts += 1;

    if (
      window.FirebaseSync &&
      window.FirebaseSync.enabled &&
      typeof window.FirebaseSync.listenTeacherStudents === "function"
    ) {
      firebaseListenerStarted = true;

      if (firebaseRetryTimer) {
        clearInterval(firebaseRetryTimer);
        firebaseRetryTimer = null;
      }

      firebaseUnsubscribe =
        window.FirebaseSync.listenTeacherStudents(
          (remoteStudents) => {
            const saved =
              saveRemoteStudentsToLocal(remoteStudents);

            if (saved && isAuthenticated()) {
              renderTeacher();
            }
          }
        );

      console.log(
        "Dashboard Pegawai Penilai disambungkan kepada Firebase."
      );

      return;
    }

    if (attempts >= maximumAttempts) {
      if (firebaseRetryTimer) {
        clearInterval(firebaseRetryTimer);
        firebaseRetryTimer = null;
      }

      console.warn(
        "Firebase belum tersedia. Dashboard menggunakan localStorage."
      );
    }
  }

  connect();

  if (!firebaseListenerStarted) {
    firebaseRetryTimer = setInterval(connect, 500);
  }
}

function stopFirebaseTeacherListener() {
  if (typeof firebaseUnsubscribe === "function") {
    firebaseUnsubscribe();
  }

  firebaseUnsubscribe = null;
  firebaseListenerStarted = false;

  if (firebaseRetryTimer) {
    clearInterval(firebaseRetryTimer);
    firebaseRetryTimer = null;
  }
}

/* =========================================================
   LOGIN PEGAWAI PENILAI
========================================================= */

function renderLogin() {
  root.innerHTML = `
    <section class="login-wrap">
      <div class="login-card">

        <div class="brand">
          👨‍🏫 MOD PEGAWAI PENILAI C05
        </div>

        <p class="muted">
          Markah pelatih daripada peranti berbeza akan dipaparkan
          melalui Firebase Realtime Database.
        </p>

        <div class="field">
          <label>PIN Mod Pegawai Penilai</label>

          <input
            id="pin"
            type="password"
            inputmode="numeric"
            maxlength="8"
            placeholder="Masukkan PIN"
          >
        </div>

        <button
          class="btn primary wide"
          onclick="loginTeacher()"
        >
          MASUK
        </button>

        <p>
          <a
            href="index.html"
            style="color:#9bd2ff"
          >
            ← Kembali ke dashboard
          </a>
        </p>

      </div>
    </section>
  `;
}

function loginTeacher() {
  const pin = document
    .getElementById("pin")
    .value
    .trim();

  if (pin !== TEACHER_PIN) {
    alert("PIN tidak betul.");
    return;
  }

  sessionStorage.setItem(
    "c05TeacherAuth",
    "1"
  );

  renderTeacher();
  startFirebaseTeacherListener();
}

function logoutTeacher() {
  sessionStorage.removeItem(
    "c05TeacherAuth"
  );

  selectedId = "";
  stopFirebaseTeacherListener();
  renderLogin();
}

/* =========================================================
   STATISTIK
========================================================= */

function stats(data) {
  const students =
    Object.values(data.students || {});

  let practice = 0;
  let official = 0;
  let pending = 0;

  students.forEach((student) => {
    practice += Object.keys(
      student.practiceMarks || {}
    ).length;

    for (let number = 1; number <= 10; number += 1) {
      const practiceRecord =
        student.practiceMarks?.[keyOf(number)];

      const officialRecord =
        student.officialMarks?.[keyOf(number)];

      if (
        officialRecord?.locked &&
        officialRecord?.official
      ) {
        official += 1;
      } else if (practiceRecord) {
        pending += 1;
      }
    }
  });

  return {
    students: students.length,
    practice,
    official,
    pending
  };
}

/* =========================================================
   PAPARAN UTAMA
========================================================= */

function renderTeacher() {
  const data = SHStorage.loadTeacherData();

  const students =
    Object.values(data.students || {})
      .sort((first, second) =>
        (first.name || "").localeCompare(
          second.name || ""
        )
      );

  if (
    selectedId &&
    !data.students[selectedId]
  ) {
    selectedId = "";
  }

  if (
    !selectedId &&
    students[0]
  ) {
    selectedId = students[0].id;
  }

  const selected =
    selectedId
      ? data.students[selectedId]
      : null;

  const summary = stats(data);

  root.innerHTML = `
    <div class="shell">

      <header class="topbar">

        <div>
          <h1>
            👨‍🏫 MOD PEGAWAI PENILAI C05
          </h1>

          <div class="muted">
            Markah pelatih dan markah rasmi dipaparkan bersama.
          </div>
        </div>

        <div class="actions">

          <button
            class="btn secondary"
            onclick="SHStorage.exportCSV()"
          >
            📊 Export CSV
          </button>

          <a
            class="btn secondary"
            href="index.html"
            style="text-decoration:none"
          >
            🏠 Dashboard
          </a>

          <button
            class="btn danger"
            onclick="logoutTeacher()"
          >
            Keluar
          </button>

        </div>

      </header>

      <div class="device-note">
        ☁️ Firebase aktif: markah pelatih boleh diterima daripada
        telefon, tablet atau komputer yang berbeza. localStorage
        masih digunakan sebagai salinan sandaran pada peranti ini.
      </div>

      ${
        notice
          ? `
            <div class="notice ${notice.type}">
              ${esc(notice.message)}
            </div>
          `
          : ""
      }

      <section class="summary">

        <article>
          <span>Pelatih</span>
          <b>${summary.students}</b>
        </article>

        <article>
          <span>Rekod Latihan</span>
          <b>${summary.practice}</b>
        </article>

        <article>
          <span>Markah Rasmi</span>
          <b>${summary.official}</b>
        </article>

        <article>
          <span>Menunggu</span>
          <b>${summary.pending}</b>
        </article>

      </section>

      <div class="view-tabs">

        <button
          class="btn tab ${activeView === "batch" ? "active" : ""}"
          onclick="setView('batch')"
        >
          📋 Paparan Satu Kelas
        </button>

        <button
          class="btn tab ${activeView === "individual" ? "active" : ""}"
          onclick="setView('individual')"
        >
          👤 Seorang Pelatih
        </button>

      </div>

      <div class="grid">

        <aside class="panel">

          <h2>Senarai Pelatih</h2>

          <div class="student-list">
            ${
              students.length
                ? students
                    .map(studentItem)
                    .join("")
                : `
                  <div class="empty">
                    Belum ada markah daripada pelatih.
                  </div>
                `
            }
          </div>

        </aside>

        <section class="panel">
          ${
            activeView === "batch"
              ? renderBatch(students)
              : selected
                ? renderIndividual(selected)
                : `
                  <div class="empty">
                    Pilih pelatih.
                  </div>
                `
          }
        </section>

      </div>

    </div>
  `;

  notice = null;
}

function setView(view) {
  activeView = view;
  renderTeacher();
}

function selectStudent(id) {
  selectedId = id;
  activeView = "individual";
  renderTeacher();
}

function selectKT(number) {
  selectedKT = number;
  activeView = "batch";
  renderTeacher();
}

/* =========================================================
   SENARAI PELATIH
========================================================= */

function studentItem(student) {
  const practice = Object.keys(
    student.practiceMarks || {}
  ).length;

  const official = Object.values(
    student.officialMarks || {}
  ).filter(
    (record) =>
      record?.locked &&
      record?.official
  ).length;

  return `
    <div
      class="student-item ${selectedId === student.id ? "active" : ""}"
      onclick="selectStudent('${esc(student.id)}')"
    >

      <div>
        <b>
          ${esc(student.name || "Tanpa Nama")}
        </b>

        <small>
          ${esc(student.id)}
          ${
            student.className
              ? ` · ${esc(student.className)}`
              : ""
          }
        </small>
      </div>

      <span class="status-pill">
        L ${practice}/10 · R ${official}/10
      </span>

    </div>
  `;
}

/* =========================================================
   PAPARAN SATU KELAS
========================================================= */

function renderBatch(students) {
  const tabs = Array.from(
    { length: 10 },
    (_, index) => {
      const number = index + 1;

      return `
        <button
          class="btn tab ${selectedKT === number ? "active" : ""}"
          onclick="selectKT(${number})"
        >
          ${ktLabel(number)}
        </button>
      `;
    }
  ).join("");

  if (!students.length) {
    return `
      <h2>Markah Pelatih ↔ Pegawai</h2>

      <div class="tabs">
        ${tabs}
      </div>

      <div class="empty">
        Belum ada rekod pelatih.
      </div>
    `;
  }

  const key = keyOf(selectedKT);

  const rows = students
    .map((student, index) => {
      const practiceRecord =
        student.practiceMarks?.[key];

      const officialRecord =
        student.officialMarks?.[key];

      const official = Boolean(
        officialRecord?.official &&
        officialRecord?.locked
      );

      const practiceScore =
        practiceRecord
          ? Number(
              practiceRecord.bestScore ??
              practiceRecord.latestScore ??
              0
            )
          : null;

      const state = official
        ? "🔒 RASMI"
        : practiceRecord
          ? practiceScore >= 60
            ? "🟡 MENUNGGU / AUTO RASMI"
            : "🔴 BELUM TERAMPIL"
          : "BELUM DINILAI";

      const action = official
        ? `
          <button
            class="btn secondary mini"
            onclick="adminUnlockBatch('${esc(student.id)}')"
          >
            🛡️ Buka
          </button>
        `
        : practiceRecord && practiceScore >= 60
          ? `
            <button
              class="btn success mini"
              onclick="confirmPractice('${esc(student.id)}', ${selectedKT})"
            >
              ✓ Sahkan
            </button>
          `
          : `
            <span class="muted">—</span>
          `;

      return `
        <tr class="${official ? "row-locked" : ""}">

          <td>${index + 1}</td>

          <td class="name-cell">
            <b>${esc(student.name)}</b>
            <small>${esc(student.id)}</small>
          </td>

          <td>
            <b>
              ${
                practiceRecord
                  ? `${practiceScore}%`
                  : "—"
              }
            </b>

            <small>
              ${
                practiceRecord
                  ? `
                    Cubaan ${practiceRecord.attempts || 1}
                    <br>
                    ${fmt(practiceRecord.submittedAt)}
                  `
                  : ""
              }
            </small>
          </td>

          <td>
            <b>
              ${
                official
                  ? `${Number(officialRecord.score)}%`
                  : "—"
              }
            </b>

            <small>
              ${
                official
                  ? fmt(
                      officialRecord.lockedAt ||
                      officialRecord.updatedAt
                    )
                  : ""
              }
            </small>
          </td>

          <td>
            <span
              class="state-badge ${
                official
                  ? "official"
                  : practiceRecord
                    ? "pending"
                    : ""
              }"
            >
              ${state}
            </span>
          </td>

          <td>
            ${action}
          </td>

        </tr>
      `;
    })
    .join("");

  return `
    <h2>
      Markah ${ktLabel(selectedKT)}
    </h2>

    <p class="muted">
      Markah latihan dihantar daripada akaun pelatih.
      Markah 60% ke atas turut dikunci secara automatik
      sebagai markah rasmi.
    </p>

    <div class="tabs">
      ${tabs}
    </div>

    <div class="table-wrap">

      <table class="report-table batch-table">

        <thead>
          <tr>
            <th>Bil</th>
            <th>Pelatih</th>
            <th>Markah Pelatih</th>
            <th>Markah Rasmi</th>
            <th>Status</th>
            <th>Tindakan</th>
          </tr>
        </thead>

        <tbody>
          ${rows}
        </tbody>

      </table>

    </div>
  `;
}

/* =========================================================
   PAPARAN INDIVIDU
========================================================= */

function renderIndividual(student) {
  const cards = Array.from(
    { length: 10 },
    (_, index) => {
      const number = index + 1;
      const key = keyOf(number);

      const practiceRecord =
        student.practiceMarks?.[key];

      const officialRecord =
        student.officialMarks?.[key];

      const official = Boolean(
        officialRecord?.official &&
        officialRecord?.locked
      );

      const practiceScore =
        practiceRecord
          ? Number(
              practiceRecord.bestScore ??
              practiceRecord.latestScore ??
              0
            )
          : null;

      return `
        <article class="mark-card ${official ? "locked" : ""}">

          <h3>${ktLabel(number)}</h3>

          <div class="score-pair">

            <div>
              <small>Pelatih</small>

              <b>
                ${
                  practiceRecord
                    ? `${practiceScore}%`
                    : "—"
                }
              </b>
            </div>

            <div>
              <small>Rasmi</small>

              <b>
                ${
                  official
                    ? `${Number(officialRecord.score)}%`
                    : "—"
                }
              </b>
            </div>

          </div>

          <div class="state">

            ${
              practiceRecord
                ? `
                  Cubaan: ${practiceRecord.attempts || 1}
                  <br>
                  ${fmt(practiceRecord.submittedAt)}
                `
                : "Belum dijawab"
            }

            ${
              official
                ? `
                  <br>
                  🔒 ${officialRecord.status || "TERAMPIL"}
                  <br>
                  ${fmt(
                    officialRecord.lockedAt ||
                    officialRecord.updatedAt
                  )}
                `
                : ""
            }

          </div>

          ${
            !official &&
            practiceRecord &&
            practiceScore >= 60
              ? `
                <button
                  class="btn success wide"
                  onclick="confirmPractice('${esc(student.id)}', ${number})"
                >
                  ✓ SAHKAN MARKAH PELATIH
                </button>
              `
              : ""
          }

          ${
            official
              ? `
                <button
                  class="btn secondary wide"
                  onclick="adminUnlockIndividual('${esc(student.id)}', ${number})"
                >
                  🛡️ Buka Kunci
                </button>
              `
              : ""
          }

        </article>
      `;
    }
  ).join("");

  return `
    <h2>
      ${esc(student.name)} · ${esc(student.id)}
    </h2>

    <div class="mark-grid">
      ${cards}
    </div>
  `;
}

/* =========================================================
   TINDAKAN PEGAWAI PENILAI
========================================================= */

function confirmPractice(id, number) {
  const assessorName = prompt(
    "Nama Pegawai Penilai:",
    "Pegawai Penilai"
  );

  if (assessorName === null) return;

  const result =
    SHStorage.confirmPracticeMark(
      id,
      number,
      assessorName
    );

  setNotice(
    result.ok
      ? `${ktLabel(number)} disahkan sebagai markah rasmi.`
      : result.message,
    result.ok
      ? "ok"
      : "error"
  );

  renderTeacher();
}

function adminUnlockIndividual(id, number) {
  const pin = prompt("PIN Admin:");

  if (pin !== ADMIN_PIN) {
    alert("PIN Admin tidak betul.");
    return;
  }

  const result =
    SHStorage.emergencyUnlock(
      id,
      number
    );

  setNotice(
    result.ok
      ? "Markah dibuka semula."
      : result.message,
    result.ok
      ? "ok"
      : "error"
  );

  renderTeacher();
}

function adminUnlockBatch(id) {
  adminUnlockIndividual(
    id,
    selectedKT
  );
}

/* =========================================================
   PERMULAAN SISTEM
========================================================= */

window.addEventListener(
  "beforeunload",
  stopFirebaseTeacherListener
);

if (isAuthenticated()) {
  renderTeacher();
  startFirebaseTeacherListener();
} else {
  renderLogin();
}
