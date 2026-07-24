const ktApp = document.getElementById("ktApp");

let state = window.C05Storage.load();

const ktNumber = Number(
  window.C05CurrentKT || 1
);

const data =
  window.C05_KT_DATA?.[ktNumber];

if (!data) {
  throw new Error(
    `Data KT${ktNumber} tidak ditemui.`
  );
}

const pad = (number) =>
  String(number).padStart(2, "0");

const escapeHTML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
      };

      return map[character];
    }
  );

const studentName =
  state.student?.name || "";

const studentId =
  state.student?.id || "";

let resultGenerated = false;
let lastResult = null;

function renderKT() {
  if (!state.student) {
    window.location.href =
      "../index.html";
    return;
  }

  ktApp.innerHTML = `
    <div class="kt-shell">

      ${renderToolbar()}

      <article class="kt-paper">

        <section class="kt-page">
          ${renderOfficialHeader()}
          ${renderCandidateInformation()}
          ${renderCandidateInstructions()}
        </section>

        <section class="kt-page">
          ${renderAssessmentHeader()}
          ${renderObjectiveSection()}
          ${renderMatchingSection()}
        </section>

        <section class="kt-page">
          ${renderShortAnswerSection()}

          <div class="kt-submit-area no-print">
            <button
              class="kt-primary-button"
              onclick="submitKT()"
            >
              HANTAR DAN KIRA MARKAH
            </button>
          </div>
        </section>

        <section
          class="kt-page hidden"
          id="resultPage"
        >
        </section>

      </article>
    </div>
  `;
}

function renderToolbar() {
  return `
    <header class="kt-toolbar no-print">

      <div class="kt-toolbar-title">
        <span>📝</span>

        <div>
          <h1>
            KERTAS TUGASAN
            KT${pad(ktNumber)}
          </h1>

          <small>
            C05 – SERVER MAINTENANCE
          </small>
        </div>
      </div>

      <div class="kt-toolbar-actions">
        <button onclick="goDashboard()">
          ← Dashboard
        </button>

        <button onclick="toggleFullscreen()">
          ⛶ Skrin Penuh
        </button>
      </div>

    </header>
  `;
}

function renderOfficialHeader() {
  return `
    <section class="kt-official-header">

      <div class="kt-college-row">

        <div class="kt-logo-box">
          <img
            src="../assets/logo-mentari.png"
            alt="Logo Kolej Kemahiran Mentari"
            onerror="showLogoFallback(this)"
          >

          <div
            class="kt-logo-placeholder hidden"
          >
            LOGO<br>
            KOLEJ KEMAHIRAN<br>
            MENTARI
          </div>
        </div>

        <div class="kt-college-info">
          <h2>
            KOLEJ KEMAHIRAN MENTARI
            (L02432)
          </h2>

          <p>
            NO.22 & 24, GROUND FLOOR,
            1ST, 2ND & 3RD FLOOR
            <br>
            JALAN MERSING
            <br>
            86000 KLUANG
            <br>
            JOHOR DARUL TAKZIM
          </p>
        </div>

      </div>

      <div class="kt-document-title">
        KERTAS TUGASAN
        (KT${pad(ktNumber)})
      </div>

    </section>

    <table class="kt-info-table">
      <tr>
        <th>
          KOD DAN NAMA PROGRAM
        </th>

        <td>
          ${escapeHTML(data.program)}
        </td>
      </tr>

      <tr>
        <th>TAHAP</th>

        <td>
          ${escapeHTML(data.level)}
        </td>
      </tr>

      <tr>
        <th>
          KOD DAN TAJUK UNIT
          KOMPETENSI
        </th>

        <td>
          ${escapeHTML(
            data.competency
          )}
        </td>
      </tr>

      <tr>
        <th>
          NO. DAN PENYATAAN
          AKTIVITI KERJA
        </th>

        <td>
          <ol class="kt-work-list">
            ${data.workActivities
              .map(
                (activity) => `
                  <li>
                    ${escapeHTML(activity)}
                  </li>
                `
              )
              .join("")}
          </ol>
        </td>
      </tr>

      <tr>
        <th>TAJUK</th>

        <td>
          ${escapeHTML(data.title)}
        </td>
      </tr>
    </table>

    <div class="kt-code-row">

      <div>
        <span class="kt-code-label">
          NO. KOD
        </span>
      </div>

      <div>
        ${escapeHTML(data.code)}
      </div>

      <div class="kt-page-count">
        MUKA SURAT: 1
        <br>
        DRPD: 4
      </div>

    </div>
  `;
}

