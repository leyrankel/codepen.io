
document.getElementById('range').addEventListener('input', e=>{
  document.querySelector('.graph-container').style.setProperty('--rating', e.target.value);
})
