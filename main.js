/**
 * Andrew Coleman – Portfolio Website
 * main.js — All client-side JavaScript
 */

/* ═══════════════════════════════════════
   Starfield Canvas (parallax background)
   ═══════════════════════════════════════ */
(function () {
  const canvas = document.getElementById("starfield");
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
    const starCount = Math.round(
      (window.outerWidth * window.outerHeight) / 1000
    );
    stars = [];
    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }
    redraw();
  }

  function redraw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      star.draw();
    }
  }

  generate();
  window.addEventListener("resize", generate);

  document.addEventListener("mousemove", function (e) {
    const hw = window.innerWidth / 2;
    const hh = window.innerHeight / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const star of stars) {
      star.parallax(hw, hh, e.clientX, e.clientY);
      star.draw();
    }
  });
})();

/* ═══════════════════════════════════════
   Navigation + Scroll Animations
   ═══════════════════════════════════════ */
document.addEventListener("DOMContentLoaded", function () {
  // ── Smooth scroll navigation ──
  document.querySelectorAll(".vertical-navbar a").forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      var target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
        history.pushState(null, null, this.getAttribute("href"));
      }
    });
  });

  // ── Active nav indicator via IntersectionObserver ──
  var sections = document.querySelectorAll("section, .landing-page");
  var navLinks = document.querySelectorAll(".vertical-navbar a");

  var sectionObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === "#" + id
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(function (section) {
    sectionObserver.observe(section);
  });

  // ── Scroll-triggered entrance animations ──
  var animObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll("section").forEach(function (s) {
    animObserver.observe(s);
  });

  // ── Deep link support ──
  if (window.location.hash) {
    var hashTarget = document.querySelector(window.location.hash);
    if (hashTarget) {
      setTimeout(function () {
        hashTarget.scrollIntoView();
      }, 100);
    }
  }

  /* ═══════════════════════════════════════
     Portfolio — Info Card Modals
     ═══════════════════════════════════════ */
  function openInfoCard(cardId) {
    var card = document.getElementById(cardId);
    var backdrop = document.getElementById("infoCardBackdrop");
    if (!card || !backdrop) return;
    backdrop.style.display = "block";
    card.style.display = "flex";
    setTimeout(function () {
      backdrop.classList.add("visible");
      card.classList.add("visible");
    }, 50);
    backdrop.onclick = function () {
      closeInfoCard(cardId);
    };
  }

  function closeInfoCard(cardId) {
    var card = document.getElementById(cardId);
    var backdrop = document.getElementById("infoCardBackdrop");
    if (!card || !backdrop) return;
    card.classList.remove("visible");
    backdrop.classList.remove("visible");
    setTimeout(function () {
      card.style.display = "none";
      backdrop.style.display = "none";
    }, 500);
  }

  // Learn More buttons → open info card
  document.querySelectorAll(".btn-learn-more").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var box = this.closest(".box");
      if (box && box.dataset.card) {
        openInfoCard(box.dataset.card);
      }
    });
  });

  // Close buttons inside info cards
  document.querySelectorAll(".close-card").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var card = this.closest(".info-card");
      if (card) closeInfoCard(card.id);
    });
  });

  // Close info card on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".info-card.visible").forEach(function (card) {
        closeInfoCard(card.id);
      });
    }
  });

  // Touch toggle for portfolio cards on mobile
  if ("ontouchstart" in window) {
    document.querySelectorAll(".box").forEach(function (box) {
      box.addEventListener("click", function (e) {
        if (e.target.closest(".btn-learn-more")) return;
        document.querySelectorAll(".box.touch-active").forEach(function (b) {
          if (b !== box) b.classList.remove("touch-active");
        });
        this.classList.toggle("touch-active");
      });
    });
  }

  /* ═══════════════════════════════════════
     Contact Form Submission
     ═══════════════════════════════════════ */
  function showNotification(message, isSuccess) {
    var el = document.getElementById("notification-window");
    var msg = document.getElementById("notification-message");

    msg.textContent = message;
    el.className =
      "notification-window " +
      (isSuccess ? "notification-success" : "notification-error");
    el.style.display = "block";
    el.style.top = "-5px";

    setTimeout(function () {
      el.style.top = "-100px";
      setTimeout(function () {
        el.style.display = "none";
      }, 500);
    }, 5000);
  }

  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();

      var formData = {
        name: document.getElementById("name").value,
        email: document.getElementById("email").value,
        message: document.getElementById("message").value,
      };

      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
        .then(function (response) {
          if (!response.ok) throw new Error("Network response was not ok");
          return response.text();
        })
        .then(function () {
          document.getElementById("name").value = "";
          document.getElementById("email").value = "";
          document.getElementById("message").value = "";
          showNotification("Email sent successfully!", true);
        })
        .catch(function () {
          showNotification(
            "Failed to send email. Please try again later.",
            false
          );
        });
    });
  }
});
