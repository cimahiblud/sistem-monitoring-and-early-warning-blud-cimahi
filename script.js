Berikut adalah kode JavaScript (`script.js`) utuh yang sudah direvisi sesuai permintaan Anda dan siap langsung di-copy-paste ke repository GitHub Pages Anda:

```javascript
// ================= CHART GLOBAL =================
let chartInstance = null;

// ================= AUTO ACTION STATE =================
let lastActionPerUnit = {};
let lastStatusPerUnit = {};

// ================= PENYEBAB KEJADIAN OPTIONS (Berdasarkan dokumen WTP) =================
const penyebabKejadianMap = {
  pra: {
    Turbidity: [
      "Curah hujan tinggi / aliran air baku keruh dari sungai",
      "Kerusakan/sumbatan pada trash rack / saringan kasar inlet",
      "Sedimentasi lumpur berlebih di bak pra-sedimentasi",
      "Kerusakan pada gate valve aliran masuk"
    ],
    TDS: [
      "Lonjakan partikel terlarut dari limpasan air hulu",
      "Kontaminasi limbah industri ringan di hulu sungai",
      "Fluktuasi debit air tanah/sungai musim kemarau"
    ],
    pH: [
      "Pencemaran limbah asam/basa di perairan hulu",
      "Reaksi kimia koagulan berlebih pada pra-treatment"
    ],
    Temp: [
      "Perubahan cuaca ekstrem / radiasi surya langsung pada siang hari",
      "Peningkatan suhu air limbah industri yang masuk ke badan air"
    ]
  },
  reservoir: {
    Turbidity: [
      "Bahan tersuspensi lolos dari proses filtrasi sebelumnya",
      "Pertumbuhan lumut atau endapan di dinding reservoir",
      "Kerusakan struktur pelindung atau kebocoran atap reservoir"
    ],
    TDS: [
      "Akumulasi mineral terlarut akibat sirkulasi air kurang optimal",
      "Kegagalan sistem reverse osmosis / filtrasi pendukung"
    ],
    pH: [
      "Dosis klorin atau soda api tidak seimbang",
      "Reaksi kimia sisa disinfektan di dalam bak reservoir"
    ],
    Temp: [
      "Suhu lingkungan tinggi mempengaruhi suhu air reservoir terbuka"
    ]
  },
  clearwell: {
    Turbidity: [
      "Media filter jenuh atau perlu pencucian balik (backwash)",
      "Kebocoran pada underdrain media pasir filter",
      "Laju filtrasi terlampau tinggi (over-rate)"
    ],
    TDS: [
      "Konsentrasi zat terlarut tinggi dari proses koagulasi-flokulasi"
    ],
    pH: [
      "Ketidakseimbangan injeksi bahan kimia penyesuaian pH akhir"
    ],
    Temp: [
      "Fluktuasi suhu air olahan sebelum masuk distribusi"
    ]
  },
  sed1: {
    Turbidity: [
      "Dosis koagulan (Tawas/PAC) kurang atau berlebih",
      "Kegagalan motor pengaduk cepat/lambat (mixer)",
      "Waktu detensi hidrolis tidak sesuai akibat debit berlebih",
      "Akumulasi lumpur zona pengendapan terlalu tebal"
    ],
    Temp: [
      "Perubahan suhu air baku yang masuk ke zona sedimentasi"
    ],
    EC: [
      "Kandungan ion terlarut meningkat drastis di air baku"
    ],
    pH: [
      "Efektivitas koagulan menurun akibat pH air baku di luar rentang optimum"
    ]
  },
  sed2: {
    Turbidity: [
      "Dosis koagulan (Tawas/PAC) kurang atau berlebih",
      "Kegagalan motor pengaduk cepat/lambat (mixer)",
      "Waktu detensi hidrolis tidak sesuai akibat debit berlebih",
      "Akumulasi lumpur zona pengendapan terlalu tebal"
    ],
    Temp: [
      "Perubahan suhu air baku yang masuk ke zona sedimentasi"
    ],
    EC: [
      "Kandungan ion terlarut meningkat drastis di air baku"
    ],
    pH: [
      "Efektivitas koagulan menurun akibat pH air baku di luar rentang optimum"
    ]
  }
};

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

// ================= URUTAN PARAMETER PER TABEL (untuk pewarnaan sel) =================
const colParams = {
  pra:       ["Turbidity", "EC",   "Temp", "TDS"],
  reservoir: ["Turbidity", "pH",   "Temp"],
  clearwell: ["TDS",       "Turbidity", "EC"],
  sed1:      ["Turbidity", "Temp", "EC",   "pH"],
  sed2:      ["Turbidity", "Temp", "EC",   "pH"],
  filter:    ["WaterLevel","Temp"]
};

// ================= THRESHOLD PARAMETER (mengacu Tabel 4.1) =================
const paramThresholds = {
  pra: {
    Turbidity: {waspada: 31,   kritis: 40},
    TDS:       {waspada: 501,  kritis: 600},
    pH:        {waspada: 8.5,  kritis: 9},
    Temp:      {waspada: 28.5, kritis: 30}
  },
  reservoir: {
    Turbidity: {waspada: 2.6,  kritis: 3},
    TDS:       {waspada: 251,  kritis: 270},
    pH:        {waspada: 8.5,  kritis: 9},
    Temp:      {waspada: 28.5, kritis: 30}
  },
  clearwell: {
    Turbidity: {waspada: 2.6,  kritis: 3},
    TDS:       {waspada: 251,  kritis: 270},
    pH:        {waspada: 8.5,  kritis: 9},
    Temp:      {waspada: 28.5, kritis: 30}
  },
  sed1: {
    Turbidity: {waspada: 2.6,  kritis: 3},
    TDS:       {waspada: 251,  kritis: 270},
    pH:        {waspada: 8.5,  kritis: 9},
    Temp:      {waspada: 28.5, kritis: 30}
  },
  sed2: {
    Turbidity: {waspada: 2.6,  kritis: 3},
    TDS:       {waspada: 251,  kritis: 270},
    pH:        {waspada: 8.5,  kritis: 9},
    Temp:      {waspada: 28.5, kritis: 30}
  },
  filter: {
    Temp: {waspada: 28.5, kritis: 30}
  }
};

// Kembalikan class CSS untuk sel nilai parameter berdasarkan unit + nama parameter + nilai
function paramClass(unit, paramName, value){
  if(value === null || value === undefined || value === "-" ) return "";
  const v = parseFloat(value);
  if(isNaN(v)) return "";
  const t = paramThresholds[unit] && paramThresholds[unit][paramName];
  if(!t) return "";
  if(v >= t.kritis)  return "critical";
  if(v >= t.waspada) return "warning";
  return "normal";
}

// ================= LIMIT ROWS =================
function limitRows(id){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  while(tb.rows.length > 20){
    tb.deleteRow(tb.rows.length - 1);
  }
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

// Kolom tabel diperbarui: "Tindakan" diubah menjadi "Penyebab Kejadian" dan "Catatan 5W1H"
document.getElementById("tables").innerHTML =
  tableTemplate("pra",      ["Waktu","Turbidity","EC","Temp","TDS","Status","Penyebab Kejadian","Catatan 5W1H"]) +
  tableTemplate("reservoir",["Waktu","Turbidity","pH","Temp","Status","Penyebab Kejadian","Catatan 5W1H"]) +
  tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Penyebab Kejadian","Catatan 5W1H"]) +
  tableTemplate("sed1",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan 5W1H"]) +
  tableTemplate("sed2",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan 5W1H"]) +
  `<div id="filter" class="tab-content">
    <div class="filter-wrapper">
      ${[1,2,3,4,5].map(n=>`
      <div class="filter-box">
        <h4>Filter ${n}</h4>
        <table>
          <thead><tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr></thead>
          <tbody id="filter${n}-body"></tbody>
        </table>
      </div>`).join("")}
    </div>
  </div>`;

// ================= TAB =================
function openTab(evt, tabName){
  document.querySelectorAll(".tab-content").forEach(function(tab){
    tab.style.display = "none";
  });
  document.querySelectorAll(".tab").forEach(function(btn){
    btn.classList.remove("active");
  });
  let selected = document.getElementById(tabName);
  if(selected){ selected.style.display = "block"; }
  evt.currentTarget.classList.add("active");
}

// ================= CLOCK =================
function updateClock(){
  let now = new Date();
  document.getElementById("clock").innerText =
    now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
    +" - "+now.toLocaleTimeString('id-ID');
}
setInterval(updateClock, 1000);
updateClock();

// ================= STATUS CLASS =================
function statusClass(s){ return s==="Normal"?"normal":s==="Waspada"?"warning":"critical"; }

// ================= AUDIO ALARM =================
let audioContext = null;
function initAudio(){
  if(!audioContext){
    audioContext = new(window.AudioContext||window.webkitAudioContext)();
  }
}

function playBeep(duration, frequency){
  if(!audioContext) return;
  let osc = audioContext.createOscillator();
  let gain = audioContext.createGain();
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.frequency.value = frequency;
  osc.start();
  gain.gain.setValueAtTime(1, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime+duration);
  osc.stop(audioContext.currentTime+duration);
}

function triggerAlarm(status){
  if(status==="Waspada") playBeep(0.3, 600);
  if(status==="Kritis"){
    playBeep(0.5, 900);
    setTimeout(()=>playBeep(0.5, 900), 600);
  }
}

// ================= ADD ROW =================
function addRow(id, values, status, waktu=null, penyebab="-", form5w1h=null){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;

  let tr = tb.insertRow(0);

  if(!waktu){
    waktu = new Date().toLocaleTimeString('id-ID');
    saveMonitoringData(id, values, status, penyebab, form5w1h);
  }

  let actionButton = "-";
  if(status === "Waspada" || status === "Kritis"){
    if(form5w1h){
      actionButton = `<button onclick="openForm(this,'${id}','${status}')" style="background:#10b981;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Lihat 5W1H</button>`;
    } else {
      actionButton = `<button onclick="openForm(this,'${id}','${status}')" style="background:#f59e0b;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Isi Catatan 5W1H</button>`;
    }
  }

  let params = colParams[id] || [];
  let valuesHtml = values.map((v, i) => {
    let pname = params[i];
    let cls   = paramClass(id, pname, v);
    return "<td class='"+cls+"'>"+(v ?? "-")+"</td>";
  }).join("");

  tr.innerHTML = "<td>"+waktu+"</td>" +
    valuesHtml +
    "<td class='"+statusClass(status)+"'>"+status+"</td>" +
    "<td>"+(penyebab || "-")+"</td>" +
    "<td>"+actionButton+"</td>";

  limitRows(id);

  let sumId = null;
  if(id==="pra")            sumId="sum-pra";
  else if(id==="reservoir") sumId="sum-res";
  else if(id==="clearwell") sumId="sum-clear";
  else if(id==="sed1")      sumId="sum-sed1";
  else if(id==="sed2")      sumId="sum-sed2";

  if(sumId){
    let labelMap = {pra:"PRA-SED",reservoir:"RESERVOIR",clearwell:"CLEARWELL",sed1:"SED-1",sed2:"SED-2"};
    let label = labelMap[id] || id.toUpperCase();
    let sumEl = document.getElementById(sumId);
    if(sumEl){
      sumEl.className = "summary-box "+statusClass(status);
      sumEl.innerText = label+" : "+status;
    }
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
  let valuesHtml = values.map((v, i) => {
    let pname = params[i];
    let cls   = paramClass("filter", pname, v);
    return "<td class='"+cls+"'>"+(v ?? "-")+"</td>";
  }).join("");

  tr.innerHTML = "<td>"+waktu+"</td>" +
    valuesHtml +
    "<td class='"+statusClass(status)+"'>"+status+"</td>" +
    "<td>-</td>";
  if(tb.rows.length > 20) tb.deleteRow(20);

  let n = id.replace("filter","");
  let sumEl = document.getElementById("sum-filter"+n);
  if(sumEl){
    sumEl.className = "summary-box "+statusClass(status);
    sumEl.innerText = "Filter "+n+" : "+status;
    triggerAlarm(status);
  }
}

