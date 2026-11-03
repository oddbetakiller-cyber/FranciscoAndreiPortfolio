document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCopyStudentId();
  initTabs();
  initTypingEffect();
  initContactForm();
  updateFooterYear();
});

function initTheme() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const htmlRoot = document.documentElement;

  const savedTheme = localStorage.getItem('profile-theme') || 'dark';
  htmlRoot.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme, themeIcon);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = htmlRoot.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      
      htmlRoot.setAttribute('data-theme', newTheme);
      localStorage.setItem('profile-theme', newTheme);
      updateThemeIcon(newTheme, themeIcon);
      showToast(`Switched to ${newTheme === 'dark' ? 'Dark' : 'Light'} Mode`);
    });
  }
}

function updateThemeIcon(theme, iconElement) {
  if (!iconElement) return;
  if (theme === 'dark') {
    iconElement.className = 'fa-solid fa-moon';
  } else {
    iconElement.className = 'fa-solid fa-sun';
  }
}

function initCopyStudentId() {
  const copyBtn = document.getElementById('copyIdBtn');
  const studentIdValue = document.getElementById('studentIdValue');
  const copyIcon = document.getElementById('copyIcon');
  const copyText = document.getElementById('copyText');

  if (!copyBtn || !studentIdValue) return;

  copyBtn.addEventListener('click', async () => {
    const idToCopy = studentIdValue.innerText.trim();

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(idToCopy);
      } else {
        const tempTextArea = document.createElement('textarea');
        tempTextArea.value = idToCopy;
        document.body.appendChild(tempTextArea);
        tempTextArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempTextArea);
      }

      copyIcon.className = 'fa-solid fa-check';
      copyText.innerText = 'Copied!';
      copyBtn.style.borderColor = '#10b981';
      copyBtn.style.color = '#10b981';

      showToast(`Student ID (${idToCopy}) copied to clipboard!`);

      setTimeout(() => {
        copyIcon.className = 'fa-regular fa-copy';
        copyText.innerText = 'Copy ID';
        copyBtn.style.borderColor = '';
        copyBtn.style.color = '';
      }, 2500);

    } catch (err) {
      showToast('Student ID: ' + idToCopy);
    }
  });
}

function initTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');

      tabButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });

      tabPanels.forEach(p => {
        p.classList.remove('active');
      });

      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      const activePanel = document.getElementById(`tab-${targetTab}`);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

function initTypingEffect() {
  const typedRole = document.getElementById('typedRole');
  if (!typedRole) return;

  const roles = [
    'Information Technology Student',
    'UI Builder & Web Developer',
    'BulSU CICT Junior • Section 3F-G2',
    'Always Building, Always Playing',
    'PC Gamer & Tech Creator'
  ];

  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;
  let typingSpeed = 80;

  function typeCycle() {
    const currentText = roles[roleIdx];

    if (isDeleting) {
      typedRole.textContent = currentText.substring(0, charIdx - 1);
      charIdx--;
      typingSpeed = 40;
    } else {
      typedRole.textContent = currentText.substring(0, charIdx + 1);
      charIdx++;
      typingSpeed = 85;
    }

    if (!isDeleting && charIdx === currentText.length) {
      isDeleting = true;
      typingSpeed = 1800;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      typingSpeed = 400;
    }

    setTimeout(typeCycle, typingSpeed);
  }

  typeCycle();
}

function initContactForm() {
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const senderName = document.getElementById('senderName').value;
      showToast(`Thank you, ${senderName}! Message sent successfully.`);
      contactForm.reset();
    });
  }
}

let toastTimeout;
function showToast(message) {
  const toast = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  if (!toast || !toastMessage) return;

  toastMessage.textContent = message;
  toast.classList.add('show');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

function updateFooterYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}
