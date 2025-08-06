// Simple animation on scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll(".section");
  const triggerBottom = window.innerHeight * 0.85;

  sections.forEach((section) => {
    const sectionTop = section.getBoundingClientRect().top;
    if (sectionTop < triggerBottom) {
      section.classList.add("show");
    }
  });
});

// Fade-in effect
document.addEventListener("DOMContentLoaded", () => {
  const allSections = document.querySelectorAll(".section");
  allSections.forEach((s) => s.classList.add("fade"));
});