// ================= GOOGLE SHEET =================
const sheetURL = "https://opensheet.elk.sh/14i8S-08Yg3Vn_WFA6Ny_4uJ2stTzL9rvrTP0Qt0bCmQ/Sheet1";

// ================= STATUS LOGIC =================
function getStatusPra(turb, tds, ph, temp){
  if(turb >= 40 || tds >= 600 || ph >= 9 || temp >= 30) return "Kritis";
  if(turb >= 31 || tds >= 501 || ph >= 8.5 || temp >= 28.5) return "Waspada";
  return "Normal";
}

function getStatusSedimentasi(turb, tds, ph, temp){
  if(turb >= 3 || tds >= 270 || ph >= 9 || temp >= 30) return "Kritis";
  if(turb >= 2.6 || tds >= 251 || ph >= 8.5 || temp >= 28.5) return "Waspada";
  return "Normal";
}

function getStatusReservoir(turb, tds, ph, temp){
  return getStatusSedimentasi(turb, tds, ph, temp);
}

function getStatusClearwell(turb, tds, ph, temp){
  return getStatusSedimentasi(turb, tds, ph, temp);
}

function getStatusFilter(temp){
  if(temp >= 30) return "Kritis";
  if(temp >= 28.5) return "Waspada";
  return "Normal";
}

