/* ---------- Navigasi ---------- */
const semuaSection = document.querySelectorAll('main > section');
const tombolMenu = document.querySelectorAll('#menu button');

function tampilkan(id){
  semuaSection.forEach(s => s.classList.toggle('tampil', s.id === id));
  tombolMenu.forEach(b => b.classList.toggle('aktif', b.dataset.tujuan === id));
  window.scrollTo({top:0, behavior:'smooth'});
  updateProgress(id);
  if(id === 'kuis' && !kuisSudahMulai) mulaiKuis();
  if(id === 'model3d' && window.initModel3D){ window.initModel3D(); if(window.m3resize) window.m3resize(); }
}
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tujuan]');
  if(t) tampilkan(t.dataset.tujuan);
});

/* ---------- Tab penyakit ---------- */
document.getElementById('tabPenyakit').addEventListener('click', e => {
  const b = e.target.closest('button[data-panel]');
  if(!b) return;
  document.querySelectorAll('#tabPenyakit button').forEach(x => x.classList.toggle('aktif', x === b));
  document.querySelectorAll('.panel').forEach(p => p.classList.toggle('tampil', p.id === b.dataset.panel));
});

/* ---------- Progres, tema, papan ketik ---------- */
const URUTAN=['awal','sistem','sadar','refleks','penyakit','model3d','kuis'];
function updateProgress(id){
  const i=Math.max(0,URUTAN.indexOf(id));
  document.querySelector('#progres div').style.width=((i+1)/URUTAN.length*100)+'%';
}
updateProgress('awal');
function bagianAktif(){const s=document.querySelector('main > section.tampil');return s?s.id:'awal';}
document.addEventListener('keydown',e=>{
  if(e.target.closest('input,textarea,[role=button]'))return;
  const i=URUTAN.indexOf(bagianAktif());
  if(e.key==='ArrowRight'&&i<URUTAN.length-1)tampilkan(URUTAN[i+1]);
  if(e.key==='ArrowLeft'&&i>0)tampilkan(URUTAN[i-1]);
});
const tombolTema=document.getElementById('tema');
function setTema(g){document.body.classList.toggle('gelap',g);tombolTema.textContent=g?'Mode terang':'Mode gelap';try{localStorage.setItem('temaGelap',g?'1':'0');}catch(e){}}
tombolTema.addEventListener('click',()=>setTema(!document.body.classList.contains('gelap')));
try{if(localStorage.getItem('temaGelap')==='1')setTema(true);}catch(e){}

/* ---------- Fakta menarik ---------- */
const FAKTA=[
 'Tubuh manusia dewasa memiliki 206 tulang, tetapi bayi lahir dengan sekitar 300 tulang yang sebagian akan menyatu.',
 'Otot terbesar adalah otot gluteus maximus (pantat), sedangkan otot terkecil ada di telinga tengah.',
 'Tulang paha (femur) adalah tulang terpanjang dan terkuat di tubuh manusia.',
 'Saraf skiatik adalah saraf terpanjang di tubuh, membentang dari punggung bawah sampai kaki.',
 'Impuls saraf dapat merambat hingga lebih dari 100 meter per detik pada saraf bermielin.',
 'Hanya dengan tersenyum, kamu menggunakan belasan otot wajah.',
 'Tulang bersifat hidup: terus dibentuk ulang, dan kebanyakan tulang dewasa diperbarui sepenuhnya dalam sekitar 10 tahun.'
];
let faktaI=Math.floor(Math.random()*FAKTA.length);
function tampilFakta(){document.getElementById('faktaTeks').textContent=FAKTA[faktaI];}
document.getElementById('faktaBtn').addEventListener('click',()=>{faktaI=(faktaI+1)%FAKTA.length;tampilFakta();});
tampilFakta();

