document.addEventListener('DOMContentLoaded', () => {

  let i18n = {};
  let currentLang = localStorage.getItem('lang') || 'ro';
  loadLanguage(currentLang, false);

  let componentsData = {};
  loadComponents();
  
  document
    .querySelectorAll('.field-card select')
    .forEach(enhanceSelectWithSweetAlert);

  function enhanceSelectWithSweetAlert(select) {
    select.addEventListener('click', (e) => {
      e.preventDefault(); // stop native dropdown
      openSelectSweetAlert(select);
    });
  }
function openSelectSweetAlert(select) {
  const key = select.id;
  const label = select.dataset.label || 'Select option';
  const data = componentsData[key];

  if (!data) return;

  let html = '';

  Object.entries(data).forEach(([brand, items]) => {
    html += `
      <div class="sa-group">
        <div class="sa-group-title">${brand}</div>
    `;

    items.forEach(item => {
      html += `
        <div class="sa-option"
             data-value="${item.name}"
             data-spec="${item.specUrl}">
          <span>${item.name}</span>
        </div>
      `;
    });

    html += `</div>`;
  });

  Swal.fire({
    heightAuto: false,
    scrollbarPadding: false,
    title: label,
    html,
    showConfirmButton: false,
    width: 650,
    backdrop: 'rgba(2,6,23,0.85)',
    background: '#0f172a',
    color: '#f8fafc'
  });

  document.querySelectorAll('.sa-option').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.classList.contains('sa-spec')) {
        e.stopPropagation();
        window.open(el.dataset.spec, '_blank', 'noopener');
        return;
      }

      select.value = el.dataset.value;
      select.dataset.specUrl = el.dataset.spec || '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      Swal.close();
    });
  });
}

  ['cpu', 'motherboard', 'ram', 'gpu', 'cooling', 'ssd', 'psu', 'pcc'].forEach(attachSpecIcon);


async function loadComponents() {
  try {
    const response = await fetch('./json/components.json');
    componentsData = await response.json();

    const cpuItems = flattenComponentGroup(componentsData.cpu);
      populateSelect('cpu', cpuItems);
    const motherboardItems = flattenComponentGroup(componentsData.motherboard);
      populateSelect('motherboard', motherboardItems);
    const ramItems = flattenComponentGroup(componentsData.ram);
      populateSelect('ram', ramItems);
    const gpuItems = flattenComponentGroup(componentsData.gpu);
      populateSelect('gpu', gpuItems);
    const coolingItems = flattenComponentGroup(componentsData.cooling);
      populateSelect('cooling', coolingItems);
    const ssdItems = flattenComponentGroup(componentsData.ssd);
      populateSelect('ssd', ssdItems);
    const psuItems = flattenComponentGroup(componentsData.psu);
      populateSelect('psu', psuItems);
    const pccItems = flattenComponentGroup(componentsData.pcc);
      populateSelect('pcc', pccItems);

  } catch (error) {
    console.error('Failed to load components.json', error);

    Swal.fire({
      title: 'Error',
      text: 'Failed to load configuration data.',
      icon: 'error'
    });
  }
}

function flattenComponentGroup(groupedData) {
  return Object.values(groupedData).reduce((acc, arr) => {
    return acc.concat(arr);
  }, []);
}


function populateSelect(selectId, items) {

  const select = document.getElementById(selectId);

  items.forEach(item => {
    const option = document.createElement('option');
    option.value = item.name;
    option.textContent = item.name;

    // attach metadata
    Object.keys(item).forEach(key => {
      if (key !== 'name') {
        option.dataset[key] = item[key];
      }
    });

    select.appendChild(option);
  });
}

function attachSpecIcon(selectId) {
  const select = document.getElementById(selectId);
  const card = select.closest('.field-card');
  const icon = card.querySelector('.spec-icon');

  const updateIcon = () => {
    const specUrl = select.dataset.specUrl;

    if (specUrl) {
      icon.hidden = false;
      icon.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(specUrl, '_blank', 'noopener');
      };
    } else {
      icon.hidden = true;
      icon.onclick = null;
    }
  };

  select.addEventListener('change', updateIcon);
  updateIcon();
}