// ================= LOAD REAL DATA =================
let lastFetchedWaktu = null;
async function loadRealData(){
  if(dummyMode) return;
  try{
    const res = await fetch(sheetURL);
    const data = await res.json();
    if(data.length < 1) return;
    let last = data[data.length-1];
    let waktuBaru = (last["Waktu"] || last["waktu"] || "").toString().trim();
    if(waktuBaru && waktuBaru === lastFetchedWaktu) return;
    lastFetchedWaktu = waktuBaru;

    function val(...keys){
      for(let k of keys){
        if(last[k] !== undefined && last[k] !== "") return parseFloat(last[k]) || 0;
      }
      return 0;
    }

    let turbPra = val("Pra-Sed_Turbid");
    let ecPra   = val("Pra-Sed_EC");
    let tempPra = val("Pra-Sed_Temp");
    let tdsPra  = val("Pra-Sed_TDS");
    let statusPra = getStatusPra(turbPra, tdsPra, 7, tempPra);
    addRow("pra", [turbPra, ecPra, tempPra, tdsPra], statusPra);

    let turbRes = val("Reservoir_Turbid");
    let tempRes = val("Reservoir_Temp");
    let phRes   = val("Reservoir_Ph");
    let statusRes = getStatusReservoir(turbRes, 0, phRes, tempRes);
    addRow("reservoir", [turbRes, phRes, tempRes], statusRes);

    let turbSed = val("Sedimen_Turbid", "Sedimen _Turbid");
    let ecSed   = val("Sedimen_EC",     "Sedimen _EC");
    let tempSed = val("Sedimen_Temp",   "Sedimen _Temp");
    let phSed   = val("Sedimen_ph",     "Sedimen _ph");
    let statusSed = getStatusSedimentasi(turbSed, 0, phSed, tempSed);
    addRow("sed1", [turbSed, tempSed, ecSed, phSed], statusSed);
    addRow("sed2", [turbSed, tempSed, ecSed, phSed], statusSed);

    let turbClear = val("Clearwell_Turbid", "Clearwell _Turbid");
    let ecClear   = val("Clearwell_EC",     "Clearwell _EC");
    let tdsClear  = val("Clearwell_TDS", "Clearwell _TDS");
    let statusClear = getStatusClearwell(turbClear, tdsClear, 7, 28);
    addRow("clearwell", [tdsClear, turbClear, ecClear], statusClear);

    for(let n = 1; n <= 5; n++){
      let levelKey = n === 4 ? "Filter4_Wat-Level" : `Filter${n}_Wat-level`;
      let tempKey  = `Filter${n}_Temp`;
      let fl = val(levelKey);
      let ft = val(tempKey);
      let fs = getStatusFilter(ft);
      addFilterRow("filter"+n, [fl, ft], fs);
    }
  }catch(err){
    console.log("Error load sheet:", err);
  }
}

