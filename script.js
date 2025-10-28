(function createStars(){
  const container=document.getElementById('stars');
  container.style.position='fixed';
  container.style.inset='0';
  const count=Math.min(180,Math.round(window.innerWidth/6));
  for(let i=0;i<count;i++){
    const s=document.createElement('div');
    s.className='star';
    const size=Math.random()*2+0.5;
    s.style.width=size+'px';
    s.style.height=size+'px';
    s.style.left=(Math.random()*100)+'vw';
    s.style.top=(Math.random()*100)+'vh';
    s.style.opacity=(0.3+Math.random()*0.7).toFixed(2);
    container.appendChild(s);
  }
})();

function updateCenter(){
  const r=document.getElementById('center').getBoundingClientRect();
  return { cx: r.left + r.width/2, cy: r.top + r.height/2 };
}
let centerInfo = updateCenter();

const orbits = [
  { wrap: document.getElementById('wrap-usd'), r: 270, speed: -0.25, angle: Math.random()*360 },
  { wrap: document.getElementById('wrap-weather'), r: 200, speed: 0.35, angle: Math.random()*360 },
  { wrap: document.getElementById('wrap-hobby'), r: 140, speed: -0.55, angle: Math.random()*360 },
  { wrap: document.getElementById('wrap-profile'), r: 80, speed: 0.9, angle: Math.random()*360 }
];

function placeOrbits(){
  const rect=document.getElementById('center').getBoundingClientRect();
  const cx=rect.width/2, cy=rect.height/2;
  orbits.forEach(o=>{
    const rad=o.angle*Math.PI/180;
    const x=cx+o.r*Math.cos(rad);
    const y=cy+o.r*Math.sin(rad)*0.78;
    o.wrap.style.left=x+'px';
    o.wrap.style.top=y+'px';
  });
}

let last=performance.now();
function tick(t){
  const dt=(t-last)/1000; last=t;
  orbits.forEach(o=>{ o.angle=(o.angle+o.speed*dt*60)%360 });
  placeOrbits();
  requestAnimationFrame(tick);
}
placeOrbits();
requestAnimationFrame(tick);

const orbitLayer=document.getElementById('orbits');
document.addEventListener('mousemove',e=>{
  const rect=document.getElementById('center').getBoundingClientRect();
  const dx=(e.clientX-(rect.left+rect.width/2))/(rect.width/2);
  const dy=(e.clientY-(rect.top+rect.height/2))/(rect.height/2);
  orbitLayer.style.transform=`translate3d(${dx*6}px,${dy*4}px,0)`;
});

const modal=document.getElementById('modal');
const modalClose=document.getElementById('modalClose');
const panelTitle=document.getElementById('panelTitle');
const panelContent=document.getElementById('panelContent');
function openModal(title,html){
  panelTitle.textContent=title;
  panelContent.innerHTML=html;
  modal.classList.add('show');
  modal.setAttribute('aria-hidden','false');
}
function closeModal(){
  modal.classList.remove('show');
  modal.setAttribute('aria-hidden','true');
}
modalClose.addEventListener('click',closeModal);
modal.addEventListener('click',e=>{if(e.target===modal)closeModal();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});

const hobbyHTML = `
<div class="two-col">
  <div class="left-col">
    <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=60" alt="hobby" class="avatar-lg">
  </div>
  <div class="info">
    <p><strong>Sở thích</strong></p>
    <p>
      • Đi shopping và thưởng thức món ngon 🍰<br>
      • Luôn tò mò với mọi thứ xung quanh ✨<br>
      • Vọc code, tìm hiểu về vi điều khiển, nghịch mạch cho vui 💡
    </p>
    <p style="margin-top:6px">
      Mình thích biến ý tưởng nhỏ thành thứ có thể chạm được 🧸
    </p>
  </div>
</div>
`;

const profileHTML = `
<div class="two-col">
  <div class="left-col"><img src="hinh_yen.jpg" alt="Yen" class="avatar-lg"></div>
  <div class="info">
    <p><strong>Phan Thị Hải Yến</strong></p>
    <p>Ngày sinh: 19/10/2004</p>
    <p>SĐT: 0829646049</p>
    <p>SV năm 4 — Vật lý Tin học</p>
    <p style="margin-top:8px;font-style:italic;color:#cfa4b8">
      “I’m not lazy. I’m just on my energy saving mode.”
    </p>
  </div>
</div>
`;

