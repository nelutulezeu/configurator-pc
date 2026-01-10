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
    select.addEventListener('mousedown', (e) => {
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

  Object.entries(data).forEach(([groupName, items]) => {
    html += `
      <div class="sa-group">
        <div class="sa-group-title" style="cursor:pointer; display:flex; justify-content:space-between; align-items:center;">
          <span>${groupName}</span>
          <span class="sa-toggle">+</span>
        </div>
        <div class="sa-group-options" style="max-height:0; overflow:hidden; transition:max-height 0.3s ease; padding-left:10px; margin-top:5px;">
          ${items
            .map(
              item => `
            <div class="sa-option" 
                 data-value="${item.name}" 
                 data-spec="${item.spec_url || ''}">
              ${item.name}
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
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

  // Handle smooth group expand/collapse
  document.querySelectorAll('.sa-group-title').forEach(title => {
    const toggle = title.querySelector('.sa-toggle');
    const options = title.nextElementSibling;

    title.addEventListener('click', () => {
      const isOpen = options.style.maxHeight && options.style.maxHeight !== '0px';
      if (isOpen) {
        options.style.maxHeight = '0';
        toggle.textContent = '+';
      } else {
        options.style.maxHeight = options.scrollHeight + 'px';
        toggle.textContent = '−';
      }
    });
  });

  // Handle option selection
  document.querySelectorAll('.sa-option').forEach(el => {
    el.addEventListener('click', e => {
      select.value = el.dataset.value;
      select.dataset.specUrl = el.dataset.spec || '';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      Swal.close();
    });
  });
}

async function loadComponents() {
  try {
    const response = await fetch('./json/components.json');
    componentsData = await response.json(); // store globally

    Object.keys(componentsData).forEach(key => {
      const select = document.getElementById(key);
      if (!select) return;

      const items = componentsData[key];
      if (!items) return;

      populateSelect(key, items);
    });

    attachSpecIconsDynamically();

  } catch (error) {
    Swal.fire({
      title: 'Error',
      text: 'Failed to load configuration data.',
      icon: 'error',
      heightAuto: false,
      scrollbarPadding: false
    });
  }
}

function populateSelect(selectId, items) {
  const select = document.getElementById(selectId);
  if (!select) return;

  // If items is an object with categories, flatten it
  if (typeof items === 'object' && !Array.isArray(items)) {
    items = Object.values(items).flat();
  }

  items.forEach(item => {
    const option = document.createElement('option');

    if (typeof item === 'object' && item.name) {
      option.value = item.name;
      option.textContent = item.name;
      option.dataset.specUrl = item.spec_url || '';
    } else {
      option.value = item;
      option.textContent = item;
    }

    select.appendChild(option);
  });
}

function attachSpecIconsDynamically() {
  document.querySelectorAll('.field-card select').forEach(select => {
    const card = select.closest('.field-card');
    if (!card) return;

    const icon = card.querySelector('.spec-icon');
    if (!icon) return;

    const updateIcon = () => {
      const opt = select.selectedOptions[0];
      const url = opt?.dataset.specUrl || '';
      icon.hidden = !url;

      // remove previous handler to avoid duplicates
      icon.onclick = url
        ? e => {
            e.preventDefault();
            e.stopPropagation();
            window.open(url, '_blank', 'noopener');
          }
        : null;
    };

    // update icon when selection changes
    select.addEventListener('change', updateIcon);

    // initialize icon state
    updateIcon();
  });
}

function getActiveTab() {
  return document.querySelector('.tab-content.active');
}

  const submitBtns = document.querySelectorAll('.submitBtn');
  const pdfBtn = document.getElementById('pdfBtn');

submitBtns.forEach(btn => {
  btn.addEventListener('click', handleSubmit);
});
pdfBtn.addEventListener('click', handlePDF);

function handleSubmit() {
  const activeTab = getActiveTab();
  if (!validateRequiredFields(activeTab)) {
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

  const capturedData = captureFormData(activeTab);

  emailjs.init({
    publicKey: 'YIAghefyjq-VmlTVB',
    blockHeadless: true,
    limitRate: {
      id: 'offer-form',
      throttle: 10000,
    },
  });

  if (activeTab.id == 'predefined') {
    const templateParams = {
      tab: '',
      from_name: capturedData.find(data => data.fieldName === 'Name ')?.fieldValue,
      from_email: capturedData.find(data => data.fieldName === 'Email ')?.fieldValue,
      phone: capturedData.find(data => data.fieldName === 'Phone ')?.fieldValue,
      info: capturedData.find(data => data.fieldName === 'Informations ')?.fieldValue,
      rows: capturedData.filter(data => 
        data.fieldName !== 'Name ' && 
        data.fieldName !== 'Email ' && 
        data.fieldName !== 'Phone ' && 
        data.fieldName !== 'Informations '
      ).map(data => ({ field: data.fieldName, value: data.fieldValue })),
    };
    console.log(templateParams);
    emailjs.send("service_c724rvh", "template_9v5f4fl", templateParams)
    .then(function(response) {
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
      clearFormFields();
    }, function(error) {
      Swal.fire({
        icon: 'warning',
        title: getTranslation('alerts.contact_title_error'),
        text: getTranslation('alerts.contact_text_error'),
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#38bdf8',
        backdrop: 'rgba(2, 6, 23, 0.85)',
        heightAuto: false,
        scrollbarPadding: false
      });
    });
  } else if (activeTab.id == 'custom') {
    const templateParams = {
      tab: '1',
      from_name: capturedData.find(d => d.field === 'Name')?.value || '',
      from_email: capturedData.find(d => d.field === 'Email')?.value || '',
      phone: capturedData.find(d => d.field === 'Phone')?.value || '',
      info: capturedData.find(d => d.field === 'Informations')?.value || '',
    
      rows: capturedData
        .filter(d =>
          !['Name', 'Email', 'Phone', 'Informations'].includes(d.field)
        )
        .map(d => ({
          field: d.field,
          value: d.value
        }))
    };
    console.log(templateParams);
  }
}

function handlePDF() {
  if (!validateRequiredFields()) {
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
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 45;
  
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
}

function validateRequiredFields(activeTab) {
  const requiredFields = activeTab.querySelectorAll('.required');
  let valid = true;

  requiredFields.forEach(field => {
    field.classList.remove('invalid');
    if (!field.value) {
      field.classList.add('invalid');
      valid = false;
    }
  });
  
  return valid;
}

function captureFormData(activeTab) {
  const formData = [];

  activeTab.querySelectorAll('.field-card').forEach(fieldCard => {
    const labelEl = fieldCard.querySelector('.field-label');
    const baseFieldName = labelEl?.getAttribute('data-label-en') || '';

    fieldCard.querySelectorAll('select').forEach(select => {
      formData.push({
        field: baseFieldName,
        value: select.value || ''
      });
    });

    fieldCard.querySelectorAll('input').forEach(input => {
      // skip component/type inputs (handled elsewhere if needed)
      if (input.dataset.component) return;

      formData.push({
        field: baseFieldName,
        value: input.value.trim() || ''
      });
    });
  });

  activeTab.querySelectorAll('[data-component][data-type]').forEach(el => {
    formData.push({
      component: el.dataset.component,
      type: el.dataset.type,
      value: el.value.trim() || ''
    });
  });

  return formData;
}

function clearFormFields() {
  document.querySelectorAll('.field-card input').forEach(input => {
    input.value = '';
  });

  document.querySelectorAll('.field-card select').forEach(select => {
    select.value = '';
  });

  document.querySelectorAll('.spec-icon').forEach(icon => {
    icon.hidden = true; 
    icon.onclick = null;
  });
}


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

const requiredFields = document.querySelectorAll('.required');
  // auto-clear invalid state
  requiredFields.forEach(field => {
    field.addEventListener('change', () => {
      field.classList.remove('invalid');
  });
});

document.querySelectorAll('.tab-button').forEach(btn => {
  btn.addEventListener('click', () => {

    document
      .querySelectorAll('.required.invalid')
      .forEach(el => el.classList.remove('invalid'));

    document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

    const tabId = btn.dataset.tab;
    document.getElementById(tabId).classList.add('active');
  });
});


document.getElementById('contact_link').addEventListener('click', (e) => {
  e.preventDefault();

  emailjs.init({
  publicKey: 'YIAghefyjq-VmlTVB',
  blockHeadless: true,
  limitRate: {
    id: 'contact-form',
    throttle: 10000,
  },
});
  
  Swal.fire({
    title: getTranslation('alerts.contact_form_title'),
    html: `
      <input type="text" id="contact-name" class="swal2-input" placeholder="${getTranslation('inputs.contact_name')}">
      <input type="email" id="contact-email" type="email" class="swal2-input" placeholder="${getTranslation('inputs.contact_email')}">
       <input type="text" id="contact-subject" class="swal2-input" placeholder="${getTranslation('inputs.contact_subject')}">
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
      const subject = document.getElementById('contact-subject').value.trim();
      const message = document.getElementById('contact-message').value.trim();

      if (!name || !email || !subject || !message) {
        Swal.showValidationMessage(getTranslation('alerts.all_fields_check'));
        return false;
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        Swal.showValidationMessage(getTranslation('alerts.valid_email_check'));
        return false;
      }

      return { name, email, subject, message };
    }
  }).then((result) => {
    if (!result.isConfirmed) return;

    const { name, email, subject, message } = result.value;
  
    const templateParams = {
      from_name: name,
      from_email: email,
      subject: subject,
      message: message,
    };

    emailjs.send("service_c724rvh", "template_jlihdun", templateParams)
    .then(function(response) {
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
    }, function(error) {
      Swal.fire({
        icon: 'warning',
        title: getTranslation('alerts.contact_title_error'),
        text: getTranslation('alerts.contact_text_error'),
        background: '#0f172a',
        color: '#f8fafc',
        confirmButtonColor: '#38bdf8',
        backdrop: 'rgba(2, 6, 23, 0.85)',
        heightAuto: false,
        scrollbarPadding: false
      });
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
  if (!res.ok){
      Swal.fire({
        title: 'Error',
        text: 'Failed to load language data.',
        icon: 'error',
        heightAuto: false,
        scrollbarPadding: false
    });
  }
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
