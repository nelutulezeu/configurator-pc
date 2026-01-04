document.addEventListener('DOMContentLoaded', () => {

const jsonScript = document.getElementById('components-data');
const componentsData = JSON.parse(jsonScript.textContent);

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
          <span class="sa-spec">Specs</span>
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
      select.dispatchEvent(new Event('change', { bubbles: true }));
      Swal.close();
    });
  });
}

const cpuItems = flattenComponentGroup(componentsData.cpu);
console.log('Flattened CPU items:', cpuItems);
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

attachSpecIcon('cpu');
attachSpecIcon('motherboard');
attachSpecIcon('ram');
attachSpecIcon('gpu');
attachSpecIcon('cooling');
attachSpecIcon('ssd');
attachSpecIcon('psu');
attachSpecIcon('pcc');


async function loadComponents() {
  try {
    const response = await fetch('./components.json');
    const data = await response.json();

    Object.keys(data).forEach(key => {
      const select = document.getElementById(key);
      if (!select) return;

      data[key].forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        select.appendChild(option);
      });
    });

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
    const opt = select.selectedOptions[0];

    if (opt && opt.dataset.specUrl) {
      icon.hidden = false;
      icon.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.open(opt.dataset.specUrl, '_blank', 'noopener');
      };
    } else {
      icon.hidden = true;
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
backdrop: 'rgba(2, 6, 23, 0.85)',
  background: '#0f172a',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
        title: 'Incomplete selection',
        text: 'Please fill all required fields.',
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
backdrop: 'rgba(2, 6, 23, 0.85)',
  background: '#0f172a',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
      title: 'Configuration sent!',
      text: 'Your configuration was sent, well get back to you soon. Thank you!',
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
backdrop: 'rgba(2, 6, 23, 0.85)',
  background: '#0f172a',
  color: '#f8fafc',
  confirmButtonColor: '#38bdf8',
        title: 'Incomplete selection',
        text: 'Please fill all required fields.',
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
    title: 'Icon Attribution',
    html,
    icon: 'info',
    confirmButtonText: 'Close',
    width: 600,
    background: '#0f172a',
    color: '#f8fafc',
    confirmButtonColor: '#38bdf8',
    backdrop: 'rgba(2, 6, 23, 0.85)',
    customClass: {
      popup: 'swal-dark'
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

// select language
document.querySelectorAll('.lang-options button').forEach(btn => {
  btn.addEventListener('click', () => {

    // TODO: call your localization switch here
    // setLanguage(btn.dataset.lang);

  });
});



});
