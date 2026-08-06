// ================= CHART GLOBAL =================
let chartInstance = null;

// ================= AUTO ACTION STATE =================
let lastActionPerUnit = {};
let lastStatusPerUnit = {};

// ================= PARAMETER MAP =================
const parameterMap = {
  pra:[
    {name:"Turbidity", col:1},
    {name:"EC",        col:2},
    {name:"Temp",      col:3},
    {name:"TDS",       col:4}
  ],
  reservoir:[
    {name:"Turbidity", col:1},
    {name:"pH",        col:2},
    {name:"Temp",      col:3}
  ],
  clearwell:[
    {name:"TDS",       col:1},
    {name:"Turbidity", col:2},
    {name:"EC",        col:3}
  ],
  sed1:[
    {name:"Turbidity", col:1},
    {name:"Temp",      col:2},
    {name:"EC",        col:3},
    {name:"pH",        col:4}
  ],
  sed2:[
    {name:"Turbidity", col:1},
    {name:"Temp",      col:2},
    {name:"EC",        col:3},
    {name:"pH",        col:4}
  ]
};

// ================= URUTAN PARAMETER PER TABEL =================
const colParams = {
  pra:       ["Turbidity","EC","Temp","TDS"],
  reservoir: ["Turbidity","pH","Temp"],
  clearwell: ["TDS","Turbidity","EC"],
  sed1:      ["Turbidity","Temp","EC","pH"],
  sed2:      ["Turbidity","Temp","EC","pH"],
  filter:    ["WaterLevel","Temp"]
};

// ================= THRESHOLD PARAMETER =================
const paramThresholds = {
  pra: {
    Turbidity: {waspada:31,   kritis:40},
    TDS:       {waspada:501,  kritis:600},
    Temp:      {waspada:28.5, kritis:30}
  },
  reservoir: {
    Turbidity: {waspada:2.6,  kritis:3},
    pH:        {waspada:8.5,  kritis:9},
    Temp:      {waspada:28.5, kritis:30}
  },
  clearwell: {
    Turbidity: {waspada:2.6,  kritis:3},
    TDS:       {waspada:251,  kritis:270},
    Temp:      {waspada:28.5, kritis:30}
  },
  sed1: {
    Turbidity: {waspada:2.6,  kritis:3},
    pH:        {waspada:8.5,  kritis:9},
    Temp:      {waspada:28.5, kritis:30}
  },
  sed2: {
    Turbidity: {waspada:2.6,  kritis:3},
    pH:        {waspada:8.5,  kritis:9},
    Temp:      {waspada:28.5, kritis:30}
  },
  filter: {
    Temp: {waspada:28.5, kritis:30}
  }
};

function paramClass(unit, paramName, value){
  if(value===null||value===undefined||value==="-") return "";
  const v = parseFloat(value);
  if(isNaN(v)) return "";
  const t = paramThresholds[unit]&&paramThresholds[unit][paramName];
  if(!t) return "";
  if(v>=t.kritis)  return "critical";
  if(v>=t.waspada) return "warning";
  return "normal";
}

