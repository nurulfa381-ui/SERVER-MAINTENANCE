const app = document.getElementById("app");

const TXT = window.C05_TEXT;
const MISSIONS = window.C05_MISSIONS;
const BADGES = window.C05_BADGES;

let state = window.C05Storage.load();

const t = (key) => {
  const lang = state.lang || "ms";
  return TXT[lang]?.[key] || key;
};

const save = () => {
  window.C05Storage.save(state);
};

const esc = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };

    return map[char];
  });

const getCompletedKTCount = () =>
  Array.isArray(state.completedKT)
    ? state.completedKT.length
    : 0;

const getAverage = () => {
  const values = Object.values(
    state.ktBestScores || {}
  ).map(Number);

  if (!values.length) {
    return 0;
  }

  const total = values.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(total / values.length);
};

const getLevel = () =>
  1 + Math.floor((state.xp || 0) / 500);

const getRank = () => {
  const level = getLevel();

  if (level >= 10) {
    return t("expert");
  }

  if (level >= 7) {
    return t("specialist");
  }

  if (level >= 4) {
    return t("technician");
  }

  return t("trainee");
};

const getProgress = () =>
  window.C05Storage.getProgress(state);

const getKTKey = (number) =>
  `kt${String(number).padStart(2, "0")}`;

const getKTScore = (number) =>
  Number(
    state.ktBestScores?.[getKTKey(number)] || 0
  );

const getKTStatus = (number) =>
  window.C05Storage.getKTStatus(
    state,
    number
  );

const isKPCompleted = (number) =>
  state.completedKP?.includes(number);

const isKTCompetent = (number) =>
  window.C05Storage.isKTCompetent(
    state,
    number
  );

const isKPOpen = (number) =>
  number <= (state.unlockedKP || 1);

function renderLanguage() {
  app.innerHTML = `
    <section class="center">
      <div class="card hero">
        <div class="logo">🖥️</div>

        <h1>C05 – SERVER MAINTENANCE</h1>

        <p>
          IT-020-3:2013 COMPUTER SYSTEM OPERATION
        </p>

        <h2>
          ${TXT.ms.choose}
          <br>
          <small>${TXT.en.choose}</small>
        </h2>

        <div class="lang-grid">
          <button onclick="chooseLanguage('ms')">
            🇲🇾
            <b>${TXT.ms.bm}</b>
          </button>

          <button onclick="chooseLanguage('en')">
            🇬🇧
            <b>${TXT.en.en}</b>
          </button>
        </div>
      </div>
    </section>
  `;
}

function chooseLanguage(language) {
  state.lang = language;
  save();

  if (state.student) {
    renderDashboard();
  } else {
    renderLogin();
  }
}

function renderLogin() {
  const avatars = [
    "👨‍💻",
    "👩‍💻",
    "🛡️",
    "⚙️",
    "🧠",
    "🚀"
  ];

  app.innerHTML = `
    <section class="center">
      <div class="card login">
        <h1>C05 – SERVER MAINTENANCE</h1>

        <h2>${t("login")}</h2>

        <label for="studentName">
          ${t("name")}
        </label>

        <input
          id="studentName"
          type="text"
          autocomplete="name"
          placeholder="${t("name")}"
        >

        <label for="studentId">
          ${t("id")}
        </label>

        <input
          id="studentId"
          type="text"
          autocomplete="off"
          placeholder="${t("id")}"
        >

        <h3>${t("avatar")}</h3>

        <div class="avatars">
          ${avatars
            .map(
              (avatar, index) => `
                <button
                  type="button"
                  class="${index === 0 ? "active" : ""}"
                  data-avatar="${avatar}"
                  onclick="pickAvatar(this)"
                >
                  ${avatar}
                </button>
              `
            )
            .join("")}
        </div>

        <button
          class="primary wide"
          onclick="saveLogin()"
        >
          ${t("enter")}
        </button>
      </div>
    </section>
  `;
}

function pickAvatar(button) {
  document
    .querySelectorAll(".avatars button")
    .forEach((item) =>
      item.classList.remove("active")
    );

  button.classList.add("active");
}

function saveLogin() {
  const name = document
    .getElementById("studentName")
    .value.trim();

  const id = document
    .getElementById("studentId")
    .value.trim();

  if (!name || !id) {
    alert(t("required"));
    return;
  }

  const selectedAvatar =
    document.querySelector(
      ".avatars .active"
    )?.dataset.avatar || "👨‍💻";

  state.student = {
    name,
    id,
    avatar: selectedAvatar
  };

  state.xp = Math.max(
    Number(state.xp || 0),
    50
  );

  if (!state.badges.includes("first-login")) {
    state.badges.push("first-login");
  }

  save();
  renderDashboard();
}

