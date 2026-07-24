:root {
  --bg-dark: #020817;
  --bg-blue: #061a30;
  --panel: rgba(10, 31, 55, 0.9);
  --panel-soft: rgba(255, 255, 255, 0.07);
  --line: rgba(148, 163, 184, 0.22);

  --text: #f8fafc;
  --muted: #cbd5e1;

  --blue: #2563eb;
  --blue-light: #60a5fa;
  --purple: #7c3aed;
  --orange: #f59e0b;
  --green: #16a34a;
  --red: #dc2626;

  --radius: 22px;
  --shadow: 0 22px 65px rgba(0, 0, 0, 0.38);
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  min-height: 100vh;
  margin: 0;
  overflow-x: hidden;
  font-family: "Poppins", sans-serif;
  color: var(--text);

  background:
    radial-gradient(
      circle at 10% 10%,
      rgba(37, 99, 235, 0.28),
      transparent 30%
    ),
    radial-gradient(
      circle at 90% 85%,
      rgba(124, 58, 237, 0.22),
      transparent 30%
    ),
    linear-gradient(
      135deg,
      var(--bg-dark),
      var(--bg-blue)
    );
}

body::before {
  content: "";
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;

  background-image:
    linear-gradient(
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px
    ),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.025) 1px,
      transparent 1px
    );

  background-size: 48px 48px;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

#kpApp {
  min-height: 100vh;
}

/* LAYOUT */

.kp-shell {
  width: min(1500px, calc(100% - 28px));
  margin: auto;
  padding: 16px 0 50px;
}

/* HEADER */

.kp-header {
  position: sticky;
  top: 10px;
  z-index: 30;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;

  padding: 14px 18px;
  border: 1px solid var(--line);
  border-radius: 20px;

  background: rgba(2, 12, 25, 0.92);
  box-shadow: var(--shadow);
  backdrop-filter: blur(22px);
}

.kp-brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.kp-brand-icon {
  position: relative;

  display: flex;
  align-items: center;
  justify-content: center;

  width: 66px;
  height: 66px;
  flex: 0 0 66px;

  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.32);
  border-radius: 18px;

  background: #ffffff;

  box-shadow:
    0 12px 28px rgba(37, 99, 235, 0.38);
}

.kp-brand-icon::after {
  content: "";
  position: absolute;
  inset: -6px;
  z-index: -1;

  border: 1px solid rgba(96, 165, 250, 0.5);
  border-radius: 23px;

  animation: pulseRing 2s infinite;
}

.college-logo {
  width: 60px;
  height: 60px;
  display: block;
  object-fit: contain;
  border-radius: 13px;
}

@keyframes pulseRing {
  0% {
    opacity: 0.7;
    transform: scale(0.95);
  }

  70% {
    opacity: 0;
    transform: scale(1.22);
  }

  100% {
    opacity: 0;
  }
}

.kp-brand h1 {
  margin: 0;
  font-family: "Montserrat", sans-serif;
  font-size: clamp(18px, 2vw, 29px);
  line-height: 1.2;
}

.kp-brand small {
  display: block;
  margin-top: 4px;
  color: var(--blue-light);
  font-weight: 700;
  letter-spacing: 0.04em;
}

.kp-header-tools {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
}

.kp-header-tools button {
  padding: 10px 14px;

  border: 1px solid var(--line);
  border-radius: 12px;

  background: rgba(255, 255, 255, 0.07);
  color: var(--text);

  font-weight: 800;
  transition: 0.2s ease;
}

.kp-header-tools button:hover {
  transform: translateY(-2px);
  border-color: var(--blue-light);
  background: rgba(37, 99, 235, 0.18);
}

/* PROGRESS */

.kp-progress-wrap {
  margin: 18px 0;
  padding: 14px 18px;

  border: 1px solid var(--line);
  border-radius: 18px;

  background: var(--panel);
  backdrop-filter: blur(18px);
}

.kp-progress-info {
  display: flex;
  justify-content: space-between;
  gap: 12px;

  margin-bottom: 9px;
  color: var(--muted);
  font-weight: 800;
}

.kp-progress-info strong {
  color: #fde68a;
}

.kp-progress {
  height: 15px;
  overflow: hidden;

  border-radius: 999px;
  background: #020b16;
}

