// Scroll reveal
window.addEventListener("scroll", () => {
  document.querySelectorAll(".grid-section, .section").forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight * 0.85) {
      el.classList.add("show");
    }
  });
});

// Theme toggle
document.getElementById("theme-toggle").addEventListener("click", () => {
  const root = document.documentElement;
  root.setAttribute(
    "data-theme",
    root.getAttribute("data-theme") === "light" ? "" : "light"
  );
});