// ================= STORAGE =================
function loadSavedMonitoring(){
  let data = JSON.parse(localStorage.getItem("monitoringData")) || [];
  data.forEach(d=>{
    addRow(d.unit, d.values, d.status, new Date(d.waktu).toLocaleTimeString('id-ID'), d.penyebab, d.form5w1h);
  });
}

function saveMonitoringData(unit, values, status, penyebab="-", form5w1h=null){
  let data = JSON.parse(localStorage.getItem("monitoringData")) || [];
  data.unshift({waktu:new Date().toISOString(), unit, values, status, penyebab, form5w1h});
  if(data.length > 2000) data = data.slice(0, 2000);
  localStorage.setItem("monitoringData", JSON.stringify(data));
}

// ================= HISTORY =================
function saveToHistory(unit, status, penyebab, form5w1h){
  let h = JSON.parse(localStorage.getItem("historyLog")) || [];
  h.unshift({waktu:new Date().toLocaleString("id-ID"), unit, status, penyebab, form5w1h});
  localStorage.setItem("historyLog", JSON.stringify(h));
}

function openHistory(){
  let h = JSON.parse(localStorage.getItem("historyLog")) || [];
  let body = document.getElementById("historyBody");
  if(!body) return;
  body.innerHTML = "";
  h.forEach(i=>{
    let q2 = i.form5w1h ? i.form5w1h.q2_langkah : "-";
    body.innerHTML += `<tr>
      <td>${i.waktu}</td><td>${i.unit}</td>
      <td class="${statusClass(i.status)}">${i.status}</td>
      <td>${i.penyebab}</td><td>${q2}</td></tr>`;
  });
  let popup = document.getElementById("historyPopup");
  if(popup) popup.style.display = "block";
}