.kp-progress i {
  position: relative;
  display: block;
  height: 100%;

  border-radius: inherit;

  background:
    linear-gradient(
      90deg,
      var(--orange),
      #facc15,
      var(--green)
    );

  transition: width 0.45s ease;
}

.kp-progress i::after {
  content: "";
  position: absolute;
  inset: 0;

  background:
    linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.65),
      transparent
    );

  transform: translateX(-100%);
  animation: progressShine 2.2s infinite;
}

@keyframes progressShine {
  to {
    transform: translateX(100%);
  }
}

/* STAGE */

.kp-stage {
  position: relative;

  min-height: 670px;
  display: grid;
  place-items: center;

  padding: clamp(20px, 4vw, 42px);

  border: 1px solid var(--line);
  border-radius: 28px;

  background:
    linear-gradient(
      145deg,
      rgba(12, 37, 65, 0.94),
      rgba(4, 18, 34, 0.94)
    );

  box-shadow: var(--shadow);
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.kp-stage::before,
.kp-stage::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  filter: blur(10px);
  pointer-events: none;
}

.kp-stage::before {
  width: 250px;
  height: 250px;
  top: -100px;
  right: -60px;
  background: rgba(37, 99, 235, 0.18);
}

.kp-stage::after {
  width: 220px;
  height: 220px;
  bottom: -110px;
  left: -70px;
  background: rgba(124, 58, 237, 0.16);
}

.kp-slide {
  position: relative;
  z-index: 2;

  width: min(1080px, 100%);
  animation: slideEnter 0.45s ease;
}

@keyframes slideEnter {
  from {
    opacity: 0;
    transform: translateY(24px) scale(0.985);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* INTRO */

.kp-hero {
  text-align: center;
}

.kp-badge {
  display: inline-block;
  margin-bottom: 18px;
  padding: 9px 16px;

  border: 1px solid rgba(245, 158, 11, 0.45);
  border-radius: 999px;

  background: rgba(245, 158, 11, 0.15);
  color: #fde68a;

  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.08em;

  animation: badgeFloat 2.2s ease-in-out infinite;
}

@keyframes badgeFloat {
  50% {
    transform: translateY(-5px);
  }
}

.kp-hero .big-icon {
  margin-bottom: 18px;
  font-size: clamp(95px, 13vw, 165px);

  filter:
    drop-shadow(
      0 20px 35px rgba(37, 99, 235, 0.5)
    );

  animation: serverFloat 3s ease-in-out infinite;
}

@keyframes serverFloat {
  50% {
    transform: translateY(-12px);
  }
}

.kp-hero h2 {
  margin: 0 0 16px;

  font-family: "Montserrat", sans-serif;
  font-size: clamp(36px, 5.7vw, 72px);
  line-height: 1.05;

  background:
    linear-gradient(
      90deg,
      #ffffff,
      #93c5fd,
      #fde68a
    );

  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.kp-hero p {
  max-width: 800px;
  margin: auto;

  color: var(--muted);
  font-size: clamp(18px, 2vw, 25px);
  line-height: 1.75;
}

/* TITLE */

.kp-title {
  margin: 0 0 14px;

  font-family: "Montserrat", sans-serif;
  font-size: clamp(30px, 4vw, 51px);
  line-height: 1.15;
}

.kp-lead {
  margin: 0;
  color: var(--muted);

  font-size: clamp(17px, 2vw, 22px);
  line-height: 1.75;
}

/* STORY */

.story-box {
  position: relative;
  overflow: hidden;

  padding: 25px;

  border: 1px solid rgba(245, 158, 11, 0.32);
  border-left: 7px solid var(--orange);
  border-radius: 20px;

  background:
    linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.14),
      rgba(245, 158, 11, 0.05)
    );
}

.story-box strong {
  display: block;
  margin-bottom: 10px;

  color: #fde68a;
  font-size: 23px;
}

.story-box p {
  margin: 0;
  font-size: 19px;
  line-height: 1.85;
}

/* CARDS */

.kp-card-grid {
  display: grid;
  grid-template-columns:
    repeat(3, minmax(0, 1fr));

  gap: 17px;
  margin-top: 25px;
}

.kp-card {
  position: relative;
  overflow: hidden;

  min-height: 210px;
  padding: 23px;

  border: 1px solid var(--line);
  border-radius: 20px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.085),
      rgba(255, 255, 255, 0.035)
    );

  text-align: center;
  transition: 0.25s ease;
}

