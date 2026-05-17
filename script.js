document.addEventListener("DOMContentLoaded", function() {
  var links = document.querySelectorAll('a[href^="#"]');
  var navLinks = document.querySelectorAll(".nav-links a[href^='#']");
  var progress = document.querySelector(".scroll-progress");
  var cursorGlow = document.querySelector(".cursor-glow");
  var themeToggle = document.querySelector(".theme-toggle");
  var themeToggleText = document.querySelector(".theme-toggle-text");
  var interactiveCards = document.querySelectorAll(".project-card, .stack-card, .cert-card");
  var counters = document.querySelectorAll("[data-count]");
  var revealTargets = document.querySelectorAll(
    ".section-heading, .about-copy, .about-stats div, .build-grid article, .stack-card, .timeline-item, .education-card, .cert-card, .project-card, .contact-section"
  );
  var savedTheme = localStorage.getItem("portfolio-theme");
  var prefersLight = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  var initialTheme = savedTheme || (prefersLight ? "light" : "dark");

  function applyTheme(theme) {
    var nextLabel = theme === "light" ? "Dark" : "Light";

    document.documentElement.setAttribute("data-theme", theme);

    if (themeToggle) {
      themeToggle.setAttribute("aria-label", "Switch to " + nextLabel.toLowerCase() + " mode");
      themeToggle.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }

    if (themeToggleText) {
      themeToggleText.textContent = nextLabel;
    }
  }

  applyTheme(initialTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function() {
      var currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
      var nextTheme = currentTheme === "light" ? "dark" : "light";

      localStorage.setItem("portfolio-theme", nextTheme);
      applyTheme(nextTheme);
    });
  }

  links.forEach(function(link) {
    link.addEventListener("click", function(event) {
      var target = document.querySelector(link.getAttribute("href"));

      if (!target) {
        return;
      }

      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  function updateProgress() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progressValue = scrollHeight > 0 ? scrollTop / scrollHeight : 0;

    if (progress) {
      progress.style.transform = "scaleX(" + progressValue + ")";
    }
  }

  function updateActiveNav() {
    var activeId = "";

    navLinks.forEach(function(link) {
      var section = document.querySelector(link.getAttribute("href"));

      if (section && section.getBoundingClientRect().top <= 140) {
        activeId = link.getAttribute("href");
      }
    });

    navLinks.forEach(function(link) {
      link.classList.toggle("is-active", link.getAttribute("href") === activeId);
    });
  }

  window.addEventListener("scroll", function() {
    updateProgress();
    updateActiveNav();
  }, { passive: true });

  updateProgress();
  updateActiveNav();

  if (cursorGlow && window.matchMedia("(pointer: fine)").matches) {
    document.body.classList.add("has-pointer");
    window.addEventListener("pointermove", function(event) {
      cursorGlow.style.transform = "translate3d(" + event.clientX + "px, " + event.clientY + "px, 0) translate3d(-50%, -50%, 0)";
    }, { passive: true });
  }

  interactiveCards.forEach(function(card) {
    card.addEventListener("pointermove", function(event) {
      var rect = card.getBoundingClientRect();
      var x = event.clientX - rect.left;
      var y = event.clientY - rect.top;
      var rotateY = ((x / rect.width) - 0.5) * 8;
      var rotateX = ((y / rect.height) - 0.5) * -8;

      card.style.setProperty("--tilt-x", rotateX.toFixed(2) + "deg");
      card.style.setProperty("--tilt-y", rotateY.toFixed(2) + "deg");
      card.style.setProperty("--spot-x", (x / rect.width * 100).toFixed(2) + "%");
      card.style.setProperty("--spot-y", (y / rect.height * 100).toFixed(2) + "%");
    });

    card.addEventListener("pointerleave", function() {
      card.style.removeProperty("--tilt-x");
      card.style.removeProperty("--tilt-y");
      card.style.removeProperty("--spot-x");
      card.style.removeProperty("--spot-y");
    });
  });

  revealTargets.forEach(function(target) {
    target.classList.add("reveal");
  });

  revealTargets.forEach(function(target, index) {
    target.style.setProperty("--reveal-delay", Math.min(index % 6, 5) * 45 + "ms");
  });

  function animateCounter(counter) {
    var target = Number(counter.getAttribute("data-count"));
    var suffix = counter.getAttribute("data-suffix") || "";
    var start = performance.now();
    var duration = 850;

    function tick(now) {
      var progressValue = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progressValue, 3);
      var value = Math.round(target * eased);

      counter.textContent = value + suffix;

      if (progressValue < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if (!("IntersectionObserver" in window)) {
    revealTargets.forEach(function(target) {
      target.classList.add("is-visible");
    });
    counters.forEach(animateCounter);
    return;
  }

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    rootMargin: "0px 0px -10% 0px",
    threshold: 0.12
  });

  revealTargets.forEach(function(target) {
    observer.observe(target);
  });

  var counterObserver = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.8
  });

  counters.forEach(function(counter) {
    counterObserver.observe(counter);
  });
});