function renderCandidateInformation() {
  return `
    <section class="kt-section">

      <h2>MAKLUMAT PELATIH</h2>

      <table class="kt-student-table">
        <tr>
          <th>NAMA PELATIH</th>

          <td>
            ${escapeHTML(studentName)}
          </td>
        </tr>

        <tr>
          <th>
            NO. KAD PENGENALAN
          </th>

          <td>
            ${escapeHTML(studentId)}
          </td>
        </tr>

        <tr>
          <th>TARIKH</th>

          <td>
            __________________________
          </td>
        </tr>

        <tr>
          <th>MARKAH</th>

          <td>
            __________________________
          </td>
        </tr>
      </table>

    </section>
  `;
}

function renderCandidateInstructions() {
  return `
    <section class="kt-section">

      <h2>ARAHAN KEPADA CALON</h2>

      <div class="kt-instruction-box">
        <ol>
          ${data.candidateInstructions
            .map(
              (instruction) => `
                <li>
                  ${escapeHTML(
                    instruction
                  )}
                </li>
              `
            )
            .join("")}
        </ol>
      </div>

    </section>

    <section class="kt-section">
      <div class="kt-alert warning">
        Kertas Tugasan ini
        mengandungi tiga bahagian,
        iaitu Bahagian A, Bahagian B
        dan Bahagian C.
        Jawab semua soalan.
      </div>
    </section>
  `;
}

function renderAssessmentHeader() {
  return `
    <div class="kt-progress-panel no-print">
      <div>
        <strong>
          Kemajuan Jawapan
        </strong>

        <div class="kt-progress-bar">
          <i id="answerProgressBar"></i>
        </div>
      </div>

      <strong id="answerProgressText">
        0%
      </strong>
    </div>
  `;
}

function renderObjectiveSection() {
  const section =
    data.sections.objective;

  return `
    <section class="kt-section">

      <h2>
        ${escapeHTML(section.title)}
        (${section.totalMarks} MARKAH)
      </h2>

      <div class="kt-instruction-box">
        ${escapeHTML(
          section.instruction
        )}
      </div>

      <div>
        ${section.questions
          .map(
            (question, index) =>
              renderObjectiveQuestion(
                question,
                index
              )
          )
          .join("")}
      </div>

    </section>
  `;
}

function renderObjectiveQuestion(
  question,
  index
) {
  return `
    <article class="kt-question-card">

      <div class="kt-question-number">
        ${index + 1}.
        (${question.marks} Markah)
      </div>

      ${
        question.imageText
          ? `
            <div class="kt-alert warning">
              Rajah/Label:
              <strong>
                ${escapeHTML(
                  question.imageText
                )}
              </strong>
            </div>
          `
          : ""
      }

      <p class="kt-question-text">
        ${escapeHTML(
          question.question
        )}
      </p>

      <div class="kt-options">
        ${question.options
          .map(
            (option, optionIndex) => `
              <div class="kt-option">
                <input
                  type="radio"
                  id="${question.id}_${optionIndex}"
                  name="${question.id}"
                  value="${optionIndex}"
                  onchange="updateAnswerProgress()"
                >

                <label
                  for="${question.id}_${optionIndex}"
                >
                  ${String.fromCharCode(
                    65 + optionIndex
                  )}.
                  ${escapeHTML(option)}
                </label>
              </div>
            `
          )
          .join("")}
      </div>

    </article>
  `;
}

