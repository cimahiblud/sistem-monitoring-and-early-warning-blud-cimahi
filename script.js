
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

// ================= URUTAN PARAMETER PER TABEL =================
const colParams = {
  pra:       ["Turbidity", "EC",   "Temp", "TDS"],
  reservoir: ["Turbidity", "pH",   "Temp"],
  clearwell: ["TDS",       "Turbidity", "EC"],
  sed1:      ["Turbidity", "Temp", "EC",   "pH"],
  sed2:      ["Turbidity", "Temp", "EC",   "pH"],
  filter:    ["WaterLevel","Temp"]
};

// ================= THRESHOLD PARAMETER =================
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

function limitRows(id){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  while(tb.rows.length > 20){
    tb.deleteRow(tb.rows.length - 1);
  }
}

function tableTemplate(id, headers){
  return `
  <div id="${id}" class="tab-content ${id==='pra'?'active':''}">
    <table>
      <thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
      <tbody id="${id}-body"></tbody>
    </table>
  </div>`;
}

// Kolom tabel dengan header asli, disesuaikan dengan Penyebab Kejadian & Catatan 5W1H
document.getElementById("tables").innerHTML =
  tableTemplate("pra",      ["Waktu","Turbidity","EC","Temp","TDS","Status","Penyebab Kejadian","Catatan Tindakan Operator"]) +
  tableTemplate("reservoir",["Waktu","Turbidity","pH","Temp","Status","Penyebab Kejadian","Catatan Tindakan Operator"]) +
  tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Penyebab Kejadian","Catatan Tindakan Operator"]) +
  tableTemplate("sed1",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan Tindakan Operator"]) +
  tableTemplate("sed2",     ["Waktu","Turbidity","Temp","EC","pH","Status","Penyebab Kejadian","Catatan Tindakan Operator"]) +
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

function updateClock(){
  let now = new Date();
  let clockEl = document.getElementById("clock");
  if(clockEl){
    clockEl.innerText =
      now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
      +" - "+now.toLocaleTimeString('id-ID');
  }
}
setInterval(updateClock, 1000);
updateClock();

function statusClass(s){ return s==="Normal"?"normal":s==="Waspada"?"warning":"critical"; }

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

function getPenyebabOptions(unit, params, values, status){
  if(status === "Normal") return "-";
  
  let unitMap = penyebabKejadianMap[unit];
  if(!unitMap) return "-";
  
  let allOptions = new Set();
  Object.values(unitMap).forEach(arr => {
    if(Array.isArray(arr)){
      arr.forEach(o => {
        if(o !== "-- Pilih Penyebab --") allOptions.add(o);
      });
    }
  });
  
  if(allOptions.size === 0) return "-";
  
  let opts = `<option>-- Pilih Penyebab --</option>`;
  allOptions.forEach(o => { opts += `<option>${o}</option>`; });
  
  return `<select onchange="savePenyebab(this,'${unit}','${status}')">${opts}</select>`;
}

function savePenyebab(selectEl, unit, status){
  let penyebab = selectEl.value;
  let row = selectEl.closest("tr");
  if(!row) return;
  
  let penyebabCell = row.cells[row.cells.length - 2];
  if(penyebabCell){
    penyebabCell.innerText = penyebab;
  }
  
  let values = [];
  for(let i = 1; i <= row.cells.length - 4; i++){
    values.push(row.cells[i].innerText);
  }
  
  saveMonitoringData(unit, values, status, penyebab, null);
}

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
      actionButton = `<button onclick="openForm(this,'${id}','${status}')" style="background:#28a745;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Lihat 5W1H</button>`;
    } else {
      actionButton = `<button onclick="openForm(this,'${id}','${status}')" style="background:#ffc107;color:#000;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;font-weight:bold;">Isi Catatan</button>`;
    }
  }

  let params = colParams[id] || [];
  let valuesHtml = values.map((v, i) => {
    let pname = params[i];
    let cls   = paramClass(id, pname, v);
    return "<td class='"+cls+"'>"+(v ?? "-")+"</td>";
  }).join("");

  let penyebabCellContent = (penyebab && penyebab !== "-") ? penyebab : getPenyebabOptions(id, params, values, status);

  tr.innerHTML = "<td>"+waktu+"</td>" +
    valuesHtml +
    "<td class='"+statusClass(status)+"'>"+status+"</td>" +
    "<td>"+penyebabCellContent+"</td>" +
    "<td>"+actionButton+"</td>";

  limitRows(id);

  let sumId = null;
  if(id==="pra")            sumId="sum-pra";
  else if(id==="reservoir") sumId="sum-res";
  else if(id==="clearwell") sumId="sum-clear";
  else if(id==="sed1")      sumId="sum-sed1";
  else if(id==="sed2")      sumId="sum-sed2";

  if(sumId){
    let labelMap = {pra:"Pra",reservoir:"Reservoir",clearwell:"Clearwell",sed1:"Sed1",sed2:"Sed2"};
    let label = labelMap[id] || id;
    let sumEl = document.getElementById(sumId);
    if(sumEl){
      sumEl.className = "summary-box "+statusClass(status);
      sumEl.innerText = label+" : "+status;
    }
    triggerAlarm(status);
  }
}

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

const sheetURL = "https://opensheet.elk.sh/14i8S-08Yg3Vn_WFA6Ny_4uJ2stTzL9rvrTP0Qt0bCmQ/Sheet1";

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