// ================= PENYEBAB KEJADIAN (dari dokumen RPAM) =================
const penyebabMap = {
  pra: {
    Turbidity: [
      "-- Pilih Penyebab --",
      "Masuknya air baku dengan kandungan padatan tersuspensi tinggi akibat hujan atau erosi",
      "Sampah organik (daun) jatuh dari pohon sekitar unit prasedimentasi",
      "Grey water dari aktivitas mencuci yang masuk ke saluran inlet",
      "Kontaminasi fisik akibat kerusakan struktur bangunan prasedimentasi"
    ],
    TDS: [
      "-- Pilih Penyebab --",
      "Masuknya air baku dengan kandungan ion terlarut tinggi pada musim kemarau",
      "Kontaminasi kimia (surfaktan) akibat masuknya grey water",
      "Kontaminasi kimia senyawa organik dari kotoran ikan yang lolos dari bar screen"
    ],
    Temp: [
      "-- Pilih Penyebab --",
      "Intensitas radiasi matahari tinggi dan waktu tinggal air terlalu lama",
      "Suhu lingkungan sekitar unit prasedimentasi meningkat"
    ],
    pH: [
      "-- Pilih Penyebab --",
      "Kontaminasi kimia (surfaktan) akibat masuknya grey water dari aktivitas mencuci",
      "Masuknya bahan organik alami (NOM) dari limpasan daerah tangkapan air",
      "Masuknya zat organik berwarna (CDOM) ke unit prasedimentasi"
    ]
  },
  sed1: {
    Turbidity: [
      "-- Pilih Penyebab --",
      "Terbentuknya mikroflok ketika dosis koagulan tidak optimum (22,75 mg/L)",
      "Panjang tube settler tidak sesuai untuk mengolah debit air melebihi 50 lps",
      "Aliran turbulen di outlet sedimentasi sehingga partikel tercampur kembali",
      "Bak sedimentasi berlumut akibat terkena paparan sinar matahari"
    ],
    pH: [
      "-- Pilih Penyebab --",
      "Senyawa organik tidak tersisihkan ketika dosis koagulan kurang dari dosis optimum",
      "Senyawa organik tidak tersisihkan ketika dosis koagulan lebih dari dosis optimum",
      "Senyawa fulvik tidak tersisihkan dengan baik oleh dosis koagulan yang tidak optimum",
      "Bak pengumpul mengalami korosi"
    ],
    Temp: [
      "-- Pilih Penyebab --",
      "Paparan sinar matahari pada unit sebelumnya dan waktu tinggal air terlalu lama",
      "Penurunan efisiensi pengendapan menyebabkan waktu tinggal air lebih lama"
    ],
    EC: [
      "-- Pilih Penyebab --",
      "Masuknya air baku dengan kandungan ion terlarut tinggi pada musim kemarau"
    ]
  },
  sed2: {
    Turbidity: [
      "-- Pilih Penyebab --",
      "Terbentuknya mikroflok ketika dosis koagulan tidak optimum (22,75 mg/L)",
      "Panjang tube settler tidak sesuai untuk mengolah debit air melebihi 50 lps",
      "Aliran turbulen di outlet sedimentasi sehingga partikel tercampur kembali",
      "Bak sedimentasi berlumut akibat terkena paparan sinar matahari"
    ],
    pH: [
      "-- Pilih Penyebab --",
      "Senyawa organik tidak tersisihkan ketika dosis koagulan kurang dari dosis optimum",
      "Senyawa organik tidak tersisihkan ketika dosis koagulan lebih dari dosis optimum",
      "Senyawa fulvik tidak tersisihkan dengan baik oleh dosis koagulan yang tidak optimum",
      "Bak pengumpul mengalami korosi"
    ],
    Temp: [
      "-- Pilih Penyebab --",
      "Paparan sinar matahari pada unit sebelumnya dan waktu tinggal air terlalu lama",
      "Penurunan efisiensi pengendapan menyebabkan waktu tinggal air lebih lama"
    ],
    EC: [
      "-- Pilih Penyebab --",
      "Masuknya air baku dengan kandungan ion terlarut tinggi pada musim kemarau"
    ]
  },
  clearwell: {
    Turbidity: [
      "-- Pilih Penyebab --",
      "Terdapat celah pada penutup clearwell sehingga partikel masuk",
      "Manhole clearwell tidak tertutup dengan rapat"
    ],
    TDS: [
      "-- Pilih Penyebab --",
      "Meningkatnya konsentrasi ion terlarut pada air",
      "Bahan organik terlarut masih lolos dari proses filtrasi"
    ],
    Temp: [
      "-- Pilih Penyebab --",
      "Waktu tinggal (detention time) air terlalu lama",
      "Ventilasi ruang kurang baik atau suhu lingkungan ruang meningkat"
    ],
    pH: [
      "-- Pilih Penyebab --",
      "Ketidaksesuaian dosis bahan kimia atau pencampuran air dengan karakteristik berbeda"
    ]
  },
  reservoir: {
    Turbidity: [
      "-- Pilih Penyebab --",
      "Adanya endapan lumpur akibat tidak adanya pemeliharaan reservoir",
      "Endapan pada dasar reservoir teraduk akibat fluktuasi debit",
      "Masuknya partikel dari lingkungan akibat kebocoran atau penutup tidak rapat"
    ],
    pH: [
      "-- Pilih Penyebab --",
      "Perubahan kualitas air akibat reaksi dengan material reservoir",
      "Kontaminasi dari luar akibat kebocoran atau penutup tidak rapat"
    ],
    Temp: [
      "-- Pilih Penyebab --",
      "Paparan sinar matahari secara langsung",
      "Suhu lingkungan yang tinggi di sekitar unit reservoir"
    ],
    EC: [
      "-- Pilih Penyebab --",
      "Perubahan kualitas air selama penyimpanan di reservoir",
      "Meningkatnya konsentrasi ion terlarut karena kontaminasi"
    ]
  },
  filter: {
    Temp: [
      "-- Pilih Penyebab --",
      "Waktu tinggal air yang lama di unit filtrasi",
      "Paparan sinar matahari pada unit filtrasi"
    ]
  }
};