/* ---------- Kartu istilah ---------- */
const ISTILAH=[
 ['Tendon','Jaringan ikat kuat yang menghubungkan otot dengan tulang.'],
 ['Ligamen','Jaringan ikat yang menghubungkan tulang dengan tulang pada sendi.'],
 ['Tulang rawan','Lapisan lentur di ujung tulang yang mengurangi gesekan.'],
 ['Cairan sinovial','Cairan pelumas di dalam rongga sendi.'],
 ['Kontraksi','Otot memendek dan menegang sehingga menghasilkan gerak.'],
 ['Antagonis','Pasangan otot yang bekerja berlawanan, misalnya biseps dan triseps.']
];
const kg=document.getElementById('kartuGrid');
ISTILAH.forEach(([t,d])=>{
  const b=document.createElement('button');b.className='kartu';b.type='button';
  b.innerHTML='<div class="kartu-dalam"><div class="sisi depan">'+t+'</div><div class="sisi belakang">'+d+'</div></div>';
  b.addEventListener('click',()=>b.classList.toggle('balik'));
  kg.appendChild(b);
});

/* ---------- Simulasi refleks vs gerak sadar ---------- */
const LANGKAH={
  simRefleks:['Rangsang panas','Reseptor kulit','Saraf sensorik','Sumsum tulang belakang','Saraf motorik','Otot menarik tangan'],
  simSadar:['Rangsang panas','Reseptor kulit','Saraf sensorik','Otak (menyadari dan memutuskan)','Saraf motorik','Otot menarik tangan']
};
Object.keys(LANGKAH).forEach(id=>{
  const w=document.getElementById(id);
  w.innerHTML=LANGKAH[id].map((t,i)=>(i?'<i>›</i>':'')+'<span>'+t+'</span>').join('');
});
let simTimer=null;
function jalankan(id,jeda,pesan){
  clearInterval(simTimer);
  document.querySelectorAll('#simRefleks span,#simSadar span').forEach(x=>x.classList.remove('nyala'));
  const sp=document.querySelectorAll('#'+id+' span');let n=0;
  document.getElementById('simInfo').textContent='';
  simTimer=setInterval(()=>{
    if(n>0)sp[n-1].classList.remove('nyala');
    if(n<sp.length){sp[n].classList.add('nyala');n++;}
    else{clearInterval(simTimer);sp[sp.length-1].classList.add('nyala');document.getElementById('simInfo').textContent=pesan;}
  },jeda);
}
document.getElementById('jalanRefleks').addEventListener('click',()=>jalankan('simRefleks',260,'Refleks selesai cepat: impuls hanya diproses di sumsum tulang belakang, tanpa menunggu otak.'));
document.getElementById('jalanSadar').addEventListener('click',()=>jalankan('simSadar',620,'Gerak sadar lebih lambat: impuls naik ke otak, diproses, lalu perintah dikirim kembali.'));

/* ---------- Uji waktu reaksi ---------- */
(function(){
  const box=document.getElementById('rtBox'),out=document.getElementById('rtOut');
  let state='idle',t0=0,timer=null;const hasil=[];
  function aksi(){
    if(state==='idle'){
      state='wait';box.className='rt tunggu';box.textContent='Tunggu sampai hijau...';
      timer=setTimeout(()=>{state='go';box.className='rt go';box.textContent='KLIK SEKARANG!';t0=performance.now();},1500+Math.random()*2500);
    }else if(state==='wait'){
      clearTimeout(timer);state='idle';box.className='rt';box.textContent='Terlalu cepat! Klik untuk mencoba lagi.';
    }else if(state==='go'){
      const ms=Math.round(performance.now()-t0);hasil.push(ms);state='idle';box.className='rt';box.textContent=ms+' ms. Klik untuk mengulang.';
      const rata=Math.round(hasil.reduce((a,b)=>a+b,0)/hasil.length),terbaik=Math.min(...hasil);
      out.innerHTML='Percobaan: '+hasil.length+' &nbsp; Rata-rata: <b>'+rata+' ms</b> &nbsp; Terbaik: <b>'+terbaik+' ms</b>';
    }
  }
  box.addEventListener('click',aksi);
  box.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();aksi();}});
})();

