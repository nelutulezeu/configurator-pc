document.addEventListener('DOMContentLoaded', () => {

  const requiredFields = document.querySelectorAll('.required');
  const submitBtn = document.getElementById('submitBtn');
  const pdfBtn = document.getElementById('pdfBtn');

  submitBtn.addEventListener('click', () => {
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
        title: 'Incomplete selection',
        text: 'Please fill all required fields.',
        icon: 'warning'
      });
      return;
    }

    Swal.fire({
      title: 'Configuration ready!',
      html: Array.from(requiredFields)
        .map(f => `<strong>${f.id.toUpperCase()}:</strong> ${f.value}`)
        .join('<br/>'),
      icon: 'success'
    });
  });

  // auto-clear invalid state
  requiredFields.forEach(field => {
    field.addEventListener('change', () => {
      field.classList.remove('invalid');
    });
  });



pdfBtn.addEventListener('click', () => {
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

  let html = '<ul style="text-align:left; padding-left:1rem;">';

  icons.forEach(icon => {
    const name = icon.alt;
    const author = icon.dataset.author;
    const url = icon.dataset.url;

    html += `
      <li style="margin-bottom:0.5rem;">
        <strong>${name}</strong><br/>
        Icon by <a href="${url}" target="_blank">${author}</a>
      </li>
    `;
  });

  html += '</ul>';

  Swal.fire({
    title: 'Icon Attribution',
    html: html,
    icon: 'info',
    confirmButtonText: 'Close',
    width: 600
  });
});


});