function getPenyebabOptions(unit, params, values, status){
  if(status === "Normal") return "-";
  // Kumpulkan parameter yang melewati batas
  let paramsTrigger = [];
  let unitParams = colParams[unit] || [];
  unitParams.forEach((pname, i) => {
    let v = parseFloat(values[i]);
    let t = paramThresholds[unit] && paramThresholds[unit][pname];
    if(t && !isNaN(v)){
      if(v >= t.waspada) paramsTrigger.push(pname);
    }
  });
  if(paramsTrigger.length === 0) paramsTrigger = unitParams;

  // Kumpulkan semua penyebab dari parameter yang trigger
  let allOptions = new Set(["-- Pilih Penyebab --"]);
  paramsTrigger.forEach(p => {
    let opts = penyebabMap[unit] && penyebabMap[unit][p];
    if(opts) opts.forEach(o => { if(o !== "-- Pilih Penyebab --") allOptions.add(o); });
  });

  if(allOptions.size <= 1) return "-";
  let opts = Array.from(allOptions).map(o => `<option>${o}</option>`).join("");
  return `<select onchange="savePenyebab(this,'${unit}','${status}')">${opts}</select>`;
}

function savePenyebab(sel, unit, status){
  let val = sel.value;
  if(!val || val === "-- Pilih Penyebab --") return;
  let row = sel.closest("tr");
  sel.outerHTML = `<span>${val}</span>`;
  saveToHistory(unit, status, val, "-");
}

// ================= LIMIT ROWS =================
function limitRows(id){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  while(tb.rows.length > 20) tb.deleteRow(tb.rows.length-1);
}

// ================= MODE =================
let dummyMode = false;

// ================= TABLE TEMPLATES =================
function tableTemplate(id, headers){
  return `
  <div id="${id}" class="tab-content ${id==='pra'?'active':''}">
    <table>
      <thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
      <tbody id="${id}-body"></tbody>
    </table>
  </div>`;
}

