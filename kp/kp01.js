const kpApp = document.getElementById("kpApp");

if (!kpApp) {
  throw new Error("Elemen #kpApp tidak ditemui.");
}

if (!window.C05Storage) {
  throw new Error("C05Storage tidak ditemui. Semak fail ../storage.js.");
}

let state = window.C05Storage.load();
let currentSlide = 0;
let activityCompleted = false;

const exploredParts = new Set();
const lang = state.lang || "ms";

const text = {
  ms: {
    module: "KP01",
    title: "Pengenalan Kepada Analisis Maklumat Server",
    dashboard: "Dashboard",
    audio: "Audio",
    fullscreen: "Skrin Penuh",
    progress: "Kemajuan Pembelajaran",
    previous: "KEMBALI",
    next: "SETERUSNYA",
    finish: "SELESAI KP01",
    continueKT: "TERUSKAN KE KT01",

    correct:
      "Jawapan betul! Tindakan pertama ialah mengumpulkan dan menyemak maklumat server.",

    incorrect:
      "Belum tepat. Jawapan yang betul ialah B: Mengumpulkan dan menyemak maklumat server.",

    completeActivity:
      "Selesaikan aktiviti terlebih dahulu.",

    exploreAll:
      "Klik semua lima komponen terlebih dahulu.",

    helper:
      "Klik objek, baca penerangan ringkas dan selesaikan aktiviti sebelum meneruskan.",

    audioOn: "Audio diaktifkan.",
    audioOff: "Audio dimatikan."
  },

  en: {
    module: "KP01",
    title: "Introduction to Server Information Analysis",
    dashboard: "Dashboard",
    audio: "Audio",
    fullscreen: "Fullscreen",
    progress: "Learning Progress",
    previous: "BACK",
    next: "NEXT",
    finish: "COMPLETE KP01",
    continueKT: "CONTINUE TO KT01",

    correct:
      "Correct! The first action is to collect and verify the server information.",

    incorrect:
      "Not correct. The correct answer is B: Collect and verify the server information.",

    completeActivity:
      "Complete the activity first.",

    exploreAll:
      "Click all five components first.",

    helper:
      "Click the objects, read the short explanations and complete the activity before continuing.",

    audioOn: "Audio enabled.",
    audioOff: "Audio disabled."
  }
};

function t(key) {
  return text[lang]?.[key] || text.ms[key] || key;
}

const slides = [
  {
    type: "intro",

    content: {
      ms: {
        badge: "MISI PERTAMA",
        title: "Kenali Maklumat Server",

        lead:
          "Anda dilantik sebagai Juruteknik Pelatih. Tugas pertama anda ialah mengenal pasti maklumat penting sebelum kerja penyelenggaraan server dimulakan."
      },

      en: {
        badge: "FIRST MISSION",
        title: "Identify Server Information",

        lead:
          "You have been appointed as a Trainee Technician. Your first task is to identify important information before server maintenance begins."
      }
    }
  },

  {
    type: "story",

    content: {
      ms: {
        title: "Situasi Tugasan",

        body:
          "Sebuah server di bilik ICT mengalami masalah. Sebelum membuka casing atau menukar komponen, anda mesti mengumpulkan maklumat server terlebih dahulu."
      },

      en: {
        title: "Task Situation",

        body:
          "A server in the ICT room is experiencing a problem. Before opening the casing or replacing components, you must collect the server information first."
      }
    }
  },

  {
    type: "definition",

    content: {
      ms: {
        title: "Apa Itu Server?",

        lead:
          "Server ialah komputer yang menyediakan perkhidmatan, data atau sumber kepada komputer lain dalam rangkaian."
      },

      en: {
        title: "What Is a Server?",

        lead:
          "A server is a computer that provides services, data or resources to other computers on a network."
      }
    }
  },

  {
    type: "information",

    content: {
      ms: {
        title: "Maklumat Penting Server",

        lead:
          "Sebelum penyelenggaraan dilakukan, juruteknik perlu mengenal pasti beberapa maklumat asas."
      },

      en: {
        title: "Important Server Information",

        lead:
          "Before maintenance is performed, the technician must identify several basic details."
      }
    }
  },

  {
    type: "explore",

    content: {
      ms: {
        title: "Klik Komponen Server",

        lead:
          "Klik semua lima komponen untuk mengetahui fungsi ringkasnya."
      },

      en: {
        title: "Explore Server Components",

        lead:
          "Click all five components to learn their basic functions."
      }
    }
  },

  {
    type: "jobOrder",

    content: {
      ms: {
        title: "Maklumat Dalam Arahan Kerja",

        lead:
          "Arahan kerja membantu juruteknik memahami masalah, lokasi, model server dan tindakan yang perlu dilakukan."
      },

      en: {
        title: "Information in a Job Order",

        lead:
          "A job order helps the technician understand the problem, location, server model and required action."
      }
    }
  },

  {
    type: "activity",
    correct: 1,

    content: {
      ms: {
        title: "Mini Aktiviti",

        question:
          "Apakah tindakan pertama sebelum membuka casing server?",

        answers: [
          "Terus menukar komponen",
          "Mengumpulkan dan menyemak maklumat server",
          "Memadam semua data",
          "Menutup laporan penyelenggaraan"
        ]
      },

      en: {
        title: "Mini Activity",

        question:
          "What is the first action before opening the server casing?",

        answers: [
          "Replace components immediately",
          "Collect and verify the server information",
          "Delete all data",
          "Close the maintenance report"
        ]
      }
    }
  },

  {
    type: "summary",

    content: {
      ms: {
        title: "Ringkasan KP01",

        points: [
          "Server memberikan perkhidmatan kepada komputer lain.",
          "Maklumat server perlu disemak sebelum penyelenggaraan.",
          "Arahan kerja mengandungi maklumat masalah dan tindakan.",
          "Model, nombor siri, sistem operasi dan konfigurasi perlu direkodkan."
        ]
      },

      en: {
        title: "KP01 Summary",

        points: [
          "A server provides services to other computers.",
          "Server information must be checked before maintenance.",
          "A job order contains problem and action information.",
          "Model, serial number, operating system and configuration must be recorded."
        ]
      }
    }
  },

  {
    type: "complete",

    content: {
      ms: {
        title: "Misi KP01 Selesai",

        lead:
          "Anda telah mengenal pasti maklumat asas server. Seterusnya, jawab Kertas Tugasan KT01."
      },

      en: {
        title: "KP01 Mission Completed",

        lead:
          "You have identified the basic server information. Next, complete Task Paper KT01."
      }
    }
  }
];