let lastFetchedWaktu = null;
async function loadRealData(){
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

// ================= FORM 5W1H =================
let selectedRow    = null;
let selectedUnit   = null;
let selectedStatus = null;

function openForm(button, unit, status){
  selectedRow    = button.parentElement.parentElement;
  selectedUnit   = unit;
  selectedStatus = status;

  let formEl = document.getElementById("actionForm");
  if(!formEl) return;

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

  let mapData = penyebabKejadianMap[unit];
  let options = [];
  if(mapData && typeof mapData === "object" && Object.keys(mapData).length > 0){
    let uniqueSet = new Set();
    Object.values(mapData).forEach(arr => {
      if(Array.isArray(arr)){
        arr.forEach(item => uniqueSet.add(item));
      }
    });
    options = Array.from(uniqueSet);
  }

  let optionsHtml = options.map(opt => `<option value="${opt}">${opt}</option>`).join("");

  formEl.innerHTML = `
    <h3>Form Catatan Operator & Analisis </h3>
    <p id="formInfo">Unit: ${unit.toUpperCase()} | Status: ${status}</p>
    
    <div style="margin-bottom:10px;">
      <label style="font-weight:bold;font-size:12px;display:block;margin-bottom:3px;">Pilih Penyebab Kejadian:</label>
      <select id="selectPenyebab" style="width:100%;padding:6px;font-size:12px;">${optionsHtml}</select>
    </div>
    
    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">1. Parameter apa yang diperbaiki?</label>
      <input type="text" id="f_q1" value="${affectedParam} pada Unit ${unit.toUpperCase()} bernilai ${status}" style="width:100%;padding:5px;font-size:11px;">
    </div>

    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">2. Bagaimana melakukan tindakan tersebut? (Langkah Penanganan)</label>
      <textarea id="f_q2" rows="2" style="width:100%;height:50px;font-size:11px;" placeholder="Tulis langkah perbaikan..."></textarea>
    </div>

    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">3. Di mana lokasi tindakan perbaikan?</label>
      <input type="text" id="f_lokasi" placeholder="Masukkan lokasi perbaikan..." style="width:100%;padding:5px;font-size:11px;">
    </div>

    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">4. Kapan tindakan tersebut dilakukan?</label>
      <input type="text" id="f_waktu" value="${new Date().toISOString().slice(0,16)}" style="width:100%;padding:5px;font-size:11px;">
    </div>

    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">5. Operator:</label>
      <input type="text" id="f_q5" placeholder="Nama operator..." style="width:100%;padding:3px;font-size:11px;">
    </div>
    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">6. Analis :</label>
      <input type="text" id="f_analis" placeholder="Nama analis..." style="width:100%;padding:3px;font-size:11px;">
    </div>
    <div style="margin-bottom:6px;">
      <label style="font-size:11px;">7. Penanggung Jawab :</label>
      <input type="text" id="f_pj" placeholder="Nama penanggung jawab..." style="width:100%;padding:3px;font-size:11px;">
    </div>

    <br>
    <button onclick="saveAction()" style="background:#28a745;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;">Simpan</button>
    <button onclick="closeForm()" style="background:#6c757d;color:white;border:none;padding:6px 12px;border-radius:4px;cursor:pointer;margin-left:5px;">Batal</button>
  `;
  formEl.style.display = "block";
}

function closeForm(){ 
  let formEl = document.getElementById("actionForm");
  if(formEl) formEl.style.display = "none"; 
}

function saveAction(){
  let penyebab = document.getElementById("selectPenyebab")?.value || "-";
  let q1 = document.getElementById("f_q1")?.value || "";
  let q2 = document.getElementById("f_q2")?.value || "";
  let lokasi = document.getElementById("f_lokasi")?.value || "";
  let waktuTindakan = document.getElementById("f_waktu")?.value || "";
  let operator = document.getElementById("f_q5")?.value || "";
  let analis = document.getElementById("f_analis")?.value || "";
  let pj = document.getElementById("f_pj")?.value || "";

  if(!q2){
    alert("Langkah penanganan (Q2) wajib diisi!");
    return;
  }

  let form5w1hData = { 
    q1_parameter: q1, 
    q2_langkah: q2, 
    q3_lokasi: lokasi, 
    q4_waktu: waktuTindakan, 
    q5_operator: operator, 
    q6_analis: analis, 
    q7_manajer: pj 
  };

  selectedRow.cells[selectedRow.cells.length-2].innerText = penyebab;
  selectedRow.cells[selectedRow.cells.length-1].innerHTML = `<button onclick="openForm(this,'${selectedUnit}','${selectedStatus}')" style="background:#28a745;color:white;border:none;padding:4px 8px;border-radius:4px;cursor:pointer;">Lihat 5W1H</button>`;

  saveToHistory(selectedUnit, selectedStatus, penyebab, form5w1hData);
  
  let data = JSON.parse(localStorage.getItem("monitoringData")) || [];
  if(data.length > 0){
    data[0].penyebab = penyebab;
    data[0].form5w1h = form5w1hData;
    localStorage.setItem("monitoringData", JSON.stringify(data));
  }

  closeForm();
  alert("Catatan 5W1H & Penyebab Kejadian berhasil disimpan!");
}

function openStandar(){ 
  let popup = document.getElementById("standarPopup");
  if(popup) popup.style.display = "block"; 
}
function closeStandar(){ 
  let popup = document.getElementById("standarPopup");
  if(popup) popup.style.display = "none"; 
}

function clearAllTables(){
  ["pra","reservoir","clearwell","sed1","sed2","filter1","filter2","filter3","filter4","filter5"].forEach(id=>{
    let body = document.getElementById(id+"-body");
    if(body) body.innerHTML = "";
  });
}

let monitoringInterval = null;

function startMonitoring(){
  if(monitoringInterval) return;
  monitoringInterval = setInterval(()=>{
    loadRealData();
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
  loadRealData();
  startMonitoring();
};