document.getElementById("tables").innerHTML =
  tableTemplate("pra",      ["Waktu","Turbidity","EC","Temp","TDS","Status","Penyebab Kejadian","Catatan Operator"]) +
  tableTemplate("reservoir",["Waktu","Turbidity","pH","Temp","Status","Penyebab Kejadian","Catatan Operator"]) +
  tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Penyebab Kejadian","Catatan Operator"]) +
  tableTemplate("sed1",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan Operator"]) +
  tableTemplate("sed2",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan Operator"]) +
  `<div id="filter" class="tab-content">
    <div class="filter-wrapper">
      ${[1,2,3,4,5].map(n=>`
      <div class="filter-box">
        <h4>Filter ${n}</h4>
        <table>
          <thead><tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Penyebab Kejadian</th></tr></thead>
          <tbody id="filter${n}-body"></tbody>
        </table>
      </div>`).join("")}
    </div>
  </div>`;

// ================= TAB =================
function openTab(evt, tabName){
  document.querySelectorAll(".tab-content").forEach(tab=>tab.style.display="none");
  document.querySelectorAll(".tab").forEach(btn=>btn.classList.remove("active"));
  let sel = document.getElementById(tabName);
  if(sel) sel.style.display="block";
  evt.currentTarget.classList.add("active");
}

// ================= CLOCK =================
function updateClock(){
  let now = new Date();
  document.getElementById("clock").innerText =
    now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    +" - "+now.toLocaleTimeString('id-ID');
}
setInterval(updateClock,1000);
updateClock();

// ================= STATUS CLASS =================
function statusClass(s){ return s==="Normal"?"normal":s==="Waspada"?"warning":"critical"; }

// ================= AUDIO ALARM =================
let audioContext = null;
function initAudio(){
  if(!audioContext) audioContext = new(window.AudioContext||window.webkitAudioContext)();
}
function playBeep(duration,frequency){
  if(!audioContext) return;
  let osc=audioContext.createOscillator();
  let gain=audioContext.createGain();
  osc.connect(gain); gain.connect(audioContext.destination);
  osc.frequency.value=frequency; osc.start();
  gain.gain.setValueAtTime(1,audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+duration);
  osc.stop(audioContext.currentTime+duration);
}
function triggerAlarm(status){
  if(status==="Waspada") playBeep(0.3,600);
  if(status==="Kritis"){ playBeep(0.5,900); setTimeout(()=>playBeep(0.5,900),600); }
}

// ================= ADD ROW =================
function addRow(id, values, status, waktu=null){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  let tr = tb.insertRow(0);

  if(!waktu){
    waktu = new Date().toLocaleTimeString('id-ID');
    saveMonitoringData(id, values, status);
  }

  // Auto-fill catatan operator
  let sameStatusCount = 0;
  for(let i=0;i<tb.rows.length;i++){
    let rs = tb.rows[i].cells[tb.rows[i].cells.length-3]?.innerText;
    if(rs===status) sameStatusCount++;
  }

  let catatanButton = "-";
  if(status==="Waspada"||status==="Kritis"){
    if(lastActionPerUnit[id]&&lastStatusPerUnit[id]===status){
      catatanButton = lastActionPerUnit[id];
    } else if(sameStatusCount>=1){
      let existing = null;
      for(let i=0;i<tb.rows.length;i++){
        let row=tb.rows[i];
        let rs=row.cells[row.cells.length-3]?.innerText;
        let ac=row.cells[row.cells.length-1];
        if(rs===status&&ac&&!ac.innerHTML.includes("button")&&ac.innerText.trim()!=="-"&&ac.innerText.trim()!==""){
          existing=ac.innerText.trim(); break;
        }
      }
      if(existing){
        catatanButton=existing;
        lastActionPerUnit[id]=existing;
        lastStatusPerUnit[id]=status;
      } else {
        catatanButton=`<button onclick="openForm(this,'${id}','${status}')">Isi Catatan</button>`;
      }
    } else {
      catatanButton=`<button onclick="openForm(this,'${id}','${status}')">Isi Catatan</button>`;
    }
  }

  if(status==="Normal"){ lastActionPerUnit[id]=null; lastStatusPerUnit[id]=null; }

  // Warna sel parameter
  let params = colParams[id]||[];
  let valHtml = values.map((v,i)=>{
    let cls = paramClass(id, params[i], v);
    return `<td class="${cls}">${v??"-"}</td>`;
  }).join("");

  // Penyebab kejadian dropdown
  let penyebab = getPenyebabOptions(id, params, values, status);

  tr.innerHTML = `<td>${waktu}</td>`+valHtml+
    `<td class="${statusClass(status)}">${status}</td>`+
    `<td>${penyebab}</td>`+
    `<td>${catatanButton}</td>`;

  limitRows(id);

  let sumId=null;
  if(id==="pra") sumId="sum-pra";
  else if(id==="reservoir") sumId="sum-res";
  else if(id==="clearwell") sumId="sum-clear";
  else if(id==="sed1") sumId="sum-sed1";
  else if(id==="sed2") sumId="sum-sed2";

  if(sumId){
    let labelMap={pra:"PRA-SED",reservoir:"RESERVOIR",clearwell:"CLEARWELL",sed1:"SED-1",sed2:"SED-2"};
    document.getElementById(sumId).className="summary-box "+statusClass(status);
    document.getElementById(sumId).innerText=(labelMap[id]||id.toUpperCase())+" : "+status;
    triggerAlarm(status);
  }
}

// ================= ADD FILTER ROW =================
function addFilterRow(id, values, status){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  let tr = tb.insertRow(0);
  let waktu = new Date().toLocaleTimeString('id-ID');

  let params = colParams.filter;
  let valHtml = values.map((v,i)=>{
    let cls = paramClass("filter", params[i], v);
    return `<td class="${cls}">${v??"-"}</td>`;
  }).join("");

  let penyebab = "-";
  if(status!=="Normal"){
    let opts = penyebabMap.filter&&penyebabMap.filter.Temp
      ? penyebabMap.filter.Temp.map(o=>`<option>${o}</option>`).join("")
      : "";
    penyebab = opts ? `<select>${opts}</select>` : "-";
  }

  tr.innerHTML = `<td>${waktu}</td>`+valHtml+
    `<td class="${statusClass(status)}">${status}</td>`+
    `<td>${penyebab}</td>`;
  if(tb.rows.length>20) tb.deleteRow(20);

  let n = id.replace("filter","");
  let sumEl = document.getElementById("sum-filter"+n);
  if(sumEl){
    sumEl.className="summary-box "+statusClass(status);
    sumEl.innerText="Filter "+n+" : "+status;
    triggerAlarm(status);
  }
}

// ================= GOOGLE SHEET =================
const sheetURL = "https://opensheet.elk.sh/14i8S-08Yg3Vn_WFA6Ny_4uJ2stTzL9rvrTP0Qt0bCmQ/Sheet1";

// ================= STATUS LOGIC =================
function getStatusPra(turb,tds,ph,temp){
  let s="Normal";
  if(turb>=40) return "Kritis"; if(turb>=31) s="Waspada";
  if(tds>=600) return "Kritis"; if(tds>=501) s="Waspada";
  if(ph>=9)    return "Kritis"; if(ph>=8.5)  s="Waspada";
  if(temp>=30) return "Kritis"; if(temp>=28.5) s="Waspada";
  return s;
}
function getStatusSedimentasi(turb,tds,ph,temp){
  let s="Normal";
  if(turb>=3)   return "Kritis"; if(turb>=2.6) s="Waspada";
  if(tds>=270)  return "Kritis"; if(tds>=251)  s="Waspada";
  if(ph>=9)     return "Kritis"; if(ph>=8.5)   s="Waspada";
  if(temp>=30)  return "Kritis"; if(temp>=28.5) s="Waspada";
  return s;
}
function getStatusReservoir(turb,tds,ph,temp){ return getStatusSedimentasi(turb,tds,ph,temp); }
function getStatusClearwell(turb,tds,ph,temp){ return getStatusSedimentasi(turb,tds,ph,temp); }
function getStatusFilter(temp){
  if(temp>=30)   return "Kritis";
  if(temp>=28.5) return "Waspada";
  return "Normal";
}

// ================= LOAD REAL DATA =================
let lastFetchedWaktu = null;
async function loadRealData(){
  if(dummyMode) return;
  try{
    const res  = await fetch(sheetURL);
    const data = await res.json();
    if(data.length<1) return;
    let last = data[data.length-1];
    let waktuBaru = (last["Waktu"]||last["waktu"]||"").toString().trim();
    if(waktuBaru && waktuBaru===lastFetchedWaktu) return;
    lastFetchedWaktu = waktuBaru;

    function val(...keys){
      for(let k of keys){
        if(last[k]!==undefined&&last[k]!=="") return parseFloat(last[k])||0;
      }
      return 0;
    }

    let turbPra=val("Pra-Sed_Turbid"), ecPra=val("Pra-Sed_EC"), tempPra=val("Pra-Sed_Temp"), tdsPra=val("Pra-Sed_TDS");
    addRow("pra",[turbPra,ecPra,tempPra,tdsPra], getStatusPra(turbPra,tdsPra,7,tempPra));

    let turbRes=val("Reservoir_Turbid"), tempRes=val("Reservoir_Temp"), phRes=val("Reservoir_Ph");
    addRow("reservoir",[turbRes,phRes,tempRes], getStatusReservoir(turbRes,0,phRes,tempRes));

    let turbSed=val("Sedimen_Turbid","Sedimen _Turbid"), ecSed=val("Sedimen_EC","Sedimen _EC"),
        tempSed=val("Sedimen_Temp","Sedimen _Temp"), phSed=val("Sedimen_ph","Sedimen _ph");
    let stSed=getStatusSedimentasi(turbSed,0,phSed,tempSed);
    addRow("sed1",[turbSed,tempSed,ecSed,phSed],stSed);
    addRow("sed2",[turbSed,tempSed,ecSed,phSed],stSed);

    let turbClear=val("Clearwell_Turbid","Clearwell _Turbid"),
        ecClear=val("Clearwell_EC","Clearwell _EC"),
        tdsClear=val("Clearwell_TDS","Clearwell _TDS");
    addRow("clearwell",[tdsClear,turbClear,ecClear], getStatusClearwell(turbClear,tdsClear,7,28));

    for(let n=1;n<=5;n++){
      let lk=n===4?"Filter4_Wat-Level":`Filter${n}_Wat-level`;
      let fl=val(lk), ft=val(`Filter${n}_Temp`);
      addFilterRow("filter"+n,[fl,ft],getStatusFilter(ft));
    }
  }catch(err){ console.log("Error:",err); }
}

// ================= STORAGE =================
function loadSavedMonitoring(){
  let data=JSON.parse(localStorage.getItem("monitoringData"))||[];
  data.forEach(d=>{
    addRow(d.unit,d.values,d.status,new Date(d.waktu).toLocaleTimeString('id-ID'));
  });
}
function saveMonitoringData(unit,values,status){
  let data=JSON.parse(localStorage.getItem("monitoringData"))||[];
  data.unshift({waktu:new Date().toISOString(),unit,values,status});
  if(data.length>2000) data=data.slice(0,2000);
  localStorage.setItem("monitoringData",JSON.stringify(data));
}

// ================= HISTORY =================
function saveToHistory(unit,status,penyebab,catatan){
  let h=JSON.parse(localStorage.getItem("historyLog"))||[];
  h.unshift({waktu:new Date().toLocaleString("id-ID"),unit,status,penyebab,catatan});
  localStorage.setItem("historyLog",JSON.stringify(h));
}
function openHistory(){
  let h=JSON.parse(localStorage.getItem("historyLog"))||[];
  let body=document.getElementById("historyBody");
  if(!body) return;
  body.innerHTML="";
  h.forEach(i=>{
    body.innerHTML+=`<tr>
      <td>${i.waktu}</td><td>${i.unit}</td>
      <td class="${statusClass(i.status)}">${i.status}</td>
      <td>${i.penyebab||"-"}</td>
      <td>${i.catatan||"-"}</td></tr>`;
  });
  document.getElementById("historyPopup").style.display="block";
}
function closeHistory(){ document.getElementById("historyPopup").style.display="none"; }
function clearHistory(){ localStorage.removeItem("historyLog"); openHistory(); }

// ================= CHART =================
function openChartPopup(){ document.getElementById("chartPopup").style.display="block"; updateParameterOptions(); }
function closeChartPopup(){ document.getElementById("chartPopup").style.display="none"; }
function updateParameterOptions(){
  let unit=document.getElementById("chartUnit").value;
  let select=document.getElementById("chartParameter");
  if(!parameterMap[unit]) return;
  select.innerHTML="";
  parameterMap[unit].forEach(p=>{
    let opt=document.createElement("option");
    opt.value=p.col; opt.text=p.name; select.appendChild(opt);
  });
}
function generateChart(){
  let unit=document.getElementById("chartUnit").value;
  let col=parseInt(document.getElementById("chartParameter").value);
  let rows=document.getElementById(unit+"-body").rows;
  if(!col){alert("Pilih parameter dulu");return;}
  if(rows.length===0){alert("Belum ada data");return;}
  let labels=[],data=[];
  for(let i=rows.length-1;i>=0;i--){
    labels.push(rows[i].cells[0].innerText);
    data.push(parseFloat(rows[i].cells[col].innerText));
  }
  let ctx=document.getElementById("monitorChart").getContext("2d");
  if(chartInstance) chartInstance.destroy();
  chartInstance=new Chart(ctx,{
    type:'line',
    data:{labels,datasets:[{
      label:document.getElementById("chartParameter").selectedOptions[0].text,
      data,borderWidth:2,tension:0.3
    }]},
    options:{responsive:true,maintainAspectRatio:false,scales:{y:{beginAtZero:true}}}
  });
}

// ================= DOWNLOAD =================
function downloadData(){
  let data=JSON.parse(localStorage.getItem("monitoringData"))||[];
  if(data.length===0){alert("Tidak ada data");return;}
  let history=JSON.parse(localStorage.getItem("historyLog"))||[];

  const headerMap={
    pra:       ["Waktu","Unit","Turbidity (NTU)","EC","Temp (°C)","TDS (mg/L)","Status","Penyebab Kejadian","Parameter Diperbaiki","Langkah Penanganan","Lokasi","Waktu Tindakan","Operator","Analis","Penanggung Jawab"],
    reservoir: ["Waktu","Unit","Turbidity (NTU)","pH","Temp (°C)","Status","Penyebab Kejadian","Parameter Diperbaiki","Langkah Penanganan","Lokasi","Waktu Tindakan","Operator","Analis","Penanggung Jawab"],
    clearwell: ["Waktu","Unit","TDS (mg/L)","Turbidity (NTU)","EC","Status","Penyebab Kejadian","Parameter Diperbaiki","Langkah Penanganan","Lokasi","Waktu Tindakan","Operator","Analis","Penanggung Jawab"],
    sed1:      ["Waktu","Unit","Turbidity (NTU)","Temp (°C)","EC","pH","Status","Penyebab Kejadian","Parameter Diperbaiki","Langkah Penanganan","Lokasi","Waktu Tindakan","Operator","Analis","Penanggung Jawab"],
    sed2:      ["Waktu","Unit","Turbidity (NTU)","Temp (°C)","EC","pH","Status","Penyebab Kejadian","Parameter Diperbaiki","Langkah Penanganan","Lokasi","Waktu Tindakan","Operator","Analis","Penanggung Jawab"],
  };
  const sheetName={pra:"Pra-Sedimentasi",reservoir:"Reservoir",clearwell:"Clearwell",sed1:"Sedimentasi 1",sed2:"Sedimentasi 2"};

  let wb=XLSX.utils.book_new();
  ["pra","reservoir","clearwell","sed1","sed2"].forEach(unit=>{
    let unitData=data.filter(d=>d.unit===unit).slice(0,500);
    if(unitData.length===0) return;
    let headers=headerMap[unit];
    let rows=[headers];
    unitData.forEach(d=>{
      // Cari catatan dari history berdasarkan unit dan waktu terdekat
      let hist=history.find(h=>h.unit===unit&&h.status===d.status)||{};
      let catatan=hist.catatan||{};
      let row=[
        new Date(d.waktu).toLocaleString("id-ID"),
        d.unit,
        ...d.values,
        d.status,
        hist.penyebab||"-",
        catatan.parameter||"-",
        catatan.langkah||"-",
        catatan.lokasi||"-",
        catatan.waktuTindakan||"-",
        catatan.operator||"-",
        catatan.analis||"-",
        catatan.penanggungjawab||"-"
      ];
      rows.push(row);
    });
    let ws=XLSX.utils.aoa_to_sheet(rows);
    ws['!cols']=headers.map(h=>({wch:Math.max(h.length+2,16)}));
    XLSX.utils.book_append_sheet(wb,ws,sheetName[unit]);
  });
  XLSX.writeFile(wb,"Monitoring_Data.xlsx");
}

// ================= ACTION FORM (5W1H) =================
let selectedRow=null, selectedUnit=null, selectedStatus=null;

function openForm(button, unit, status){
  selectedRow    = button.parentElement.parentElement;
  selectedUnit   = unit;
  selectedStatus = status;

  // Ambil parameter yang trigger dari baris ini
  let paramCols = colParams[unit]||[];
  let paramOptions = paramCols.map(p=>`<option>${p}</option>`).join("");

  document.getElementById("form5w1h").innerHTML = `
    <h3 style="margin-top:0;">Catatan Tindakan Operator</h3>
    <p style="color:#666;font-size:13px;">Unit: <b>${unit.toUpperCase()}</b> | Status: <b style="color:${status==='Kritis'?'#dc3545':'#ffc107'}">${status}</b></p>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:6px;font-weight:bold;width:40%;">1. Parameter yang diperbaiki?</td>
          <td style="padding:6px;"><select id="f_param" style="width:100%;padding:5px;">${paramOptions}</select></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">2. Bagaimana langkah penanganannya?</td>
          <td style="padding:6px;"><textarea id="f_langkah" style="width:100%;height:60px;padding:5px;" placeholder="Jelaskan langkah penanganan..."></textarea></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">3. Di mana lokasi tindakan?</td>
          <td style="padding:6px;"><input id="f_lokasi" type="text" style="width:100%;padding:5px;" placeholder="Contoh: Unit Pra-Sedimentasi, Inlet" value="Unit ${unit.toUpperCase()}"></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">4. Kapan tindakan dilakukan?</td>
          <td style="padding:6px;"><input id="f_waktu" type="datetime-local" style="width:100%;padding:5px;" value="${new Date().toISOString().slice(0,16)}"></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">5. Siapa yang melakukannya?</td>
          <td style="padding:6px;"><input id="f_operator" type="text" style="width:100%;padding:5px;" placeholder="Nama operator/teknisi"></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">6. Siapa yang menganalisis hasilnya?</td>
          <td style="padding:6px;"><input id="f_analis" type="text" style="width:100%;padding:5px;" placeholder="Nama analis/supervisor" value="Staf Produksi"></td></tr>
      <tr><td style="padding:6px;font-weight:bold;">7. Siapa yang menerima laporan?</td>
          <td style="padding:6px;"><input id="f_pj" type="text" style="width:100%;padding:5px;" placeholder="Nama penanggung jawab" value="Kepala Produksi"></td></tr>
    </table>
    <div style="text-align:right;margin-top:15px;">
      <button onclick="closeForm()" style="margin-right:8px;padding:7px 16px;">Batal</button>
      <button onclick="saveAction()" style="padding:7px 16px;background:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;">Simpan</button>
    </div>
  `;
  document.getElementById("actionForm").style.display="block";
}

function closeForm(){ document.getElementById("actionForm").style.display="none"; }

function saveAction(){
  let param   = document.getElementById("f_param")?.value||"-";
  let langkah = document.getElementById("f_langkah")?.value||"-";
  let lokasi  = document.getElementById("f_lokasi")?.value||"-";
  let waktuT  = document.getElementById("f_waktu")?.value||"-";
  let operator= document.getElementById("f_operator")?.value||"-";
  let analis  = document.getElementById("f_analis")?.value||"-";
  let pj      = document.getElementById("f_pj")?.value||"-";

  if(!operator||operator==="-"){ alert("Isi nama operator dulu!"); return; }

  // Ringkasan untuk tampil di tabel
  let ringkasan = `${operator} | ${param} | ${lokasi}`;

  selectedRow.cells[selectedRow.cells.length-1].innerHTML = ringkasan;
  lastActionPerUnit[selectedUnit] = ringkasan;
  lastStatusPerUnit[selectedUnit] = selectedStatus;
  backfillAction(selectedUnit, selectedStatus, ringkasan);

  // Simpan detail 5W1H ke history
  saveToHistory(selectedUnit, selectedStatus, "-", {
    parameter:param, langkah, lokasi,
    waktuTindakan:waktuT, operator, analis, penanggungjawab:pj
  });
  closeForm();
}

function backfillAction(unit,status,text){
  let tb=document.getElementById(unit+"-body");
  if(!tb) return;
  for(let i=0;i<tb.rows.length;i++){
    let row=tb.rows[i];
    let rs=row.cells[row.cells.length-3].innerText;
    let ac=row.cells[row.cells.length-1];
    if(rs===status&&ac.innerHTML.includes("button")) ac.innerHTML=text;
  }
}

// ================= STANDAR =================
function openStandar(){ document.getElementById("standarPopup").style.display="block"; }
function closeStandar(){ document.getElementById("standarPopup").style.display="none"; }

// ================= CLEAR TABLES =================
function clearAllTables(){
  ["pra","reservoir","clearwell","sed1","sed2","filter1","filter2","filter3","filter4","filter5"].forEach(id=>{
    let b=document.getElementById(id+"-body");
    if(b) b.innerHTML="";
  });
}

// ================= DUMMY DATA GENERATOR =================
function rand(min,max,dec=2){ return parseFloat((Math.random()*(max-min)+min).toFixed(dec)); }
function pickZone(){
  let r=Math.random();
  if(r<0.70) return "normal";
  if(r<0.90) return "waspada";
  return "kritis";
}
function dummyPra(){
  let z=pickZone(),turb,tds,ph,temp,ec;
  if(z==="normal"){turb=rand(4,30);tds=rand(100,500);ph=rand(6.5,8.4,1);temp=rand(27,28.4,1);}
  else if(z==="waspada"){turb=rand(31,39);tds=rand(501,599);ph=rand(8.5,8.9,1);temp=rand(28.5,29.9,1);}
  else{turb=rand(40,60);tds=rand(600,700);ph=rand(9.0,10.0,1);temp=rand(30,32,1);}
  ec=rand(200,800);
  addRow("pra",[turb,ec,temp,tds],getStatusPra(turb,tds,ph,temp));
}
function dummySedimentasi(unit){
  let z=pickZone(),turb,tds,ph,temp,ec;
  if(z==="normal"){turb=rand(0.5,2.4);tds=rand(120,250);ph=rand(6.5,8.4,1);temp=rand(27,28.4,1);}
  else if(z==="waspada"){turb=rand(2.6,2.9);tds=rand(251,269);ph=rand(8.5,8.9,1);temp=rand(28.5,29.9,1);}
  else{turb=rand(3.0,5.0);tds=rand(270,350);ph=rand(9.0,10.0,1);temp=rand(30,32,1);}
  ec=rand(150,500);
  addRow(unit,[turb,temp,ec,ph],getStatusSedimentasi(turb,tds,ph,temp));
}
function dummyReservoir(){
  let z=pickZone(),turb,tds,ph,temp;
  if(z==="normal"){turb=rand(0.5,2.4);tds=rand(120,250);ph=rand(6.5,8.4,1);temp=rand(27,28.4,1);}
  else if(z==="waspada"){turb=rand(2.6,2.9);tds=rand(251,269);ph=rand(8.5,8.9,1);temp=rand(28.5,29.9,1);}
  else{turb=rand(3.0,5.0);tds=rand(270,350);ph=rand(9.0,10.0,1);temp=rand(30,32,1);}
  addRow("reservoir",[turb,ph,temp],getStatusReservoir(turb,tds,ph,temp));
}
function dummyClearwell(){
  let z=pickZone(),tds,turb,ec;
  if(z==="normal"){tds=rand(120,250);turb=rand(0.5,2.4);ec=rand(150,400);}
  else if(z==="waspada"){tds=rand(251,269);turb=rand(2.6,2.9);ec=rand(401,499);}
  else{tds=rand(270,350);turb=rand(3.0,5.0);ec=rand(500,600);}
  addRow("clearwell",[tds,turb,ec],getStatusClearwell(turb,tds,7,28));
}
function dummyFilter(n){
  let level=rand(20,100,1),temp=rand(27,31,1);
  addFilterRow("filter"+n,[level,temp],getStatusFilter(temp));
}
function loadDummyData(){
  if(!dummyMode) return;
  dummyPra(); dummyReservoir();
  dummySedimentasi("sed1"); dummySedimentasi("sed2");
  dummyClearwell();
  [1,2,3,4,5].forEach(n=>dummyFilter(n));
}

// ================= MONITORING INTERVAL =================
let monitoringInterval=null;
function startMonitoring(){
  if(monitoringInterval) return;
  monitoringInterval=setInterval(()=>{
    if(dummyMode) loadDummyData(); else loadRealData();
  },10000);
}
function stopMonitoring(){ clearInterval(monitoringInterval); monitoringInterval=null; }

document.addEventListener("visibilitychange",function(){
  if(document.visibilityState==="visible"){
    if(!dummyMode) loadRealData();
    startMonitoring();
  } else {
    stopMonitoring();
  }
});

window.onload=function(){
  loadSavedMonitoring();
  if(dummyMode) loadDummyData(); else loadRealData();
  startMonitoring();
};