function renderMatchingSection() {
  const section =
    data.sections.matching;

  return `
    <section class="kt-section">

      <h2>
        ${escapeHTML(section.title)}
        (${section.totalMarks} MARKAH)
      </h2>

      <div class="kt-instruction-box">
        ${escapeHTML(
          section.instruction
        )}
      </div>

      ${section.items
        .map(
          (item, index) => `
            <article class="kt-question-card">

              <div class="kt-question-number">
                ${index + 1}.
                ${escapeHTML(item.label)}
              </div>

              <select
                id="${item.id}"
                class="kt-matching-select"
                onchange="updateAnswerProgress()"
                style="
                  width:100%;
                  padding:12px;
                  border:1.5px solid #cbd5e1;
                  border-radius:9px;
                "
              >
                <option value="">
                  -- Pilih jawapan --
                </option>

                ${section.choices
                  .map(
                    (choice) => `
                      <option
                        value="${choice.id}"
                      >
                        ${escapeHTML(
                          choice.text
                        )}
                      </option>
                    `
                  )
                  .join("")}
              </select>

            </article>
          `
        )
        .join("")}

    </section>
  `;
}

function renderShortAnswerSection() {
  const section =
    data.sections.shortAnswer;

  return `
    <section class="kt-section">

      <h2>
        ${escapeHTML(section.title)}
        (${section.totalMarks} MARKAH)
      </h2>

      <div class="kt-instruction-box">
        ${escapeHTML(
          section.instruction
        )}
      </div>

      ${section.questions
        .map(
          (question, index) => `
            <article class="kt-question-card">

              <div class="kt-question-number">
                ${index + 1}.
                (${question.marks} Markah)
              </div>

              <p class="kt-question-text">
                ${escapeHTML(
                  question.question
                )}
              </p>

              <textarea
                id="${question.id}_answer"
                rows="${question.rows || 3}"
                oninput="updateAnswerProgress()"
                style="
                  width:100%;
                  padding:12px;
                  border:1.5px solid #cbd5e1;
                  border-radius:9px;
                  resize:vertical;
                  line-height:1.6;
                "
                placeholder="Taip jawapan di sini..."
              ></textarea>

              <div
                style="
                  margin-top:16px;
                  padding:14px;
                  background:#f8fafc;
                  border:1px solid #cbd5e1;
                  border-radius:9px;
                "
              >
                <label
                  for="${question.id}_mark"
                  style="
                    display:block;
                    margin-bottom:8px;
                    font-weight:700;
                  "
                >
                  Markah Pegawai Penilai
                  (0–${question.marks})
                </label>

                <input
                  id="${question.id}_mark"
                  type="number"
                  min="0"
                  max="${question.marks}"
                  step="1"
                  value="0"
                  oninput="validateAssessorMark(
                    this,
                    ${question.marks}
                  )"
                  style="
                    width:120px;
                    padding:10px;
                    border:1.5px solid #94a3b8;
                    border-radius:8px;
                  "
                >
              </div>

            </article>
          `
        )
        .join("")}

    </section>
  `;
}

function updateAnswerProgress() {
  const objectiveQuestions =
    data.sections.objective.questions;

  const matchingItems =
    data.sections.matching.items;

  const shortQuestions =
    data.sections.shortAnswer.questions;

  let answered = 0;

  objectiveQuestions.forEach(
    (question) => {
      if (
        document.querySelector(
          `input[name="${question.id}"]:checked`
        )
      ) {
        answered++;
      }
    }
  );

  matchingItems.forEach((item) => {
    if (
      document.getElementById(item.id)
        ?.value
    ) {
      answered++;
    }
  });

  shortQuestions.forEach(
    (question) => {
      if (
        document
          .getElementById(
            `${question.id}_answer`
          )
          ?.value.trim()
      ) {
        answered++;
      }
    }
  );

  const total =
    objectiveQuestions.length +
    matchingItems.length +
    shortQuestions.length;

  const progress = Math.round(
    (answered / total) * 100
  );

  const bar =
    document.getElementById(
      "answerProgressBar"
    );

  const text =
    document.getElementById(
      "answerProgressText"
    );

  if (bar) {
    bar.style.width = `${progress}%`;
  }

  if (text) {
    text.textContent = `${progress}%`;
  }
}

function validateAssessorMark(
  input,
  maximum
) {
  let value = Number(input.value);

  if (!Number.isFinite(value)) {
    value = 0;
  }

  value = Math.max(
    0,
    Math.min(maximum, value)
  );

  input.value = value;
}