/* ---------- Kuis ---------- */
const soal = [
  {q:"Alat gerak pasif pada manusia adalah ...", o:["Otot","Tulang","Saraf","Kulit"], a:1, p:"Tulang disebut alat gerak pasif karena hanya digerakkan oleh otot."},
  {q:"Otot yang bekerja di bawah kesadaran dan berbentuk lurik adalah ...", o:["Otot polos","Otot jantung","Otot rangka","Otot lambung"], a:2, p:"Otot rangka (lurik) bekerja sesuai kehendak kita."},
  {q:"Bagian sendi yang berfungsi sebagai pelumas adalah ...", o:["Cairan sinovial","Tulang rawan","Kapsul sendi","Sumsum tulang"], a:0, p:"Cairan sinovial mengurangi gesekan antartulang pada sendi."},
  {q:"Pusat pengendali gerak sadar adalah ...", o:["Sumsum tulang belakang","Otak","Jantung","Otot"], a:1, p:"Gerak sadar diperintah oleh otak, terutama lobus frontal."},
  {q:"Bagian otak yang mengatur keseimbangan dan koordinasi gerak adalah ...", o:["Lobus oksipital","Lobus temporal","Otak kecil","Pons"], a:2, p:"Otak kecil (cerebellum) mengatur keseimbangan dan koordinasi."},
  {q:"Contoh gerak refleks adalah ...", o:["Menulis surat","Menendang bola","Menarik tangan saat menyentuh benda panas","Berjalan ke sekolah"], a:2, p:"Menarik tangan dari benda panas terjadi cepat tanpa dipikirkan."},
  {q:"Urutan jalur gerak refleks yang benar adalah ...", o:["Rangsang, reseptor, saraf sensorik, sumsum tulang belakang, saraf motorik, efektor","Rangsang, otak, reseptor, efektor","Reseptor, otot, saraf motorik, otak","Rangsang, saraf motorik, sumsum tulang belakang, reseptor"], a:0, p:"Impuls cukup diproses di sumsum tulang belakang."},
  {q:"Tulang belakang yang melengkung ke samping membentuk huruf C atau S disebut ...", o:["Kifosis","Osteoporosis","Skoliosis","Parkinson"], a:2, p:"Itulah ciri skoliosis."},
  {q:"Penyakit yang membuat tulang menjadi berongga dan mudah patah adalah ...", o:["Osteoporosis","Skoliosis","ALS","Kifosis"], a:0, p:"Osteoporosis adalah berkurangnya kepadatan tulang."},
  {q:"Kerusakan sel saraf motorik yang menyebabkan otot mengecil dan melemah disebut ...", o:["Kifosis","Skoliosis","ALS","Osteoporosis"], a:2, p:"Pada ALS, otot tidak menerima perintah dari saraf sehingga mengecil."},
  {q:"Jaringan ikat yang menghubungkan otot dengan tulang disebut ...", o:["Ligamen","Tendon","Tulang rawan","Kapsul sendi"], a:1, p:"Tendon menghubungkan otot ke tulang, sedangkan ligamen menghubungkan tulang ke tulang."},
  {q:"Pasangan otot yang bekerja berlawanan, seperti biseps dan triseps, disebut otot ...", o:["Sinergis","Antagonis","Polos","Jantung"], a:1, p:"Saat biseps berkontraksi, triseps berelaksasi, dan sebaliknya."}
];
let kuisSudahMulai=false, daftar=[], idx=0, skor=0, terjawab=false, salahList=[], detik=0, jam=null;
const area=document.getElementById('kuisArea');
const acak=a=>{a=a.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const fmt=d=>Math.floor(d/60)+':'+String(d%60).padStart(2,'0');

function mulaiKuis(){
  kuisSudahMulai=true;idx=0;skor=0;terjawab=false;salahList=[];detik=0;
  daftar=acak(soal).map(s=>({q:s.q,p:s.p,o:acak(s.o.map((t,i)=>({t:t,ok:i===s.a})))}));
  clearInterval(jam);
  jam=setInterval(()=>{detik++;const w=document.getElementById('waktu');if(w)w.textContent='Waktu '+fmt(detik);},1000);
  tampilSoal();
}
function tampilSoal(){
  const s=daftar[idx];terjawab=false;
  area.innerHTML=`
    <p class="waktu"><b>Soal ${idx+1} dari ${daftar.length}</b> &nbsp; Benar: ${skor} &nbsp; <span id="waktu">Waktu ${fmt(detik)}</span></p>
    <div class="bar"><div style="width:${(idx/daftar.length)*100}%"></div></div>
    <div class="card">
      <h3 style="margin-top:0">${s.q}</h3>
      ${s.o.map((x,i)=>`<button class="opsi" data-i="${i}">${String.fromCharCode(65+i)}. ${x.t}</button>`).join('')}
      <div class="umpan" id="umpan"></div>
    </div>
    <button class="btn" id="btnLanjut" style="display:none">${idx===daftar.length-1?'Lihat hasil':'Soal berikutnya'}</button>`;
  area.querySelectorAll('.opsi').forEach(b=>b.addEventListener('click',()=>jawab(+b.dataset.i)));
  document.getElementById('btnLanjut').addEventListener('click',()=>{idx++;idx<daftar.length?tampilSoal():tampilHasil();});
}
function jawab(i){
  if(terjawab)return;terjawab=true;
  const s=daftar[idx];
  area.querySelectorAll('.opsi').forEach((b,k)=>{
    b.disabled=true;
    if(s.o[k].ok)b.classList.add('benar');
    if(k===i&&!s.o[k].ok)b.classList.add('salah');
  });
  const benar=s.o[i].ok;
  if(benar)skor++;else salahList.push({q:s.q,jawab:s.o[i].t,benar:s.o.find(x=>x.ok).t,p:s.p});
  const u=document.getElementById('umpan');u.style.display='block';
  u.innerHTML=(benar?'<b>Benar.</b> ':'<b>Belum tepat.</b> ')+s.p;
  document.getElementById('btnLanjut').style.display='inline-block';
}
function tampilHasil(){
  clearInterval(jam);
  const nilai=Math.round(skor/daftar.length*100);
  let terbaik=nilai;
  try{const lama=+localStorage.getItem('skorTerbaik')||0;terbaik=Math.max(lama,nilai);localStorage.setItem('skorTerbaik',terbaik);}catch(e){}
  const pesan=nilai>=80?'Bagus sekali, kamu menguasai materi ini.':nilai>=60?'Cukup baik. Ulangi materi yang masih kurang.':'Pelajari materinya sekali lagi, lalu coba kuis ini lagi.';
  const tinjau=salahList.length?`<div class="tinjau"><h3>Soal yang perlu diulang</h3><ul>${salahList.map(x=>`<li><b>${x.q}</b><br>Jawabanmu: ${x.jawab}<br>Yang benar: <b>${x.benar}</b>. ${x.p}</li>`).join('')}</ul></div>`:'<p style="margin-top:12px">Semua jawabanmu benar.</p>';
  area.innerHTML=`
    <div class="card" style="text-align:center">
      <p>Skor akhir kamu</p>
      <div class="skor">${nilai}</div>
      <p style="margin:0 auto 6px">${skor} benar dari ${daftar.length} soal dalam ${fmt(detik)}. ${pesan}</p>
      <p class="waktu" style="margin:0 auto 14px">Skor terbaikmu: ${terbaik}</p>
      <button class="btn" id="ulang">Ulangi kuis</button>
      <button class="btn alt" data-tujuan="awal">Kembali ke awal</button>
    </div>${tinjau}`;
  document.getElementById('ulang').addEventListener('click',mulaiKuis);
}