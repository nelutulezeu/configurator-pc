document.getElementById('submitBtn').addEventListener('click', () => {
  const cpu = document.getElementById('cpu').value;
  const gpu = document.getElementById('gpu').value;

  if (!cpu || !gpu) {
    alert('Please select CPU and GPU');
    return;
  }

  alert(`Configuration submitted:\nCPU: ${cpu}\nGPU: ${gpu}`);
});