function renderDashboard() {
  const nextMission =
    MISSIONS.find(
      (mission) =>
        mission.id ===
        (state.unlockedKP || 1)
    ) || MISSIONS[MISSIONS.length - 1];

  app.innerHTML = `
    <div class="shell ${
      state.projector ? "projector" : ""
    }">

      <header>
        <div class="student">
          <span>
            ${state.student.avatar}
          </span>

          <div>
            <b>
              ${esc(state.student.name)}
            </b>

            <small>
              ${esc(state.student.id)}
            </small>
          </div>
        </div>

        <div class="tools">
          <button onclick="renderLanguage()">
            🌍 ${t("language")}
          </button>

          <button onclick="toggleProjector()">
            📽️ ${t("projector")}
          </button>

          <button onclick="toggleFullscreen()">
            ⛶ ${t("fullscreen")}
          </button>

          <button onclick="changeStudent()">
            👤 ${t("change")}
          </button>

          <button
            class="warn"
            onclick="resetProgress()"
          >
            ↻ ${t("reset")}
          </button>

          <button
            class="danger"
            onclick="logout()"
          >
            ⏻ ${t("logout")}
          </button>
        </div>
      </header>

      <section class="dash-grid">

        <article class="card profile">
          <div class="avatar">
            ${state.student.avatar}
          </div>

          <h2>
            ${esc(state.student.name)}
          </h2>

          <p>
            ${esc(state.student.id)}
          </p>

          <div class="rank">
            ⭐ ${getRank()}
          </div>

          <div class="bar">
            <i
              style="width:${getProgress()}%"
            ></i>
          </div>

          <strong>
            ${getProgress()}%
          </strong>
        </article>

        <article class="card overview">
          <h1>
            ${t("dashboard")}
          </h1>

          <p>
            ${t("welcome")}
          </p>

          <div class="stats">
            <article>
              <span>
                ${t("progress")}
              </span>

              <b>
                ${getProgress()}%
              </b>
            </article>

            <article>
              <span>
                ${t("average")}
              </span>

              <b>
                ${getAverage()}%
              </b>
            </article>

            <article>
              <span>
                ${t("level")}
              </span>

              <b>
                ${getLevel()}
              </b>
            </article>

            <article>
              <span>
                ${t("xp")}
              </span>

              <b>
                ${state.xp || 0}
              </b>
            </article>

            <article>
              <span>
                🪙 ${t("coins")}
              </span>

              <b>
                ${state.coins || 0}
              </b>
            </article>
          </div>

          <div class="next">
            <div>
              <small>
                ${t("next")}
              </small>

              <h3>
                KP${String(
                  nextMission.id
                ).padStart(2, "0")}
                ·
                ${
                  nextMission[
                    state.lang || "ms"
                  ]
                }
              </h3>
            </div>

            <button
              onclick="openKP(${nextMission.id})"
            >
              ${t("start")} →
            </button>
          </div>

          <div class="v5-actions">
            <button onclick="toggleAudio()">
              🔊 ${t("audio")}
            </button>

            <button onclick="showCertificate()">
              🎓 ${t("certificate")}
            </button>

            <button onclick="showTeacherMode()">
              👨‍🏫 ${t("teacherMode")}
            </button>

            <button
              onclick="C05Storage.exportCSV(state)"
            >
              📊 ${t("exportCSV")}
            </button>

            <button
              onclick="C05Storage.exportJSON(state)"
            >
              💾 ${t("backupJSON")}
            </button>
          </div>
        </article>
      </section>

      <section class="card missions">
        <h2>
          ${t("missionMap")}
        </h2>

        <div class="mission-list">
          ${MISSIONS.map(
            (mission, index) =>
              renderMissionCard(
                mission,
                index
              )
          ).join("")}
        </div>
      </section>

      <section class="bottom">
        <article class="card badges">
          <h2>
            ${t("badges")}
          </h2>

          <div class="badge-grid">
            ${BADGES.map(
              (badge) => `
                <article class="${
                  state.badges.includes(
                    badge.id
                  )
                    ? "earned"
                    : "locked"
                }">
                  <span>
                    ${badge.icon}
                  </span>

                  <small>
                    ${
                      badge[
                        state.lang || "ms"
                      ]
                    }
                  </small>
                </article>
              `
            ).join("")}
          </div>
        </article>

        <article class="card achievements">
          <h2>
            ${t("achievements")}
          </h2>

          <div>
            <span>📘</span>

            <b>
              ${
                state.completedKP?.length || 0
              }/10 KP
            </b>
          </div>

          <div>
            <span>✅</span>

            <b>
              ${getCompletedKTCount()}/10 KT
            </b>
          </div>

          <div>
            <span>🏆</span>

            <b>
              ${getRank()}
            </b>
          </div>
        </article>
      </section>
    </div>
  `;
}