.kp-card:hover {
  transform: translateY(-7px);
  border-color: rgba(96, 165, 250, 0.55);

  box-shadow:
    0 16px 32px rgba(0, 0, 0, 0.24);
}

.kp-card .icon {
  margin-bottom: 13px;
  font-size: 55px;
}

.kp-card h3 {
  margin: 0 0 9px;
  font-family: "Montserrat", sans-serif;
}

.kp-card p {
  margin: 0;
  color: var(--muted);
  line-height: 1.65;
}

/* SERVER COMPONENTS */

.server-diagram {
  display: grid;
  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 14px;
  margin-top: 25px;
}

.server-part {
  min-height: 170px;

  border: 1px solid var(--line);
  border-radius: 20px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.075),
      rgba(255, 255, 255, 0.03)
    );

  transition: 0.25s ease;
}

.server-part:hover {
  transform: translateY(-5px);
  border-color: var(--blue-light);
}

.server-part button {
  width: 100%;
  height: 100%;
  min-height: 168px;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  padding: 16px;

  border: 0;
  border-radius: inherit;

  background: transparent;
  color: var(--text);
}

.server-part .part-icon {
  display: block;
  margin-bottom: 9px;
  font-size: 51px;
}

.server-part strong {
  font-size: 18px;
}

.server-part small {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  line-height: 1.45;
}

.server-part.active {
  border-color: var(--green);

  background:
    linear-gradient(
      145deg,
      rgba(22, 163, 74, 0.2),
      rgba(22, 163, 74, 0.08)
    );

  box-shadow:
    0 0 24px rgba(22, 163, 74, 0.22);
}

/* ACTIVITY */

.activity-box {
  padding: 26px;

  border: 1px solid var(--line);
  border-radius: 22px;

  background:
    linear-gradient(
      145deg,
      rgba(255, 255, 255, 0.075),
      rgba(255, 255, 255, 0.035)
    );
}

.activity-question {
  margin-bottom: 21px;

  font-family: "Montserrat", sans-serif;
  font-size: clamp(21px, 2.7vw, 32px);
  font-weight: 900;
  line-height: 1.4;
}

.answer-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 13px;
}

.answer-grid button {
  position: relative;

  min-height: 68px;
  padding: 16px 18px;

  border: 1px solid var(--line);
  border-radius: 15px;

  background: rgba(255, 255, 255, 0.055);
  color: var(--text);

  font-weight: 800;
  line-height: 1.45;
  text-align: left;

  transition: 0.2s ease;
}

.answer-grid button:hover {
  transform: translateY(-3px);

  border-color: var(--blue-light);
  background: rgba(37, 99, 235, 0.16);
}

.answer-grid button.correct {
  border-color: #22c55e;
  background:
    linear-gradient(
      135deg,
      rgba(22, 163, 74, 0.3),
      rgba(22, 163, 74, 0.15)
    );

  box-shadow:
    0 0 24px rgba(34, 197, 94, 0.25);
}

.answer-grid button.correct::after {
  content: "✓";
  position: absolute;
  top: 50%;
  right: 16px;

  transform: translateY(-50%);

  color: #bbf7d0;
  font-size: 25px;
}

.answer-grid button.incorrect {
  border-color: #ef4444;
  background: rgba(220, 38, 38, 0.2);
}

.answer-grid button.incorrect::after {
  content: "✕";
  position: absolute;
  top: 50%;
  right: 16px;

  transform: translateY(-50%);

  color: #fecaca;
  font-size: 23px;
}

/* FEEDBACK */

.feedback {
  display: none;
  margin-top: 17px;
  padding: 15px 17px;

  border-radius: 15px;

  font-weight: 800;
  line-height: 1.55;
}

.feedback.show {
  display: block;
}

.feedback.good {
  border: 1px solid rgba(34, 197, 94, 0.55);
  background: rgba(22, 163, 74, 0.18);
  color: #bbf7d0;
}

.feedback.bad {
  border: 1px solid rgba(239, 68, 68, 0.5);
  background: rgba(220, 38, 38, 0.17);
  color: #fecaca;
}