function closeHistory(){ 
  let popup = document.getElementById("historyPopup");
  if(popup) popup.style.display = "none"; 
}

function clearHistory(){
  localStorage.removeItem("historyLog");
  openHistory();
}

// ================= CHART =================
function openChartPopup(){
  let popup = document.getElementById("chartPopup");
  if(popup) popup.style.display = "block";
  updateParameterOptions();
}

function closeChartPopup(){ 
  let popup = document.getElementById("chartPopup");
  if(popup) popup.style.display = "none"; 
}

function updateParameterOptions(){
  let unitEl = document.getElementById("chartUnit");
  if(!unitEl) return;
  let unit = unitEl.value;
  let select = document.getElementById("chartParameter");
  if(!select || !parameterMap[unit]) return;
  select.innerHTML = "";
  parameterMap[unit].forEach(function(p){
    let opt = document.createElement("option");
    opt.value = p.col;
    opt.text = p.name;
    select.appendChild(opt);
  });
}

function generateChart(){
  let unit = document.getElementById("chartUnit").value;
  let col  = parseInt(document.getElementById("chartParameter").value);
  let rows = document.getElementById(unit+"-body").rows;
  if(!col){ alert("Pilih parameter dulu"); return; }
  if(rows.length === 0){ alert("Belum ada data"); return; }
  let labels = [];
  let data   = [];
  for(let i = rows.length-1; i >= 0; i--){
    labels.push(rows[i].cells[0].innerText);
    data.push(parseFloat(rows[i].cells[col].innerText));
  }
  let ctx = document.getElementById("monitorChart").getContext("2d");
  if(chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx,{
    type:'line',
    data:{
      labels:labels,
      datasets:[{
        label:document.getElementById("chartParameter").selectedOptions[0].text,
        data:data,
        borderWidth:2,
        tension:0.3
      }]
    },
    options:{responsive:true, maintainAspectRatio:false, scales:{y:{beginAtZero:true}}}
  });
}

// ================= DOWNLOAD EXCEL (XLSX) =================
function downloadData(){
  let data = JSON.parse(localStorage.getItem("monitoringData")) || [];
  if(data.length === 0){ alert("Tidak ada data"); return; }

  const units = ["pra","reservoir","clearwell","sed1","sed2"];
  let wb = XLSX.utils.book_new();

  units.forEach(unit => {
    let unitData = data.filter(d => d.unit === unit).slice(0, 500);
    if(unitData.length === 0) return;

    let headers = [
      "Waktu Pencatatan", "Unit WTP",
      unit === 'pra' ? "Turbidity (NTU)" : unit === 'reservoir' ? "Turbidity (NTU)" : unit === 'clearwell' ? "TDS (mg/L)" : "Turbidity (NTU)",
      unit === 'pra' ? "EC (µS/cm)" : unit === 'reservoir' ? "pH" : unit === 'clearwell' ? "Turbidity (NTU)" : "Temp (°C)",
      unit === 'pra' ? "Temp (°C)" : unit === 'reservoir' ? "Temp (°C)" : unit === 'clearwell' ? "EC (µS/cm)" : "EC (µS/cm)",
      unit === 'pra' ? "TDS (mg/L)" : unit === 'clearwell' ? null : "pH",
      "Status", "Penyebab Kejadian",
      "Q1: Parameter Diperbaiki", "Q2: Langkah Penanganan (5W1H)",
      "Q3: Lokasi", "Q4: Waktu Tindakan",
      "Q5: Operator", "Q6: Analis/Supervisor", "Q7: Manajer"
    ].filter(Boolean);

    let rows = [headers];

    unitData.forEach(d => {
      let f = d.form5w1h || {};
      let row = [
        new Date(d.waktu).toLocaleString("id-ID"),
        d.unit.toUpperCase(),
        ...(d.values || []),
        d.status,
        d.penyebab || "-",
        f.q1_parameter || "-",
        f.q2_langkah || "-",
        f.q3_lokasi || "-",
        f.q4_waktu || "-",
        f.q5_operator || "-",
        f.q6_analis || "-",
        f.q7_manajer || "-"
      ];
      rows.push(row);
    });

    let ws = XLSX.utils.aoa_to_sheet(rows);
    let colWidths = headers.map(h => ({ wch: Math.max(h.length + 2, 16) }));
    ws['!cols'] = colWidths;

    let sheetName = unit === "sed1" ? "Sedimentasi 1"
                  : unit === "sed2" ? "Sedimentasi 2"
                  : unit === "pra"  ? "Pra-Sedimentasi"
                  : unit === "clearwell" ? "Clearwell"
                  : "Reservoir";

    XLSX.utils.book_append_sheet(wb, ws, sheetName);
  });

  XLSX.writeFile(wb, "Monitoring_Data_5W1H.xlsx");
}

