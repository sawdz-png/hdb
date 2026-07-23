// Año dinámico en el footer
document.getElementById('year').textContent = new Date().getFullYear();

// Menú móvil
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', isOpen);
});

navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

// Botón "volver arriba"
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  toTop.classList.toggle('is-visible', window.scrollY > 600);
});

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});