function calculateObjectiveMarks() {
  let marks = 0;
  let correct = 0;

  data.sections.objective.questions
    .forEach((question) => {
      const selected =
        document.querySelector(
          `input[name="${question.id}"]:checked`
        );

      if (
        selected &&
        Number(selected.value) ===
          question.answer
      ) {
        marks += Number(
          question.marks || 0
        );

        correct++;
      }
    });

  return {
    marks,
    correct,
    total:
      data.sections.objective.questions
        .length
  };
}

function calculateMatchingMarks() {
  let marks = 0;
  let correct = 0;

  data.sections.matching.items
    .forEach((item) => {
      const value =
        document.getElementById(
          item.id
        )?.value;

      if (value === item.answer) {
        marks++;
        correct++;
      }
    });

  return {
    marks,
    correct,
    total:
      data.sections.matching.items
        .length
  };
}

function calculateSubjectiveMarks() {
  let marks = 0;

  data.sections.shortAnswer.questions
    .forEach((question) => {
      const input =
        document.getElementById(
          `${question.id}_mark`
        );

      const value = Math.max(
        0,
        Math.min(
          question.marks,
          Number(input?.value || 0)
        )
      );

      marks += value;
    });

  return marks;
}

function allRequiredAnswered() {
  const missingObjective =
    data.sections.objective.questions
      .some(
        (question) =>
          !document.querySelector(
            `input[name="${question.id}"]:checked`
          )
      );

  const missingMatching =
    data.sections.matching.items
      .some(
        (item) =>
          !document.getElementById(
            item.id
          )?.value
      );

  const missingShort =
    data.sections.shortAnswer.questions
      .some(
        (question) =>
          !document
            .getElementById(
              `${question.id}_answer`
            )
            ?.value.trim()
      );

  return !(
    missingObjective ||
    missingMatching ||
    missingShort
  );
}

function submitKT() {
  if (!allRequiredAnswered()) {
    alert(
      "Sila jawab semua soalan sebelum menghantar Kertas Tugasan."
    );

    return;
  }

  const confirmed = confirm(
    "Pastikan markah Bahagian C telah dimasukkan oleh Pegawai Penilai. Teruskan pengiraan?"
  );

  if (!confirmed) {
    return;
  }

  const objective =
    calculateObjectiveMarks();

  const matching =
    calculateMatchingMarks();

  const subjective =
    calculateSubjectiveMarks();

  const totalMarks =
    objective.marks +
    matching.marks +
    subjective;

  const percentage = Math.round(
    (totalMarks / data.totalMarks) *
      100
  );

  const competent =
    percentage >= data.passMark;

  window.C05Storage.saveKTResult(
    state,
    ktNumber,
    percentage
  );

  if (
    competent &&
    !state.badges.includes(
      "kt01-competent"
    )
  ) {
    state.badges.push(
      "kt01-competent"
    );

    state.xp =
      Number(state.xp || 0) + 150;

    state.coins =
      Number(state.coins || 0) + 75;

    window.C05Storage.save(state);
  }

  lastResult = {
    objective,
    matching,
    subjective,
    totalMarks,
    percentage,
    competent
  };

  resultGenerated = true;

  renderResult(lastResult);
}