// ================= 5W1H ACTION FORM MODAL =================
let selectedRow    = null;
let selectedUnit   = null;
let selectedStatus = null;

// Pastikan elemen modal HTML 5W1H diinjeksikan secara otomatis jika belum ada di DOM
function ensureFormModalHTML(){
  if(document.getElementById("custom5W1HModal")) return;
  let modalDiv = document.createElement("div");
  modalDiv.id = "custom5W1HModal";
  modalDiv.style.cssText = "display:none; position:fixed; z-index:9999; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.6); overflow:auto; font-family:sans-serif;";
  modalDiv.innerHTML = `
    <div style="background:#1e293b; color:#f8fafc; margin:5% auto; padding:24px; width:90%; max-width:650px; border-radius:12px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
      <h3 style="margin-top:0; color:#38bdf8; font-size:18px; border-bottom:1px solid #334155; padding-bottom:10px;">Form Catatan Operator & Analisis Penyebab (5W1H)</h3>
      <p id="modalUnitStatus" style="font-size:13px; color:#94a3b8; margin-bottom:15px;"></p>
      
      <div style="margin-bottom:14px;">
        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#cbd5e1;">Pilih Penyebab Kejadian (Over Limit / Anomali) *</label>
        <select id="selectPenyebab" style="width:100%; padding:8px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:13px;"></select>
      </div>

      <div style="border-top:1px solid #334155; padding-top:12px; margin-top:12px;">
        <h4 style="font-size:13px; color:#38bdf8; margin-bottom:10px; text-transform:uppercase;">Struktur Pertanyaan 5W1H</h4>
        
        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">1. Parameter apa yang diperbaiki?</label>
          <input type="text" id="f_q1" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
        </div>

        <div style="margin-bottom:10px;">
          <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">2. Bagaimana melakukan tindakan tersebut? (Langkah Penanganan)</label>
          <textarea id="f_q2" rows="3" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px; resize:none;" placeholder="Tulis langkah perbaikan..."></textarea>
        </div>

        <div style="display:flex; gap:10px; margin-bottom:10px;">
          <div style="flex:1;">
            <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">3. Di mana lokasi tindakan perbaikan?</label>
            <input type="text" id="f_q3" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
          </div>
          <div style="flex:1;">
            <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">4. Kapan tindakan tersebut dilakukan?</label>
            <input type="text" id="f_q4" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
          </div>
        </div>

        <div style="display:flex; gap:10px; margin-bottom:15px;">
          <div style="flex:1;">
            <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">5. Operator / Teknisi</label>
            <input type="text" id="f_q5" value="Ahmad Operator (Shift 1)" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
          </div>
          <div style="flex:1;">
            <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">6. Analis / Supervisor</label>
            <input type="text" id="f_q6" value="Ir. Budi (Supervisor Lab)" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
          </div>
          <div style="flex:1;">
            <label style="display:block; font-size:11px; color:#cbd5e1; margin-bottom:3px;">7. Penanggung Jawab / Manajer</label>
            <input type="text" id="f_q7" value="Dr. Hendra (Manajer Operasional)" style="width:100%; padding:7px; background:#0f172a; color:#fff; border:1px solid #475569; border-radius:6px; font-size:12px;">
          </div>
        </div>
      </div>

      <div style="text-align:right; border-top:1px solid #334155; padding-top:12px; display:flex; justify-content:flex-end; gap:8px;">
        <button onclick="closeFormModal()" style="padding:8px 16px; background:#475569; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px;">Batal</button>
        <button onclick="saveAction5W1H()" style="padding:8px 16px; background:#0284c7; color:#fff; border:none; border-radius:6px; cursor:pointer; font-size:12px; font-weight:bold;">Simpan & Sinkronkan</button>
      </div>
    </div>
  `;
  document.body.appendChild(modalDiv);
}

