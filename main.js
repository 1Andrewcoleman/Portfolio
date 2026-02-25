"use strict";

/* ── Constants ── */
const FADE_MS = 400;
const TOAST_DISPLAY_MS = 5000;

const ABOUT_CONTENT = {
  skills: `
    <h1>Some Key Skills</h1>
    <p>My professional skill set is diverse and robust, encompassing expertise in weather forecasting, mesoscale meteorology, and the precision of technical writing. I'm equally dedicated to research, data science, and the application of AI/ML methods to Earth system sciences, with a solid foundation in Python (amongst other languages) to bring it all together. These key skills enable me to tackle complex challenges in meteorology with a multi-faceted approach.</p>`,
  education: `
    <h1>Educational Pursuits</h1>
    <ul>
      <li>A.S. in Geography, University of North Georgia, 2016-2018</li>
      <li>B.S. in Atmospheric Science, University of North Carolina Asheville, 2018-2021</li>
      <li>M.S. in Applied Meteorology, Mississippi State University, 2022-2025</li>
    </ul>`,
  research: `
    <h1>Research Interests</h1>
    <ul>
      <li>Boundary Layer Cold Season Dynamics</li>
      <li>Mesoscale Processes and Severe Convective Weather</li>
      <li>Artificial Intelligence in the Earth/Atmospheric Sciences</li>
      <li>Short-Medium Range Atmospheric Predictability</li>
      <li>Numerical Ensemble Techniques</li>
    </ul>`,
  hobbies: `
    <h1>How I Pass the Time</h1>
    <p>When I'm not refining my programmatic or meteorological skills, you can find me engaged in a game of chess or savoring a good cup of coffee. Travel and fitness are also parts of my routine, offering a refreshing counterbalance to my professional pursuits. But it's the moments shared with my wife and our golden retriever, Teddy, as well as time with my family, that I cherish the most. These simple joys add a meaningful depth to my life beyond the screen.</p>`,
};

/* ── State ── */
let activeInfoCard = null;

/* ── Initialization ── */
document.addEventListener("DOMContentLoaded", function () {
  initMobileWarning();
  initNavigation();
  initAboutContent();
  initContactForm();
  initInfoCards();
  initStarfield();
});

/* ── Mobile Warning Modal ── */
function initMobileWarning() {
  const modal = document.getElementById("mobileWarningModal");
  if (!modal) return;

  const handleClose = () => (modal.style.display = "none");
  modal.querySelector(".close").addEventListener("click", handleClose);
  document.getElementById("dismissBtn").addEventListener("click", handleClose);

  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
    navigator.userAgent
  );
  if (isMobile) modal.style.display = "block";
}

/* ── Section Navigation ──
   Sections are stacked via position:fixed. Visibility is toggled
   with .hidden/.visible classes that transition opacity + visibility
   (no display:none, so CSS transitions actually work). */
function initNavigation() {
  const allSections = document.querySelectorAll("section, .landing-page");

  allSections.forEach((s) => s.classList.add("hidden"));
  const landing = document.getElementById("landing-page");
  landing.classList.remove("hidden");
  landing.classList.add("visible");

  document.querySelectorAll(".vertical-navbar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      if (activeInfoCard) handleCloseInfoCard(activeInfoCard);

      allSections.forEach((s) => {
        s.classList.remove("visible");
        s.classList.add("hidden");
      });

      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.classList.remove("hidden");
        target.classList.add("visible");
      }
    });
  });
}

/* ── About Me Content Switching ── */
function initAboutContent() {
  const display = document.querySelector("#about-me .content-display");
  if (!display) return;

  document.querySelectorAll(".info-button").forEach((btn) => {
    btn.addEventListener("click", function () {
      const html = ABOUT_CONTENT[this.dataset.target];
      if (!html) return;

      display.style.transition = "opacity 0.5s";
      display.style.opacity = 0;

      setTimeout(() => {
        display.innerHTML = html;
        display.style.opacity = 1;
      }, 500);
    });
  });
}

/* ── Notification Toast ── */
function showNotification(message, isSuccess) {
  const el = document.getElementById("notification-window");
  const msg = document.getElementById("notification-message");
  if (!el || !msg) return;

  msg.textContent = message;
  el.className = `notification-window ${isSuccess ? "notification-success" : "notification-error"}`;
  el.style.display = "block";

  requestAnimationFrame(() => (el.style.top = "-5px"));

  setTimeout(() => {
    el.style.top = "-100px";
    setTimeout(() => (el.style.display = "none"), 500);
  }, TOAST_DISPLAY_MS);
}