function getContent(slide) {
  return slide.content?.[lang] || slide.content?.ms || {};
}

function render() {
  const slide = slides[currentSlide];

  const progress = Math.round(
    ((currentSlide + 1) / slides.length) * 100
  );

  kpApp.innerHTML = `
    <div class="kp-shell">

      <header class="kp-header">

        <div class="kp-brand">

          <div class="kp-brand-icon">
            <img
              src="../assets/logo-mentari.jpg"
              alt="Logo Kolej Kemahiran Mentari"
              class="college-logo"
              onerror="handleLogoError(this)"
            >
          </div>

          <div>
            <h1>
              ${t("module")} · ${t("title")}
            </h1>

            <small>
              C05 – SERVER MAINTENANCE
            </small>
          </div>

        </div>

        <div class="kp-header-tools">

          <button
            type="button"
            onclick="goDashboard()"
          >
            ← ${t("dashboard")}
          </button>

          <button
            type="button"
            onclick="toggleAudio()"
          >
            ${state.audio ? "🔊" : "🔇"}
            ${t("audio")}
          </button>

          <button
            type="button"
            onclick="toggleFullscreen()"
          >
            ⛶ ${t("fullscreen")}
          </button>

        </div>

      </header>

      <section class="kp-progress-wrap">

        <div class="kp-progress-info">
          <span>${t("progress")}</span>
          <strong>${progress}%</strong>
        </div>

        <div class="kp-progress">
          <i style="width:${progress}%"></i>
        </div>

      </section>

      <section class="kp-stage">
        ${renderSlide(slide)}
      </section>

      ${renderNavigation()}

    </div>

    <div class="byte-helper">

      <button
        type="button"
        onclick="toggleHelper()"
        aria-label="Byte AI Helper"
      >
        🤖
      </button>

      <div
        class="byte-tip"
        id="byteTip"
      >
        ${t("helper")}
      </div>

    </div>
  `;
}