function onPlanetActivate(role){
  if(role==='hobby') openModal('Hobby của Yến', hobbyHTML);
  else if(role==='profile') openModal('Giới thiệu', profileHTML);
  else if(role==='usd'){
    openModal('Tỷ giá USD → VND',`
      <div id="usdRate" style="margin-top:8px;font-size:16px;color:#d8cbd3">Đang tải...</div>
      <button class="btn" id="refreshUsdBtn" style="margin-top:10px">Làm mới</button>
      <div id="usdUpdate" style="margin-top:8px;font-size:13px;color:#bda8b4"></div>
    `);
    fetchUsdRate();
    document.getElementById('refreshUsdBtn').addEventListener('click',fetchUsdRate);
  } else if(role==='weather'){
    openModal('Dự báo thời tiết',`
      <div style="margin-top:6px">
        <div style="font-size:13px;color:#bda8b4">Nhập tên thành phố (vd: Hanoi)</div>
        <div class="input-row">
          <input id="cityModal" placeholder="Nhập thành phố">
          <button class="btn" id="fetchWeatherBtn">Xem</button>
        </div>
        <div id="weatherResult" style="margin-top:12px"></div>
      </div>
    `);
    const cityInput=document.getElementById('cityModal');
    document.getElementById('fetchWeatherBtn').addEventListener('click',()=>fetchWeather(cityInput.value.trim()));
  }
}
document.querySelectorAll('.planet').forEach(p=>{
  p.addEventListener('click',()=>onPlanetActivate(p.dataset.role));
  p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' ')onPlanetActivate(p.dataset.role);});
});

async function fetchUsdRate(){
  const rateEl=document.getElementById('usdRate');
  const footer=document.getElementById('usdUpdate');
  rateEl.textContent='⏳ Đang cập nhật...';
  try{
    const res=await fetch('https://api.exchangerate.host/latest?base=USD&symbols=VND');
    const data=await res.json();
    const rate=data.rates.VND;
    rateEl.textContent=`1 USD = ${rate.toLocaleString('vi-VN')} VND`;
    footer.textContent=`Cập nhật: ${new Date().toLocaleString('vi-VN')} | API: exchangerate.host`;
  }catch(e){
    rateEl.textContent='⚠️ Lỗi khi tải dữ liệu.';
  }
}

async function fetchWeather(city){
  const resEl=document.getElementById('weatherResult');
  if(!city){resEl.textContent='Vui lòng nhập tên thành phố';return;}
  resEl.textContent='⏳ Đang tải dữ liệu...';
  try{
    const geo=await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=vi`).then(r=>r.json());
    if(!geo.results){resEl.textContent='❌ Không tìm thấy';return;}
    const {latitude,longitude,name,country}=geo.results[0];
    const url=`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const w=await fetch(url).then(r=>r.json());
    const curr=w.current_weather;
    const descMap={
      0:['☀️ Trời quang'],1:['🌤️ Có mây nhẹ'],2:['⛅ Nhiều mây'],3:['☁️ U ám'],
      61:['🌧️ Mưa nhẹ'],63:['🌧️ Mưa vừa'],65:['🌧️ Mưa to'],80:['🌦️ Mưa rào'],95:['⛈️ Dông']
    };
    const curDesc=descMap[curr.weathercode]||['🌤️ Không rõ'];
    let html=`<b style="color:#ffd7e6">${name}, ${country}</b><br>${curDesc[0]} — ${curr.temperature}°C<hr>`;
    const times=w.daily.time,mins=w.daily.temperature_2m_min,maxs=w.daily.temperature_2m_max,codes=w.daily.weathercode;
    html+='<table><tr><th>Ngày</th><th>Trạng thái</th><th>Nhiệt độ</th></tr>';
    for(let i=0;i<3;i++){
      const date=new Date(times[i]).toLocaleDateString('vi-VN',{weekday:'short',day:'2-digit',month:'2-digit'});
      const d=descMap[codes[i]]||['🌤️'];
      html+=`<tr><td>${date}</td><td>${d[0]}</td><td>${mins[i]}° / ${maxs[i]}°</td></tr>`;
    }
    html+='</table>';
    resEl.innerHTML=html;
  }catch{
    resEl.textContent='⚠️ Lỗi tải dữ liệu';
  }
}

window.addEventListener('resize',()=>{centerInfo=updateCenter();placeOrbits();});
setTimeout(()=>{
  const tip=document.createElement('div');
  tip.textContent='Click vào hành tinh để xem nội dung';
  tip.style.position='absolute';
  tip.style.bottom='8%';
  tip.style.left='50%';
  tip.style.transform='translateX(-50%)';
  tip.style.color='#d6b6c7';
  document.body.appendChild(tip);
  setTimeout(()=>tip.remove(),6000);
},1000);