function openForm(button, unit, status){
  ensureFormModalHTML();
  selectedRow    = button.parentElement.parentElement;
  selectedUnit   = unit;
  selectedStatus = status;

  document.getElementById("modalUnitStatus").innerText = "Unit: " + unit.toUpperCase() + " | Status: " + status;
  
  let selectEl = document.getElementById("selectPenyebab");
  selectEl.innerHTML = "";
  
  let paramsList = parameterMap[unit] || [];
  let affectedParam = paramsList[0]?.name || "Turbidity";
  let unitThresh = paramThresholds[unit] || {};
  
  for(let i=0; i<selectedRow.cells.length-3; i++){
    let cellVal = selectedRow.cells[i+1]?.innerText;
    let pName = paramsList[i]?.name;
    if(pName && unitThresh[pName]){
      let vNum = parseFloat(cellVal);
      if(vNum >= unitThresh[pName].waspada){
        affectedParam = pName;
      }
    }
  }

  let options = (penyebabKejadianMap[unit] && penyebabKejadianMap[unit][affectedParam]) || [
    "Lonjakan parameter di luar ambang batas normal",
    "Gangguan mekanis / elektrikal pada unit",
    "Fluktuasi kualitas air baku mendadak"
  ];

  options.forEach(opt => {
    let optEl = document.createElement("option");
    optEl.value = opt;
    optEl.text = opt;
    selectEl.appendChild(optEl);
  });

  document.getElementById("f_q1").value = affectedParam + " pada Unit " + unit.toUpperCase() + " bernilai " + status;
  document.getElementById("f_q2").value = "";
  document.getElementById("f_q3").value = "Instalasi WTP Unit " + unit.toUpperCase() + " - Zona Utama";
  document.getElementById("f_q4").value = new Date().toLocaleString("id-ID");

  document.getElementById("custom5W1HModal").style.display = "block";
}

function closeFormModal(){
  let modal = document.getElementById("custom5W1HModal");
  if(modal) modal.style.display = "none";
}

function saveAction5W1H(){
  let penyebab = document.getElementById("selectPenyebab").value;
  let q1 = document.getElementById("f_q1").value;
  let q2 = document.getElementById("f_q2").value;
  let q3 = document.getElementById("f_q3").value;
  let q4 = document.getElementById("f_q4").value;
  let q5 = document.getElementById("f_q5").value;
  let q6 = document.getElementById("f_q6").value;
  let q7 = document.getElementById("f_q7").value;

  if(!q2){
    alert("Langkah penanganan (Q2) wajib diisi!");
    return;
  }

  let form5w1hData = { q1_parameter: q1, q2_langkah: q2, q3_lokasi: q3, q4_waktu: q4, q5_operator: q5, q6_analis: q6, q7_manajer: q7 };

  selectedRow.cells[selectedRow.cells.length-2].innerText = penyebab;
  selectedRow.cells[selectedRow.cells.length-1].innerHTML = `<button onclick="openForm(this,'${selectedUnit}','${selectedStatus}')" style="background:#10b981;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Lihat 5W1H</button>`;

  saveToHistory(selectedUnit, selectedStatus, penyebab, form5w1hData);
  
  let data = JSON.parse(localStorage.getItem("monitoringData")) || [];
  if(data.length > 0){
    data[0].penyebab = penyebab;
    data[0].form5w1h = form5w1hData;
    localStorage.setItem("monitoringData", JSON.stringify(data));
  }

  closeFormModal();
  alert("Catatan 5W1H & Penyebab Kejadian berhasil disimpan!");
}

// ================= STANDAR =================
function openStandar(){ 
  let popup = document.getElementById("standarPopup");
  if(popup) popup.style.display = "block"; 
}
function closeStandar(){ 
  let popup = document.getElementById("standarPopup");
  if(popup) popup.style.display = "none"; 
}

// ================= CLEAR TABLES =================
function clearAllTables(){
  ["pra","reservoir","clearwell","sed1","sed2","filter1","filter2","filter3","filter4","filter5"].forEach(id=>{
    let body = document.getElementById(id+"-body");
    if(body) body.innerHTML = "";
  });
}

// ================= DUMMY DATA GENERATOR =================
function rand(min, max, dec=2){
  return parseFloat((Math.random()*(max-min)+min).toFixed(dec));
}

function pickZone(){
  let r = Math.random();
  if(r < 0.70) return "normal";
  if(r < 0.90) return "waspada";
  return "kritis";
}