function getActiveTab() {
  return document.querySelector('.tab-content.active');
}

  const submitBtns = document.querySelectorAll('.submitBtn');
  const pdfBtn = document.getElementById('pdfBtn');

submitBtns.forEach(btn => {
  btn.addEventListener('click', handleSubmit);
});


function handleSubmit() {
    const activeTab = getActiveTab();
    const requiredFields = activeTab.querySelectorAll('.required');
    let valid = true;

    requiredFields.forEach(field => {
      field.classList.remove('invalid');

      if (!field.value) {
        field.classList.add('invalid');
        valid = false;
      }
    });

    if (!valid) {
      Swal.fire({
        heightAuto: false,
        scrollbarPadding: false,
        backdrop: 'rgba(2, 6, 23, 0.85)',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#38bdf8',
        title: getTranslation('alerts.incomplete_title'),
        text: getTranslation('alerts.incomplete_text'),
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
      heightAuto: false,
      scrollbarPadding: false,
      backdrop: 'rgba(2, 6, 23, 0.85)',
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#38bdf8',
      title: getTranslation('alerts.success_title'),
      text: getTranslation('alerts.success_text'),
      icon: 'success'
    });
}

  const requiredFields = document.querySelectorAll('.required');
  // auto-clear invalid state
  requiredFields.forEach(field => {
    field.addEventListener('change', () => {
      field.classList.remove('invalid');
    });
  });



pdfBtn.addEventListener('click', () => {
  const activeTab = getActiveTab();
  const requiredFields = activeTab.querySelectorAll('.required');
console.log(requiredFields);
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
    let valid = true;
    let y = 45;

    requiredFields.forEach(field => {
      field.classList.remove('invalid');

      if (!field.value) {
        field.classList.add('invalid');
        valid = false;
      }
    });

    if (!valid) {
      Swal.fire({
        heightAuto: false,
        scrollbarPadding: false,
        backdrop: 'rgba(2, 6, 23, 0.85)',
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#38bdf8',
        title: getTranslation('alerts.incomplete_title'),
        text: getTranslation('alerts.incomplete_text'),
        icon: 'warning'
      });
      return;
    }

  // Title
doc.setFontSize(18);
doc.setFont('helvetica', 'bold');
doc.text('PC Configuration Quote', 20, 20);

doc.setLineWidth(0.5);
doc.line(20, 25, 190, 25);


// Header
doc.setFontSize(14);
doc.setFont('helvetica', 'bold');
doc.text('Selected Components', 20, 35);

doc.setFontSize(12);
doc.setFont('helvetica', 'normal');


  // Content
  doc.setFontSize(10);
requiredFields.forEach(field => {
  doc.setDrawColor(200);
  doc.rect(20, y - 6, 170, 10); // box

  doc.text(field.dataset.label, 25, y);
  doc.text(field.value, 90, y);

  y += 14;
});

  // Footer
const date = new Date().toLocaleDateString();

doc.setFontSize(10);
doc.setTextColor(120);
doc.text(`Date: ${date}`, 20, 285);


  // Download
  doc.save('pc-configuration.pdf');
});


document.getElementById('iconAttributionLink').addEventListener('click', (e) => {
  e.preventDefault();

  const icons = document.querySelectorAll('.field-icon');

  // Map to keep unique attributions
  const uniqueAttributions = new Map();

  icons.forEach(icon => {
    const name = icon.alt;
    const author = icon.dataset.author;
    const url = icon.dataset.url;

    if (!author || !url) return;

    const key = `${author}|${url}`;

    if (!uniqueAttributions.has(key)) {
      uniqueAttributions.set(key, {
        name,
        author,
        url
      });
    }
  });

  let html = '<ul style="text-align:left; padding-left:1rem;">';

  uniqueAttributions.forEach(item => {
    html += `
      <li style="margin-bottom:0.5rem;">
        <strong>${item.name}</strong><br/>
        <a href="${item.url}" target="_blank" rel="noopener">${item.author}</a>
      </li>
    `;
  });

  html += '</ul>';

  Swal.fire({
    title: getTranslation('alerts.icon_attribution'),
    html,
    icon: 'info',
    confirmButtonText: getTranslation('buttons.close'),
    width: 600,
    background: '#0f172a',
    color: '#f8fafc',
    confirmButtonColor: '#38bdf8',
    backdrop: 'rgba(2, 6, 23, 0.85)',
    heightAuto: false,
    scrollbarPadding: false,
    customClass: {
      popup: 'swal-dark',
      confirmButton: 'button-row'
    }
  });
});


document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active class from all buttons
    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    // Show the selected tab
    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  });
});


