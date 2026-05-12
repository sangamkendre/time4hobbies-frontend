export function notify(message, type = 'info', duration = 3200) {
  const stack = document.getElementById('notif-stack');
  if (!stack) return;

  const item = document.createElement('div');
  item.className = `notif-item ${type}`;
  item.innerHTML = `
    <div class="notif-dot"></div>
    <span class="notif-msg"></span>
    <span class="notif-close" aria-label="Dismiss">x</span>
  `;
  item.querySelector('.notif-msg').textContent = message;
  item.querySelector('.notif-close').addEventListener('click', () => item.remove());
  stack.appendChild(item);

  requestAnimationFrame(() => item.classList.add('show'));
  window.setTimeout(() => {
    item.classList.remove('show');
    item.classList.add('hide');
    window.setTimeout(() => item.remove(), 350);
  }, duration);
}