function renderSlide(slide) {
  const c = getContent(slide);

  switch (slide.type) {
    case "intro":
      return `
        <article class="kp-slide kp-hero">

          <div class="kp-badge">
            ${c.badge}
          </div>

          <div class="big-icon">
            🖥️
          </div>

          <h2>
            ${c.title}
          </h2>

          <p>
            ${c.lead}
          </p>

        </article>
      `;

    case "story":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            📖 ${c.title}
          </h2>

          <div class="story-box">

            <strong>
              🚨 Mission Briefing
            </strong>

            <p>
              ${c.body}
            </p>

          </div>

          <div class="kp-card-grid">

            ${card(
              "🔍",
              lang === "ms"
                ? "Kenal Pasti"
                : "Identify",
              lang === "ms"
                ? "Semak maklumat sebelum menyentuh komponen."
                : "Check the information before touching components."
            )}

            ${card(
              "📝",
              lang === "ms"
                ? "Rekod"
                : "Record",
              lang === "ms"
                ? "Catat model, nombor siri dan masalah."
                : "Record the model, serial number and problem."
            )}

            ${card(
              "🛡️",
              lang === "ms"
                ? "Selamat"
                : "Safe",
              lang === "ms"
                ? "Elakkan tindakan tanpa maklumat lengkap."
                : "Avoid acting without complete information."
            )}

          </div>

        </article>
      `;

    case "definition":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            🖥️ ${c.title}
          </h2>

          <p class="kp-lead">
            ${c.lead}
          </p>

          <div class="kp-card-grid">

            ${card(
              "📁",
              lang === "ms"
                ? "Fail"
                : "Files",
              lang === "ms"
                ? "Menyimpan dan berkongsi data."
                : "Stores and shares data."
            )}

            ${card(
              "🌐",
              lang === "ms"
                ? "Rangkaian"
                : "Network",
              lang === "ms"
                ? "Memberi perkhidmatan kepada client."
                : "Provides services to clients."
            )}

            ${card(
              "🔐",
              lang === "ms"
                ? "Keselamatan"
                : "Security",
              lang === "ms"
                ? "Mengawal pengguna dan akses."
                : "Controls users and access."
            )}

          </div>

        </article>
      `;

    case "information":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            📋 ${c.title}
          </h2>

          <p class="kp-lead">
            ${c.lead}
          </p>

          <div class="kp-card-grid">

            ${card(
              "🏷️",
              lang === "ms"
                ? "Jenama dan Model"
                : "Brand and Model",
              lang === "ms"
                ? "Contoh: Dell PowerEdge atau HP ProLiant."
                : "Example: Dell PowerEdge or HP ProLiant."
            )}

            ${card(
              "🔢",
              lang === "ms"
                ? "Nombor Siri"
                : "Serial Number",
              lang === "ms"
                ? "Pengenalan unik bagi setiap server."
                : "A unique identifier for each server."
            )}

            ${card(
              "💿",
              lang === "ms"
                ? "Sistem Operasi"
                : "Operating System",
              lang === "ms"
                ? "Contoh: Windows Server 2019."
                : "Example: Windows Server 2019."
            )}

            ${card(
              "🧠",
              lang === "ms"
                ? "RAM dan CPU"
                : "RAM and CPU",
              lang === "ms"
                ? "Menentukan prestasi pemprosesan."
                : "Determine processing performance."
            )}

            ${card(
              "💽",
              lang === "ms"
                ? "Storan"
                : "Storage",
              lang === "ms"
                ? "Kapasiti dan status cakera."
                : "Disk capacity and condition."
            )}

            ${card(
              "🌐",
              lang === "ms"
                ? "Alamat IP"
                : "IP Address",
              lang === "ms"
                ? "Maklumat rangkaian server."
                : "Server network information."
            )}

          </div>

        </article>
      `;

    case "explore":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            🧩 ${c.title}
          </h2>

          <p class="kp-lead">
            ${c.lead}
          </p>

          <div class="server-diagram">

            ${serverPart(
              "cpu",
              "🧠",
              "CPU",
              lang === "ms"
                ? "Memproses arahan."
                : "Processes instructions."
            )}

            ${serverPart(
              "ram",
              "📏",
              "RAM",
              lang === "ms"
                ? "Menyimpan data sementara."
                : "Stores temporary data."
            )}

            ${serverPart(
              "storage",
              "💽",
              lang === "ms"
                ? "Storan"
                : "Storage",
              lang === "ms"
                ? "Menyimpan sistem dan fail."
                : "Stores the system and files."
            )}

            ${serverPart(
              "nic",
              "🌐",
              "NIC",
              lang === "ms"
                ? "Menyambungkan server ke rangkaian."
                : "Connects the server to the network."
            )}

            ${serverPart(
              "psu",
              "⚡",
              "PSU",
              lang === "ms"
                ? "Membekalkan kuasa."
                : "Supplies electrical power."
            )}

          </div>

          <div
            class="feedback ${
              exploredParts.size === 5
                ? "show good"
                : ""
            }"
          >
            ${
              lang === "ms"
                ? "Tahniah! Semua komponen telah diterokai."
                : "Well done! All components have been explored."
            }
          </div>

        </article>
      `;

    case "jobOrder":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            📝 ${c.title}
          </h2>

          <p class="kp-lead">
            ${c.lead}
          </p>

          <div class="kp-card-grid">

            ${card(
              "📅",
              lang === "ms"
                ? "Tarikh dan Masa"
                : "Date and Time",
              lang === "ms"
                ? "Bila masalah dilaporkan."
                : "When the problem was reported."
            )}

            ${card(
              "📍",
              lang === "ms"
                ? "Lokasi"
                : "Location",
              lang === "ms"
                ? "Tempat server dipasang."
                : "Where the server is installed."
            )}

            ${card(
              "⚠️",
              lang === "ms"
                ? "Aduan"
                : "Complaint",
              lang === "ms"
                ? "Masalah atau simptom yang berlaku."
                : "The reported problem or symptom."
            )}

            ${card(
              "👤",
              lang === "ms"
                ? "Pelapor"
                : "Reporter",
              lang === "ms"
                ? "Nama pengguna atau pegawai."
                : "Name of the user or officer."
            )}

            ${card(
              "🛠️",
              lang === "ms"
                ? "Tindakan"
                : "Action",
              lang === "ms"
                ? "Kerja yang perlu dilaksanakan."
                : "Work that must be performed."
            )}

            ${card(
              "✅",
              lang === "ms"
                ? "Pengesahan"
                : "Verification",
              lang === "ms"
                ? "Semakan selepas penyelenggaraan."
                : "Checking after maintenance."
            )}

          </div>

        </article>
      `;

    case "activity":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            🎮 ${c.title}
          </h2>

          <div class="activity-box">

            <div class="activity-question">
              ${c.question}
            </div>

            <div class="answer-grid">

              ${c.answers
                .map(
                  (answer, index) => `
                    <button
                      type="button"
                      onclick="checkAnswer(${index}, this)"
                    >
                      ${String.fromCharCode(65 + index)}.
                      ${answer}
                    </button>
                  `
                )
                .join("")}

            </div>

            <div
              class="feedback"
              id="activityFeedback"
            ></div>

          </div>

        </article>
      `;

    case "summary":
      return `
        <article class="kp-slide">

          <h2 class="kp-title">
            🧠 ${c.title}
          </h2>

          <div class="kp-card-grid">

            ${c.points
              .map(
                (point, index) =>
                  card(
                    ["🖥️", "🔍", "📝", "✅"][index],
                    `${index + 1}`,
                    point
                  )
              )
              .join("")}

          </div>

        </article>
      `;

    case "complete":
      return `
        <article class="kp-slide kp-summary">

          <div class="trophy">
            🏆
          </div>

          <h2>
            ${c.title}
          </h2>

          <p class="kp-lead">
            ${c.lead}
          </p>

          <div class="reward-box">

            <div>
              <span>XP</span>
              <b>+100</b>
            </div>

            <div>
              <span>
                ${
                  lang === "ms"
                    ? "Syiling"
                    : "Coins"
                }
              </span>

              <b>+50</b>
            </div>

            <div>
              <span>
                ${
                  lang === "ms"
                    ? "Lencana"
                    : "Badge"
                }
              </span>

              <b>🖥️</b>
            </div>

          </div>

        </article>
      `;

    default:
      return `
        <article class="kp-slide">
          <h2>Ralat kandungan KP01</h2>
        </article>
      `;
  }
}