/* COMPLETE */

.kp-summary {
  text-align: center;
}

.kp-summary .trophy {
  font-size: clamp(100px, 13vw, 155px);

  filter:
    drop-shadow(
      0 18px 30px rgba(245, 158, 11, 0.35)
    );

  animation: trophyBounce 1.5s infinite;
}

@keyframes trophyBounce {
  50% {
    transform: translateY(-10px) rotate(3deg);
  }
}

.kp-summary h2 {
  margin: 12px 0;

  font-family: "Montserrat", sans-serif;
  font-size: clamp(36px, 5vw, 66px);
}

.reward-box {
  display: inline-grid;
  grid-template-columns: repeat(3, auto);
  gap: 18px;

  margin: 23px 0;
  padding: 19px 25px;

  border: 1px solid rgba(245, 158, 11, 0.35);
  border-radius: 20px;

  background:
    linear-gradient(
      135deg,
      rgba(245, 158, 11, 0.14),
      rgba(255, 255, 255, 0.055)
    );
}

.reward-box div {
  min-width: 125px;
  padding: 7px;
}

.reward-box span,
.reward-box b {
  display: block;
}

.reward-box span {
  color: var(--muted);
  font-size: 13px;
}

.reward-box b {
  margin-top: 4px;
  color: #fde68a;
  font-size: 27px;
}

/* NAVIGATION */

.kp-navigation {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  margin-top: 18px;
}

.kp-navigation button {
  min-width: 165px;
  padding: 14px 21px;

  border: 0;
  border-radius: 14px;

  color: #ffffff;
  font-weight: 900;

  transition: 0.22s ease;
}

.kp-navigation button:not(:disabled):hover {
  transform: translateY(-3px);
  box-shadow:
    0 12px 24px rgba(0, 0, 0, 0.25);
}

.btn-back {
  border: 1px solid var(--line) !important;
  background: rgba(255, 255, 255, 0.09);
}

.btn-next {
  background:
    linear-gradient(
      135deg,
      var(--blue),
      var(--purple)
    );
}

.btn-kt {
  background:
    linear-gradient(
      135deg,
      var(--orange),
      #d97706
    );

  color: #111827 !important;
}

/* BYTE HELPER */

.byte-helper {
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 40;
}

.byte-helper > button {
  width: 70px;
  height: 70px;

  border: 2px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;

  background:
    linear-gradient(
      135deg,
      var(--blue),
      var(--purple)
    );

  color: #ffffff;
  font-size: 32px;

  box-shadow:
    0 16px 36px rgba(0, 0, 0, 0.4);
}

.byte-tip {
  position: absolute;
  right: 0;
  bottom: 82px;

  width: min(360px, calc(100vw - 40px));
  display: none;

  padding: 17px;

  border: 1px solid var(--line);
  border-radius: 17px;

  background: #081b30;
  box-shadow: var(--shadow);

  color: var(--text);
  line-height: 1.65;
}

.byte-tip.show {
  display: block;
}

/* RESPONSIVE */

@media (max-width: 1050px) {
  .kp-card-grid {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .server-diagram {
    grid-template-columns:
      repeat(3, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .kp-shell {
    width: min(100% - 16px, 1500px);
  }

  .kp-header {
    position: relative;
    top: 0;

    align-items: flex-start;
    flex-direction: column;
  }

  .kp-header-tools {
    width: 100%;
    justify-content: flex-start;
  }

  .kp-header-tools button {
    flex: 1;
  }

  .kp-stage {
    min-height: 570px;
    padding: 19px;
  }

  .kp-card-grid,
  .answer-grid {
    grid-template-columns: 1fr;
  }

  .server-diagram {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
  }

  .reward-box {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .kp-navigation {
    flex-direction: column;
  }

  .kp-navigation button {
    width: 100%;
  }

  .byte-helper {
    right: 14px;
    bottom: 14px;
  }
}

@media (max-width: 460px) {
  .kp-brand-icon {
    width: 58px;
    height: 58px;
    flex-basis: 58px;
  }

  .college-logo {
    width: 52px;
    height: 52px;
  }

  .server-diagram {
    grid-template-columns: 1fr;
  }
}
