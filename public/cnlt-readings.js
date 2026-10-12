(() => {
  const button = document.querySelector('[data-cnlt-option]');
  const original = document.getElementById('current-translation-option');
  const endpoint = document.querySelector('meta[name="cnlt-api"]')?.content;
  if (!button || !endpoint) return;
  button.disabled = false;
  button.classList.remove('is-pending');
  button.querySelector('small').textContent = '已獲授權';
  button.querySelector('em').textContent = '選用';
  let active=false, serial=0;
  const pickerLabel=document.querySelector('#translation-picker-button strong');
  function selection(enabled) {
    active=enabled;
    pickerLabel.textContent=enabled?'新普及譯本':'和合本2010';
    button.classList.toggle('is-current',enabled);
    original.classList.toggle('is-current',!enabled);
    button.setAttribute('aria-current',String(enabled));
    original.setAttribute('aria-current',String(!enabled));
  }
  const notice=document.createElement('p');notice.className='translation-dialog-note';button.closest('.translation-options').after(notice);
  async function refresh() {
    const date=document.documentElement.dataset.activeDate;
    if (!active || !date) return;
    const version=++serial;
    notice.textContent='正在載入新普及譯本…';
    for (const kind of ['psalm','old','new']) {
      document.getElementById(`${kind}-translation`).textContent='新普及譯本';
      document.getElementById(`${kind}-quote`).replaceChildren();
      document.getElementById(`${kind}-links`).textContent='正在載入經文…';
    }
    try {
      const url=new URL(endpoint);url.searchParams.set('date',date);
      const response=await fetch(url,{cache:'no-store',credentials:'omit'});
      if (!response.ok) throw new Error('unavailable');
      const data=await response.json();
      if (!active || version!==serial || data.date!==document.documentElement.dataset.activeDate) return;
      for (const kind of ['psalm','old','new']) {
        const container=document.getElementById(`${kind}-links`);container.replaceChildren();
        document.getElementById(`${kind}-translation`).textContent='新普及譯本';
        document.getElementById(`${kind}-quote`).replaceChildren();
        for (const passage of data.passages[kind]) {
          const details=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('div');
          details.className='full-scripture';summary.textContent='完整經文 '+passage.label;body.className='full-scripture-text';body.textContent=passage.text;details.append(summary,body);container.append(details);
        }
        const copyright=document.createElement('small');copyright.textContent=data.copyright;container.append(copyright);
      }
      notice.textContent='已選用新普及譯本';
      closeTranslationDialog();
    } catch {
      if (active && version===serial) {
        for (const kind of ['psalm','old','new']) {
          document.getElementById(`${kind}-translation`).textContent='新普及譯本';
          document.getElementById(`${kind}-quote`).replaceChildren();
          document.getElementById(`${kind}-links`).textContent='經文暫時未能載入，請稍後再試。';
        }
        notice.textContent='經文暫時未能載入，請稍後再試。';
      }
    }
  }
  button.addEventListener('click',()=>{selection(true);refresh();});
  original.addEventListener('click',()=>{selection(false);serial++;const day=readings.find(r=>r.date===document.documentElement.dataset.activeDate);if(day) renderDay(day);notice.textContent='';});
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['data-active-date']});
})();