function card(icon, title, body) {
  return `
    <article class="kp-card">

      <div class="icon">
        ${icon}
      </div>

      <h3>
        ${title}
      </h3>

      <p>
        ${body}
      </p>

    </article>
  `;
}

function serverPart(
  id,
  icon,
  title,
  description
) {
  const active = exploredParts.has(id);

  return `
    <article
      class="server-part ${
        active ? "active" : ""
      }"
    >

      <button
        type="button"
        onclick="explorePart('${id}')"
      >

        <span class="part-icon">
          ${icon}
        </span>

        <strong>
          ${title}
        </strong>

        <small>
          ${
            active
              ? description
              : lang === "ms"
                ? "Klik untuk lihat"
                : "Click to view"
          }
        </small>

      </button>

    </article>
  `;
}

function renderNavigation() {
  const isFirst =
    currentSlide === 0;

  const isLast =
    currentSlide === slides.length - 1;

  return `
    <nav class="kp-navigation">

      <button
        type="button"
        class="btn-back"
        onclick="previousSlide()"
        ${isFirst ? "disabled" : ""}
      >
        ← ${t("previous")}
      </button>

      ${
        isLast
          ? `
            <button
              type="button"
              class="btn-kt"
              onclick="continueToKT()"
            >
              ${t("continueKT")} →
            </button>
          `
          : `
            <button
              type="button"
              class="btn-next"
              onclick="nextSlide()"
            >
              ${
                currentSlide ===
                slides.length - 2
                  ? t("finish")
                  : t("next")
              }
              →
            </button>
          `
      }

    </nav>
  `;
}

