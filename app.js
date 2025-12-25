document.getElementById('submitBtn').addEventListener('click', () => {
  const cpu = document.getElementById('cpu').value;
  const gpu = document.getElementById('gpu').value;

  if (!cpu || !gpu) {
    Swal.fire({
  title: 'Configuration sent!',
  text: 'We will contact you shortly with a custom offer.',
  icon: 'success',
  confirmButtonText: 'OK'
});

    return;
  }

  alert(`Configuration submitted:\nCPU: ${cpu}\nGPU: ${gpu}`);
});