/* ── Contact Form ── */
function initContactForm() {
  const form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", handleContactSubmit);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const submitBtn = form.querySelector(".send-button");
  const sendText = submitBtn.querySelector(".send-text");

  if (submitBtn.disabled) return;

  submitBtn.disabled = true;
  const originalText = sendText.textContent;
  sendText.textContent = "SENDING...";

  const formData = Object.fromEntries(new FormData(form));

  fetch("/api/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  })
    .then((res) => {
      if (!res.ok) throw new Error(res.statusText);
      return res.text();
    })
    .then(() => {
      form.reset();
      showNotification("Email sent successfully!", true);
    })
    .catch(() => {
      showNotification("Failed to send email. Please try again later.", false);
    })
    .finally(() => {
      submitBtn.disabled = false;
      sendText.textContent = originalText;
    });
}

/* ── Info Card Modals ── */
function initInfoCards() {
  const backdrop = document.getElementById("modal-backdrop");
  if (!backdrop) return;

  document.addEventListener("click", function (e) {
    const openBtn = e.target.closest("[data-open-card]");
    if (openBtn) {
      handleOpenInfoCard(openBtn.dataset.openCard);
      return;
    }

    const closeBtn = e.target.closest("[data-close-card]");
    if (closeBtn) {
      handleCloseInfoCard(closeBtn.dataset.closeCard);
    }
  });

  backdrop.addEventListener("click", function () {
    if (activeInfoCard) handleCloseInfoCard(activeInfoCard);
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && activeInfoCard) {
      handleCloseInfoCard(activeInfoCard);
    }
  });
}

function handleOpenInfoCard(cardId) {
  if (activeInfoCard) handleCloseInfoCard(activeInfoCard);

  const card = document.getElementById(cardId);
  const backdrop = document.getElementById("modal-backdrop");
  if (!card || !backdrop) return;

  activeInfoCard = cardId;
  backdrop.classList.add("active");

  const section = card.closest("section");
  if (section) section.style.overflow = "hidden";

  card.style.display = "flex";
  card.setAttribute("aria-hidden", "false");

  // Force reflow so the opacity transition triggers after display:flex is applied
  void card.offsetHeight;
  card.classList.add("visible");
}

function handleCloseInfoCard(cardId) {
  const card = document.getElementById(cardId);
  const backdrop = document.getElementById("modal-backdrop");
  if (!card || !backdrop) return;

  activeInfoCard = null;
  card.classList.remove("visible");
  backdrop.classList.remove("active");
  card.setAttribute("aria-hidden", "true");

  const section = card.closest("section");
  if (section) section.style.overflow = "";

  setTimeout(() => (card.style.display = "none"), FADE_MS + 100);
}

/* ── Starfield Canvas ── */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const COLOR_HUES = [0, 60, 240];

  function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function wrapCoord(c, max) {
    if (c >= max) return c % max;
    if (c <= 0) return max + c;
    return c;
  }

  class Star {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.radius = Math.random() * 1.2;
      this.hue = COLOR_HUES[randomInt(0, COLOR_HUES.length - 1)];
      this.sat = randomInt(50, 100);
      this.depth = randomInt(1, 3);
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsl(${this.hue}, ${this.sat}%, 88%)`;
      ctx.fill();
    }

    parallax(hw, hh, mouseX, mouseY) {
      const factor = this.depth * 0.01 + (this.depth === 3 ? 0.02 : 0);
      this.x = wrapCoord(this.x - (mouseX - hw) * factor, window.outerWidth);
      this.y = wrapCoord(this.y - (mouseY - hh) * factor, window.outerHeight);
    }
  }

  let stars = [];

  function generate() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const count = Math.round((window.outerWidth * window.outerHeight) / 1000);
    stars = Array.from({ length: count }, () => new Star());
    redraw();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => star.draw());
  }

  generate();
  window.addEventListener("resize", generate);

  document.addEventListener("mousemove", function (e) {
    const hw = window.innerWidth / 2;
    const hh = window.innerHeight / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach((star) => {
      star.parallax(hw, hh, e.clientX, e.clientY);
      star.draw();
    });
  });
}
