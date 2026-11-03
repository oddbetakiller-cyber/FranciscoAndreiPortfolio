document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initCopyStudentId();
  initNavigation();
  initTypingEffect();
  initContactForm();
  updateFooterYear();
});

const VALID_TABS = ['about', 'academics', 'skills', 'projects'];
let isNavigating = false;

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

function switchTab(tabId) {
  if (!VALID_TABS.includes(tabId)) return false;

  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanels = document.querySelectorAll('.tab-panel');

  tabButtons.forEach(btn => {
    const isTarget = btn.getAttribute('data-tab') === tabId;
    btn.classList.toggle('active', isTarget);
    btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  tabPanels.forEach(panel => {
    panel.classList.toggle('active', panel.id === `tab-${tabId}`);
  });

  return true;
}

function updateActiveNavLink(targetId) {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    const isTarget = href === `#${targetId}`;
    link.classList.toggle('active', isTarget);
  });
}

function navigateTo(targetId, updateHistory = true, shouldScroll = true) {
  if (!targetId) return;
  const cleanId = targetId.replace(/^#/, '').toLowerCase();

  if (VALID_TABS.includes(cleanId)) {
    switchTab(cleanId);
    updateActiveNavLink(cleanId);

    if (shouldScroll) {
      isNavigating = true;
      const tabsSection = document.getElementById('tabs-section') || document.querySelector('.content-tabs-container');
      if (tabsSection) {
        tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => { isNavigating = false; }, 800);
    }

    if (updateHistory) {
      const newHash = `#${cleanId}`;
      if (window.location.hash !== newHash) {
        history.pushState(null, '', newHash);
      }
    }
  } else if (cleanId === 'contact') {
    updateActiveNavLink('contact');

    if (shouldScroll) {
      isNavigating = true;
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => { isNavigating = false; }, 800);
    }

    if (updateHistory) {
      if (window.location.hash !== '#contact') {
        history.pushState(null, '', '#contact');
      }
    }
  } else if (cleanId === 'profile' || cleanId === 'home') {
    updateActiveNavLink('about');

    if (shouldScroll) {
      isNavigating = true;
      const profileSection = document.getElementById('profile');
      if (profileSection) {
        profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      setTimeout(() => { isNavigating = false; }, 800);
    }

    if (updateHistory) {
      history.pushState(null, '', window.location.pathname + window.location.search);
    }
  }
}

function initNavigation() {
  // Intercept in-page anchor links (e.g. navbar links, hero buttons, brand logo)
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetHash = link.getAttribute('href');
      if (!targetHash || targetHash === '#') return;
      e.preventDefault();
      navigateTo(targetHash, true, true);
    });
  });

  // Tab buttons click listeners
  const tabButtons = document.querySelectorAll('.tab-btn');
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      if (targetTab) {
        navigateTo(targetTab, true, false);
      }
    });
  });

  // Handle browser back and forward button navigation
  window.addEventListener('popstate', () => {
    const currentHash = window.location.hash;
    if (currentHash) {
      navigateTo(currentHash, false, true);
    } else {
      navigateTo('profile', false, true);
    }
  });

  // Handle initial page load with a hash (e.g. opening #academics or #skills directly)
  const initialHash = window.location.hash;
  if (initialHash) {
    setTimeout(() => {
      navigateTo(initialHash, false, true);
    }, 150);
  }

  // Scroll spy to synchronize navbar state with scroll position
  initScrollSpy();
}

function initScrollSpy() {
  const contactSection = document.getElementById('contact');
  const tabsSection = document.getElementById('tabs-section') || document.querySelector('.content-tabs-container');
  const profileSection = document.getElementById('profile');

  if (!window.IntersectionObserver) return;

  const observerOptions = {
    root: null,
    rootMargin: '-20% 0px -40% 0px',
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    if (isNavigating) return;

    entries.forEach(entry => {
      if (entry.isIntersecting) {
        if (entry.target.id === 'contact') {
          updateActiveNavLink('contact');
        } else if (entry.target === tabsSection) {
          const currentActiveBtn = document.querySelector('.tab-btn.active');
          const currentTab = currentActiveBtn ? currentActiveBtn.getAttribute('data-tab') : 'about';
          updateActiveNavLink(currentTab);
        } else if (entry.target.id === 'profile') {
          const currentActiveBtn = document.querySelector('.tab-btn.active');
          const currentTab = currentActiveBtn ? currentActiveBtn.getAttribute('data-tab') : 'about';
          updateActiveNavLink(currentTab);
        }
      }
    });
  }, observerOptions);

  if (contactSection) observer.observe(contactSection);
  if (tabsSection) observer.observe(tabsSection);
  if (profileSection) observer.observe(profileSection);
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
