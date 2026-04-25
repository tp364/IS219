const params = new URLSearchParams(window.location.search);
const returnTo = params.get('returnTo') || '/IS219/#story';

document.querySelectorAll('[data-return-link]').forEach((link) => {
  if (link instanceof HTMLAnchorElement) {
    link.href = returnTo;
  }
});