function dummyPra(){
  let zone = pickZone();
  let turb, tds, ph, temp, ec;
  if(zone === "normal"){
    turb = rand(4, 30);
    tds  = rand(100, 500);
    ph   = rand(6.5, 8.4, 1);
    temp = rand(27,  28.4, 1);
  } else if(zone === "waspada"){
    turb = rand(31, 39);
    tds  = rand(501, 599);
    ph   = rand(8.5, 8.9, 1);
    temp = rand(28.5,29.9, 1);
  } else {
    turb = rand(40, 60);
    tds  = rand(600, 700);
    ph   = rand(9.0, 10.0, 1);
    temp = rand(30,  32,  1);
  }
  ec = rand(200, 800);
  let status = getStatusPra(turb, tds, ph, temp);
  addRow("pra", [turb, ec, temp, tds], status);
}

function dummySedimentasi(unit){
  let zone = pickZone();
  let turb, tds, ph, temp, ec;
  if(zone === "normal"){
    turb = rand(0.5, 2.4);
    tds  = rand(120, 250);
    ph   = rand(6.5, 8.4, 1);
    temp = rand(27,  28.4, 1);
  } else if(zone === "waspada"){
    turb = rand(2.6, 2.9);
    tds  = rand(251, 269);
    ph   = rand(8.5, 8.9, 1);
    temp = rand(28.5,29.9, 1);
  } else {
    turb = rand(3.0, 5.0);
    tds  = rand(270, 350);
    ph   = rand(9.0, 10.0, 1);
    temp = rand(30,  32,  1);
  }
  ec = rand(150, 500);
  let status = getStatusSedimentasi(turb, tds, ph, temp);
  addRow(unit, [turb, temp, ec, ph], status);
}

function dummyReservoir(){
  let zone = pickZone();
  let turb, tds, ph, temp;
  if(zone === "normal"){
    turb = rand(0.5, 2.4);
    tds  = rand(120, 250);
    ph   = rand(6.5, 8.4, 1);
    temp = rand(27,  28.4, 1);
  } else if(zone === "waspada"){
    turb = rand(2.6, 2.9);
    tds  = rand(251, 269);
    ph   = rand(8.5, 8.9, 1);
    temp = rand(28.5,29.9, 1);
  } else {
    turb = rand(3.0, 5.0);
    tds  = rand(270, 350);
    ph   = rand(9.0, 10.0, 1);
    temp = rand(30,  32,  1);
  }
  let status = getStatusReservoir(turb, tds, ph, temp);
  addRow("reservoir", [turb, ph, temp], status);
}

function dummyClearwell(){
  let zone = pickZone();
  let tds, turb, ec;
  if(zone === "normal"){
    tds  = rand(120, 250);
    turb = rand(0.5, 2.4);
    ec   = rand(150, 400);
  } else if(zone === "waspada"){
    tds  = rand(251, 269);
    turb = rand(2.6, 2.9);
    ec   = rand(401, 499);
  } else {
    tds  = rand(270, 350);
    turb = rand(3.0, 5.0);
    ec   = rand(500, 600);
  }
  let status = getStatusClearwell(turb, tds, 7, 28);
  addRow("clearwell", [tds, turb, ec], status);
}

function dummyFilter(n){
  let level = rand(20, 100, 1);
  let temp  = rand(27, 31, 1);
  let status = getStatusFilter(temp);
  addFilterRow("filter"+n, [level, temp], status);
}

function loadDummyData(){
  if(!dummyMode) return;
  dummyPra();
  dummyReservoir();
  dummySedimentasi("sed1");
  dummySedimentasi("sed2");
  dummyClearwell();
  [1,2,3,4,5].forEach(n => dummyFilter(n));
}

// ================= MONITORING INTERVAL =================
let monitoringInterval = null;

function startMonitoring(){
  if(monitoringInterval) return;
  monitoringInterval = setInterval(()=>{
    if(dummyMode) loadDummyData();
    else loadRealData();
  }, 10000);
}

function stopMonitoring(){
  clearInterval(monitoringInterval);
  monitoringInterval = null;
}

document.addEventListener("visibilitychange", function(){
  if(document.visibilityState === "visible") startMonitoring();
  else stopMonitoring();
});

window.onload = function(){
  clearAllTables();
  loadSavedMonitoring();
  if(dummyMode) loadDummyData();
  else loadRealData();
  startMonitoring();
};
```