function nextSlide() {
  const slide = slides[currentSlide];

  if (
    slide.type === "explore" &&
    exploredParts.size < 5
  ) {
    alert(t("exploreAll"));
    return;
  }

  if (
    slide.type === "activity" &&
    !activityCompleted
  ) {
    alert(t("completeActivity"));
    return;
  }

  if (
    currentSlide <
    slides.length - 1
  ) {
    currentSlide += 1;

    render();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function previousSlide() {
  if (currentSlide > 0) {
    currentSlide -= 1;

    render();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }
}

function explorePart(id) {
  exploredParts.add(id);

  if (state.audio) {
    playBeep(660);
  }

  render();
}

function checkAnswer(index, button) {
  const feedback =
    document.getElementById(
      "activityFeedback"
    );

  if (!feedback || !button) {
    return;
  }

  document
    .querySelectorAll(
      ".answer-grid button"
    )
    .forEach((item) => {
      item.classList.remove(
        "correct",
        "incorrect"
      );
    });

  const correctIndex = 1;

  if (Number(index) === correctIndex) {
    button.classList.add("correct");

    feedback.className =
      "feedback show good";

    feedback.textContent =
      t("correct");

    activityCompleted = true;

    if (state.audio) {
      playBeep(880);
    }
  } else {
    button.classList.add("incorrect");

    feedback.className =
      "feedback show bad";

    feedback.textContent =
      t("incorrect");

    activityCompleted = false;

    if (state.audio) {
      playBeep(220);
    }
  }
}

function completeKP01() {
  const completedKP =
    Array.isArray(state.completedKP)
      ? state.completedKP
      : [];

  const alreadyCompleted =
    completedKP.includes(1);

  window.C05Storage.completeKP(
    state,
    1
  );

  if (!alreadyCompleted) {
    state.xp =
      Number(state.xp || 0) + 100;

    state.coins =
      Number(state.coins || 0) + 50;

    if (!Array.isArray(state.badges)) {
      state.badges = [];
    }

    if (
      !state.badges.includes(
        "kp01-complete"
      )
    ) {
      state.badges.push(
        "kp01-complete"
      );
    }
  }

  window.C05Storage.save(state);
}

function continueToKT() {
  completeKP01();

  window.location.href =
    "../kt/kt01.html";
}

function goDashboard() {
  window.location.href =
    "../index.html";
}

function toggleAudio() {
  state.audio = !state.audio;

  window.C05Storage.save(state);

  alert(
    state.audio
      ? t("audioOn")
      : t("audioOff")
  );

  render();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

function toggleHelper() {
  document
    .getElementById("byteTip")
    ?.classList.toggle("show");
}

function handleLogoError(image) {
  image.style.display = "none";

  const parent =
    image.parentElement;

  if (parent) {
    parent.textContent = "🏫";
    parent.style.fontSize = "34px";
  }

  console.warn(
    "Logo tidak ditemui di ../assets/logo-mentari.jpg"
  );
}

function playBeep(frequency) {
  try {
    const AudioContextClass =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!AudioContextClass) {
      return;
    }

    const context =
      new AudioContextClass();

    const oscillator =
      context.createOscillator();

    const gain =
      context.createGain();

    oscillator.frequency.value =
      frequency;

    oscillator.type = "sine";

    gain.gain.setValueAtTime(
      0.08,
      context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      context.currentTime + 0.18
    );

    oscillator.connect(gain);

    gain.connect(
      context.destination
    );

    oscillator.start();

    oscillator.stop(
      context.currentTime + 0.18
    );
  } catch (error) {
    console.warn(
      "Audio tidak dapat dimainkan.",
      error
    );
  }
}

window.nextSlide =
  nextSlide;

window.previousSlide =
  previousSlide;

window.explorePart =
  explorePart;

window.checkAnswer =
  checkAnswer;

window.continueToKT =
  continueToKT;

window.goDashboard =
  goDashboard;

window.toggleAudio =
  toggleAudio;

window.toggleFullscreen =
  toggleFullscreen;

window.toggleHelper =
  toggleHelper;

window.handleLogoError =
  handleLogoError;

if (!state.student) {
  window.location.href =
    "../index.html";
} else {
  render();
}