function renderResult(result) {
  const resultPage =
    document.getElementById(
      "resultPage"
    );

  resultPage.classList.remove(
    "hidden"
  );

  resultPage.innerHTML = `
    ${renderOfficialHeader()}

    <section class="kt-result">

      <div class="kt-result-header">
        <h2>
          KEPUTUSAN KERTAS TUGASAN
          KT${pad(ktNumber)}
        </h2>

        <p>
          ${escapeHTML(data.title)}
        </p>
      </div>

      <div
        class="kt-score-circle ${
          result.competent
            ? "competent"
            : "not-competent"
        }"
      >
        ${result.percentage}%
      </div>

      <div
        class="kt-status ${
          result.competent
            ? "competent"
            : "not-competent"
        }"
      >
        ${
          result.competent
            ? "TERAMPIL"
            : "BELUM TERAMPIL"
        }
      </div>

      <table class="kt-result-table">
        <tr>
          <th>NAMA PELATIH</th>
          <td>
            ${escapeHTML(studentName)}
          </td>
        </tr>

        <tr>
          <th>
            NO. KAD PENGENALAN
          </th>

          <td>
            ${escapeHTML(studentId)}
          </td>
        </tr>

        <tr>
          <th>NO. KOD</th>
          <td>
            ${escapeHTML(data.code)}
          </td>
        </tr>

        <tr>
          <th>TAJUK</th>
          <td>
            ${escapeHTML(data.title)}
          </td>
        </tr>

        <tr>
          <th>
            BAHAGIAN A
          </th>

          <td>
            ${result.objective.marks}
            /
            ${data.sections.objective.totalMarks}
          </td>
        </tr>

        <tr>
          <th>
            BAHAGIAN B
          </th>

          <td>
            ${result.matching.marks}
            /
            ${data.sections.matching.totalMarks}
          </td>
        </tr>

        <tr>
          <th>
            BAHAGIAN C
          </th>

          <td>
            ${result.subjective}
            /
            ${data.sections.shortAnswer.totalMarks}
          </td>
        </tr>

        <tr>
          <th>
            JUMLAH MARKAH
          </th>

          <td>
            ${result.totalMarks}
            /
            ${data.totalMarks}
          </td>
        </tr>

        <tr>
          <th>
            MARKAH KESELURUHAN
          </th>

          <td>
            <strong>
              ${result.percentage}%
            </strong>
          </td>
        </tr>

        <tr>
          <th>KEPUTUSAN</th>

          <td>
            <strong>
              ${
                result.competent
                  ? "TERAMPIL"
                  : "BELUM TERAMPIL"
              }
            </strong>
          </td>
        </tr>

        <tr>
          <th>TARIKH</th>

          <td>
            __________________________
          </td>
        </tr>
      </table>

      <div class="kt-date-signature">

        <div class="kt-date-box">
          <strong>
            NAMA PEGAWAI PENILAI
          </strong>

          <div class="kt-signature-line">
            Nama Pegawai Penilai
          </div>
        </div>

        <div class="kt-signature-box">
          <strong>PENGESAHAN</strong>

          <div class="kt-signature-line">
            Tandatangan Pegawai Penilai
          </div>
        </div>

      </div>

      <section class="kt-section">
        <strong>
          ULASAN (JIKA ADA)
        </strong>

        <div
          style="
            min-height:90px;
            margin-top:10px;
            border:1.5px solid #111827;
          "
        ></div>
      </section>

      <div class="kt-footer">
        Rekod rasmi Kertas Tugasan
        C05 – Server Maintenance
      </div>

    </section>

    <div class="kt-action-row no-print">

      <button
        class="kt-print-button"
        onclick="printResult()"
      >
        🖨️ CETAK / SIMPAN PDF
      </button>

      ${
        result.competent
          ? `
            <button
              class="kt-primary-button"
              onclick="continueAfterKT()"
            >
              KEMBALI KE DASHBOARD
            </button>
          `
          : `
            <button
              class="kt-danger-button"
              onclick="repeatKT()"
            >
              ULANG KT${pad(ktNumber)}
            </button>
          `
      }

    </div>
  `;

  resultPage.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function showLogoFallback(image) {
  image.classList.add("hidden");

  image.nextElementSibling
    ?.classList.remove("hidden");
}

function printResult() {
  if (!resultGenerated) {
    alert(
      "Keputusan belum dijana."
    );

    return;
  }

  window.print();
}

function repeatKT() {
  window.location.reload();
}

function continueAfterKT() {
  window.location.href =
    "../index.html";
}

function goDashboard() {
  const confirmExit = confirm(
    "Kembali ke Dashboard? Jawapan yang belum dihantar tidak akan disimpan."
  );

  if (confirmExit) {
    window.location.href =
      "../index.html";
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement
      .requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
}

window.updateAnswerProgress =
  updateAnswerProgress;

window.validateAssessorMark =
  validateAssessorMark;

window.submitKT =
  submitKT;

window.showLogoFallback =
  showLogoFallback;

window.printResult =
  printResult;

window.repeatKT =
  repeatKT;

window.continueAfterKT =
  continueAfterKT;

window.goDashboard =
  goDashboard;

window.toggleFullscreen =
  toggleFullscreen;

renderKT();