document.getElementById('contact_link').addEventListener('click', (e) => {
  e.preventDefault();

  Swal.fire({
    title: getTranslation('alerts.contact_form_title'),
    html: `
      <input type="text" id="contact-name" class="swal2-input" placeholder="${getTranslation('inputs.contact_name')}">
      <input type="email" id="contact-email" type="email" class="swal2-input" placeholder="${getTranslation('inputs.contact_email')}">
      <textarea id="contact-message" class="swal2-textarea" placeholder="${getTranslation('inputs.contact_message')}" rows="4"></textarea>`,
    confirmButtonText: getTranslation('buttons.send'),
    showCancelButton: true,
    cancelButtonText: getTranslation('buttons.cancel'),

    background: '#0f172a',
    color: '#f8fafc',
    confirmButtonColor: '#38bdf8',
    backdrop: 'rgba(2, 6, 23, 0.85)',

    heightAuto: false,
    scrollbarPadding: false,

    preConfirm: () => {
      const name = document.getElementById('contact-name').value.trim();
      const email = document.getElementById('contact-email').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !message) {
        Swal.showValidationMessage(getTranslation('alerts.all_fields_check'));
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage(getTranslation('alerts.valid_email_check'));
        return false;
      }

      return { name, email, message };
    }
  }).then((result) => {
    if (!result.isConfirmed) return;

    // PLACEHOLDER for now
    console.log('Contact form data:', result.value);

    Swal.fire({
      icon: 'success',
      title: getTranslation('alerts.contact_title'),
      text: getTranslation('alerts.contact_text'),
      background: '#0f172a',
      color: '#f8fafc',
      confirmButtonColor: '#38bdf8',
      backdrop: 'rgba(2, 6, 23, 0.85)',
      heightAuto: false,
      scrollbarPadding: false
    });
  });
});


// TRANSLATION
document.querySelectorAll('.lang-options button').forEach(btn => {
  btn.addEventListener('click', () => {
    const lang = btn.dataset.lang;

    loadLanguage(lang, true);
    localStorage.setItem('lang', lang);
  });
});

async function loadLanguage(lang, animate = false) {
  const res = await fetch(`lang/${lang}.json`);
  i18n = await res.json();
  currentLang = lang;

  applyTranslations(animate);
}


function getTranslation(key) {
  return key.split('.').reduce((obj, k) => obj?.[k], i18n) || key;
}

function applyTranslations(animate = false) {
  const textNodes = document.querySelectorAll('[data-i18n]');
  const attrNodes = document.querySelectorAll(
    '[data-i18n-aria], [data-i18n-title], [data-label-i18n]'
  );

  const applyText = () => {
    textNodes.forEach(el => {
      const key = el.dataset.i18n;
      const value = getTranslation(key);
      if (!value) return;

      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    });
  };

  const applyAttributes = () => {
    attrNodes.forEach(el => {
      if (el.dataset.i18nAria) {
        const val = getTranslation(el.dataset.i18nAria);
        if (val) el.setAttribute('aria-label', val);
      }

      if (el.dataset.i18nTitle) {
        const val = getTranslation(el.dataset.i18nTitle);
        if (val) el.setAttribute('title', val);
      }

      if (el.dataset.labelI18n) {
        const val = getTranslation(el.dataset.labelI18n);
        if (val) el.dataset.label = val;
      }
    });
  };

  const applyAll = () => {
    applyText();
    applyAttributes();
  };

  if (!animate) {
    applyAll();
    return;
  }

  // animation phase
  textNodes.forEach(el => el.classList.add('i18n-hidden'));

  setTimeout(() => {
    applyAll();
    textNodes.forEach(el => el.classList.remove('i18n-hidden'));
  }, 200);
}




});