function renderMissionCard(
  mission,
  index
) {
  const open = isKPOpen(mission.id);
  const kpDone = isKPCompleted(
    mission.id
  );

  const ktStatus = getKTStatus(
    mission.id
  );

  const score = getKTScore(
    mission.id
  );

  const statusClass =
    ktStatus === "TERAMPIL"
      ? "done"
      : open
        ? "open"
        : "locked";

  return `
    <article class="${statusClass}">
      <div class="num">
        ${
          ktStatus === "TERAMPIL"
            ? "✓"
            : String(
                mission.id
              ).padStart(2, "0")
        }
      </div>

      <div class="icon">
        ${mission.icon}
      </div>

      <div>
        <small>
          KP${String(
            mission.id
          ).padStart(2, "0")}
        </small>

        <h3>
          ${
            mission[
              state.lang || "ms"
            ]
          }
        </h3>

        <small>
          KP:
          ${
            kpDone
              ? t("completed")
              : open
                ? t("available")
                : t("locked")
          }
          ·
          KT:
          ${ktStatus}
          ${
            score > 0
              ? `(${score}%)`
              : ""
          }
        </small>
      </div>

      <span>
        ${
          ktStatus === "TERAMPIL"
            ? t("competent")
            : open
              ? t("available")
              : t("locked")
        }
      </span>

      <button
        ${open ? "" : "disabled"}
        onclick="openLearningPath(${mission.id})"
      >
        ${
          kpDone
            ? t("continue")
            : t("start")
        }
      </button>
    </article>

    ${
      index < MISSIONS.length - 1
        ? '<div class="line"></div>'
        : ""
    }
  `;
}

function openLearningPath(number) {
  if (!isKPOpen(number)) {
    return;
  }

  if (
    isKPCompleted(number) &&
    !isKTCompetent(number)
  ) {
    openKT(number);
    return;
  }

  openKP(number);
}

function openKP(number) {
  const mission = MISSIONS.find(
    (item) => item.id === number
  );

  if (!mission || !isKPOpen(number)) {
    return;
  }

  window.location.href =
    mission.kpFile;
}

function openKT(number) {
  const mission = MISSIONS.find(
    (item) => item.id === number
  );

  if (!mission) {
    return;
  }

  if (!isKPCompleted(number)) {
    alert(
      state.lang === "en"
        ? "Complete the KP first."
        : "Selesaikan KP terlebih dahulu."
    );

    return;
  }

  window.location.href =
    mission.ktFile;
}

function toggleProjector() {
  state.projector =
    !state.projector;

  save();
  renderDashboard();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function toggleAudio() {
  state.audio = !state.audio;
  save();

  alert(
    state.audio
      ? "Audio ON"
      : "Audio OFF"
  );
}

function changeStudent() {
  state.student = null;
  save();
  renderLogin();
}

function logout() {
  if (!confirm(t("confirmLogout"))) {
    return;
  }

  state.student = null;
  save();
  renderLanguage();
}

function resetProgress() {
  if (!confirm(t("confirmReset"))) {
    return;
  }

  const student = state.student;
  const language = state.lang;

  state = window.C05Storage.defaults();

  state.student = student;
  state.lang = language;
  state.xp = 50;
  state.badges = ["first-login"];

  save();
  renderDashboard();
}

function showTeacherMode() {
  alert(
    state.lang === "en"
      ? "Assessor Mode will be added in the next phase."
      : "Mod Pegawai Penilai akan dibina dalam fasa seterusnya."
  );
}

function showCertificate() {
  const complete =
    getCompletedKTCount() === 10;

  if (!complete) {
    alert(
      state.lang === "en"
        ? "Complete all 10 KT assessments first."
        : "Selesaikan semua 10 KT terlebih dahulu."
    );

    return;
  }

  alert(t("finalComplete"));
}

window.chooseLanguage =
  chooseLanguage;

window.pickAvatar =
  pickAvatar;

window.saveLogin =
  saveLogin;

window.renderLanguage =
  renderLanguage;

window.openLearningPath =
  openLearningPath;

window.openKP =
  openKP;

window.openKT =
  openKT;

window.toggleProjector =
  toggleProjector;

window.toggleFullscreen =
  toggleFullscreen;

window.toggleAudio =
  toggleAudio;

window.changeStudent =
  changeStudent;

window.logout =
  logout;

window.resetProgress =
  resetProgress;

window.showTeacherMode =
  showTeacherMode;

window.showCertificate =
  showCertificate;

if (state.lang) {
  if (state.student) {
    renderDashboard();
  } else {
    renderLogin();
  }
} else {
  renderLanguage();
}
