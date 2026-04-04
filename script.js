// ================= CHART GLOBAL =================
let chartInstance = null;
// ================= AUTO ACTION STATE =================
let lastActionPerUnit = {};
let lastStatusPerUnit = {};
// ================= PARAMETER MAP =================
const parameterMap = {
pra:[
{name:"Turbidity",col:1},
{name:"EC",col:2},
{name:"Temp",col:3}
],
reservoir:[
{name:"Turbidity",col:1},
{name:"pH",col:2},
{name:"Temp",col:3}
],
clearwell:[
{name:"TDS",col:1},
{name:"Turbidity",col:2},
{name:"EC",col:3}
],
sed1:[
{name:"Turbidity",col:1},
{name:"Temp",col:2},
{name:"EC",col:3},
{name:"pH",col:4}
],
sed2:[
{name:"Turbidity",col:1},
{name:"Temp",col:2},
{name:"EC",col:3},
{name:"pH",col:4}
]
};
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
// ================= TABLE =================
function tableTemplate(id, headers){
return `
<div id="${id}" class="tab-content ${id==='pra'?'active':''}">
<table>
<thead><tr>${headers.map(h=>`<th>${h}</th>`).join("")}</tr></thead>
<tbody id="${id}-body"></tbody>
</table>
</div>`;
}

document.getElementById("tables").innerHTML=
tableTemplate("pra",[
"Waktu","Turbidity","EC","Temp","TDS",
"Status","Solusi","Tindakan Operator"
]) +
tableTemplate("reservoir",[
"Waktu","Turbidity","pH","Temp",
"Status","Solusi","Tindakan Operator"
]) +
tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Solusi","Tindakan Operator"]) +
tableTemplate("sed1",["Waktu","Turbidity","Temp","EC","pH","Status","Solusi","Tindakan Operator"]) +
tableTemplate("sed2",["Waktu","Turbidity","Temp","EC","pH","Status","Solusi","Tindakan Operator"])
+
`<div id="filter" class="tab-content">

<div class="filter-wrapper">

<div class="filter-box">
<h4>Filter 1</h4>
<table>
<thead>
<tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr>
</thead>
<tbody id="filter1-body"></tbody>
</table>
</div>

<div class="filter-box">
<h4>Filter 2</h4>
<table>
<thead>
<tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr>
</thead>
<tbody id="filter2-body"></tbody>
</table>
</div>

<div class="filter-box">
<h4>Filter 3</h4>
<table>
<thead>
<tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr>
</thead>
<tbody id="filter3-body"></tbody>
</table>
</div>

<div class="filter-box">
<h4>Filter 4</h4>
<table>
<thead>
<tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr>
</thead>
<tbody id="filter4-body"></tbody>
</table>
</div>

<div class="filter-box">
<h4>Filter 5</h4>
<table>
<thead>
<tr><th>Waktu</th><th>Water Level</th><th>Temperatur</th><th>Status</th><th>Keterangan</th></tr>
</thead>
<tbody id="filter5-body"></tbody>
</table>
</div>

</div>
</div>`;

// ================= TAB =================
function openTab(evt, tabName){

// sembunyikan semua konten
document.querySelectorAll(".tab-content").forEach(function(tab){
tab.style.display = "none";
});

// hilangkan active dari semua tombol
document.querySelectorAll(".tab").forEach(function(btn){
btn.classList.remove("active");
});

// tampilkan yang dipilih
let selected = document.getElementById(tabName);
if(selected){
selected.style.display = "block";
}

// aktifkan tombol
evt.currentTarget.classList.add("active");
}

// ================= CLOCK =================
function updateClock(){
let now=new Date();
document.getElementById("clock").innerText=
now.toLocaleDateString('id-ID',{weekday:'long',year:'numeric',month:'long',day:'numeric'})
+" - "+now.toLocaleTimeString('id-ID');
}
setInterval(updateClock,1000); updateClock();

// ================= STATUS =================
function statusClass(s){return s==="Normal"?"normal":s==="Waspada"?"warning":"critical";}
function solusi(status, unit){

if(status === "Normal") return "Parameter aman";

// ================= PRA =================
if(unit === "pra"){
if(status === "Waspada"){
return `
<select>
<option>-- Pilih Tindakan --</option>
<option>Pembersihan sampah inlet</option>
<option>Monitoring turbidity tiap 30 menit</option>
<option>Pengurangan debit masuk</option>
</select>
`;
}
if(status === "Kritis"){
return `
<select>
<option>-- Pilih Tindakan --</option>
<option>Penutupan sementara intake</option>
<option>Pembersihan total saluran</option>
<option>Koordinasi teknisi lapangan</option>
</select>
`;
}
}

// ================= RESERVOIR =================
if(unit === "reservoir"){
if(status === "Waspada"){
return `
<select>
<option>-- Pilih Tindakan --</option>
<option>Penambahan klorin</option>
<option>Monitoring pH</option>
<option>Kontrol level air</option>
</select>
`;
}
if(status === "Kritis"){
return `
<select>
<option>-- Pilih Tindakan --</option>
<option>Shock chlorination</option>
<option>Pengurasan reservoir</option>
<option>Inspeksi kebocoran</option>
</select>
`;
}
}

// ================= CLEARWELL =================
if(unit === "clearwell"){
if(status === "Waspada"){
return `
<select>
<option>Monitoring TDS</option>
<option>Penyesuaian filtrasi</option>
</select>
`;
}
if(status === "Kritis"){
return `
<select>
<option>Flush sistem distribusi</option>
<option>Hentikan distribusi sementara</option>
</select>
`;
}
}

// ================= SED1 & SED2 =================
if(unit === "sed1" || unit === "sed2"){
if(status === "Waspada"){
return `
<select>
<option>Monitoring flokulasi</option>
<option>Penyesuaian dosis koagulan</option>
</select>
`;
}
if(status === "Kritis"){
return `
<select>
<option>Penambahan koagulan maksimal</option>
<option>Pemeriksaan sistem pengaduk</option>
</select>
`;
}
}

return "-";
}

// ================= AUDIO ALARM =================
let audioContext=null;
function initAudio(){
if(!audioContext){
audioContext=new(window.AudioContext||window.webkitAudioContext)();
}
}

function playBeep(duration,frequency){
if(!audioContext) return;
let osc=audioContext.createOscillator();
let gain=audioContext.createGain();
osc.connect(gain);
gain.connect(audioContext.destination);
osc.frequency.value=frequency;
osc.start();
gain.gain.setValueAtTime(1,audioContext.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+duration);
osc.stop(audioContext.currentTime+duration);
}

function triggerAlarm(status){
if(status==="Waspada") playBeep(0.3,600);
if(status==="Kritis"){
playBeep(0.5,900);
setTimeout(()=>playBeep(0.5,900),600);
}
}
// ================= ADD ROW =================
function addRow(id, values, status, waktu=null){

let tb=document.getElementById(id+"-body");
if(!tb) return;

let tr=tb.insertRow(0);

if(!waktu){
waktu = new Date().toLocaleTimeString('id-ID');
saveMonitoringData(id, values, status);
}

let actionButton = "-";

if(
(status === "Waspada" || status === "Kritis") &&
lastActionPerUnit[id] &&
lastStatusPerUnit[id] === status
){
actionButton = lastActionPerUnit[id];
}
else if(status === "Waspada" || status === "Kritis"){
actionButton = "<button onclick=\"openForm(this,'"+id+"','"+status+"')\">Isi Tindakan</button>";
}
// ================= RESET SAAT NORMAL =================
if(status === "Normal"){
lastActionPerUnit[id] = null;
lastStatusPerUnit[id] = null;
}
tr.innerHTML="<td>"+waktu+"</td>"+
values.map(v=>"<td>"+(v ?? "-")+"</td>").join("")+
"<td class='"+statusClass(status)+"'>"+status+"</td>"+
"<td>"+solusi(status,id)+"</td>"+
"<td>"+actionButton+"</td>";

limitRows(id);

// summary update
let sumId=null;
if(id==="pra") sumId="sum-pra";
else if(id==="reservoir") sumId="sum-res";
else if(id==="clearwell") sumId="sum-clear";
else if(id==="sed1") sumId="sum-sed1";
else if(id==="sed2") sumId="sum-sed2";

if(sumId){
document.getElementById(sumId).className="summary-box "+statusClass(status);
let labelMap = {
pra: "PRA-SED",
reservoir: "RESERVOIR",
clearwell: "CLEARWELL",
sed1: "SED-1",
sed2: "SED-2"
};

let label = labelMap[id] || id.toUpperCase();

document.getElementById(sumId).innerText = label + " : " + status;
triggerAlarm(status);
}
}
// ================= ADD FILTER ROW =================
function addFilterRow(id, values, status){

let tb = document.getElementById(id+"-body");
if(!tb) return;

let tr = tb.insertRow(0);

let waktu = new Date().toLocaleTimeString('id-ID');

tr.innerHTML =
"<td>"+waktu+"</td>"+
values.map(v=>"<td>"+(v ?? "-")+"</td>").join("")+
"<td class='"+statusClass(status)+"'>"+status+"</td>"+
"<td>"+solusi(status)+"</td>";

if(tb.rows.length > 20){
tb.deleteRow(20);
}
}
// ================= GOOGLE SHEET =================
const sheetURL="https://opensheet.elk.sh/1Ubreg7aI5_YOfasyBefWloo-SHB5YIaGr_aqXLUdnUI/Sheet1";

// ================= LOGIKA STATUS BERDASARKAN STANDAR =================

function getStatusPra(turb, tds, ph, temp){

let status = "Normal";

// TURBIDITY
if(turb > 40) return "Kritis";
if(turb >= 31) status = "Waspada";

// TDS
if(tds > 600) return "Kritis";
if(tds >= 501) status = "Waspada";

// PH
if(ph > 9) return "Kritis";
if(ph >= 8.5) status = "Waspada";

// SUHU
if(temp > 30) return "Kritis";
if(temp >= 28.5) status = "Waspada";

return status;
}

function getStatusSedimentasi(turb, tds, ph, temp){

let status = "Normal";

// TURBIDITY
if(turb >= 3) return "Kritis";
if(turb >= 2.6) status = "Waspada";

// TDS
if(tds > 270) return "Kritis";
if(tds >= 251) status = "Waspada";

// PH
if(ph > 9) return "Kritis";
if(ph >= 8.5) status = "Waspada";

// SUHU
if(temp > 30) return "Kritis";
if(temp >= 28.5) status = "Waspada";

return status;
}

function getStatusReservoir(turb, tds, ph, temp){

// sama seperti sedimentasi
return getStatusSedimentasi(turb, tds, ph, temp);

}
// ================= SAFE GET VALUE =================
function getVal(obj, key){
  return parseFloat(obj[key]) || 0;
}
async function loadRealData(){

if(dummyMode) return;

try{
const res = await fetch(sheetURL);
const data = await res.json();
if(data.length < 1) return;

let last = data[data.length-1];

// DEBUG sekali saja (boleh dihapus nanti)
console.log("KEY:", Object.keys(last));

// helper fleksibel (anti typo & spasi)
function val(...keys){
for(let k of keys){
if(last[k] !== undefined && last[k] !== ""){
return parseFloat(last[k]) || 0;
}
}
return 0;
}

// ================= PRA =================
let turbPra = val("Pra-Sed_Turbid");
let ecPra   = val("Pra-Sed_EC");
let tempPra = val("Pra-Sed_Temp");

let statusPra = getStatusPra(turbPra, 0, 7, tempPra);

addRow("pra",[turbPra,ecPra,tempPra,0],statusPra);


// ================= RESERVOIR =================
let turbRes = val("Reservoir_Turbid");
let tempRes = val("Reservoir_Temp") / 100;
let phRes   = val("Reservoir_Ph") / 100;

// normalisasi
if(tempRes > 100) tempRes /= 100;
if(phRes > 14) phRes /= 100;

let statusRes = getStatusReservoir(turbRes, 0, phRes, tempRes);

// SESUAI HEADER (3 kolom)
addRow("reservoir",[turbRes,phRes,tempRes],statusRes);


// ================= SEDIMENTASI =================
let turbSed = val("Sedimen_Turbid","Sedimen _Turbid");
let ecSed   = val("Sedimen_EC","Sedimen _EC");
let tempSed = val("Sedimen_Temp","Sedimen _Temp");
let phSed   = val("Sedimen_ph","Sedimen _ph");

let statusSed = getStatusSedimentasi(turbSed, 0, phSed, tempSed);

addRow("sed1",[turbSed,tempSed,ecSed,phSed],statusSed);
addRow("sed2",[turbSed,tempSed,ecSed,phSed],statusSed);


// ================= CLEARWELL =================
let turbClear = val("Clearwell_Turbid","Clearwell _Turbid");
let ecClear   = val("Clearwell_EC","Clearwell _EC");

addRow("clearwell",[0,turbClear,ecClear],"Normal");


// ================= FILTER =================
let f1_level = val("Filter1_Wat-level","Filter1_Wat_Level");
let f1_temp  = val("Filter1_Temp","Filter1 _Temp");

addFilterRow("filter1",[f1_level,f1_temp],"Normal");

let f4_level = val("Filter4_Wat-Level","Filter4_Wat_Level");
let f4_temp  = val("Filter4_Temp","Filter4 _Temp");

addFilterRow("filter4",[f4_level,f4_temp],"Normal");

}catch(err){
console.log("Error load sheet:",err);
}
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
function saveToHistory(unit,status,solusi,tindakan){
let h=JSON.parse(localStorage.getItem("historyLog"))||[];
h.unshift({waktu:new Date().toLocaleString("id-ID"),unit,status,solusi,tindakan});
localStorage.setItem("historyLog",JSON.stringify(h));
}

function openHistory(){
let h=JSON.parse(localStorage.getItem("historyLog"))||[];
let body=document.getElementById("historyBody");
if(!body) return;
body.innerHTML="";
h.forEach(i=>{
body.innerHTML+=`<tr>
<td>${i.waktu}</td>
<td>${i.unit}</td>
<td class="${statusClass(i.status)}">${i.status}</td>
<td>${i.solusi}</td>
<td>${i.tindakan}</td></tr>`;
});
document.getElementById("historyPopup").style.display="block";
}

function closeHistory(){
document.getElementById("historyPopup").style.display="none";
}

function clearHistory(){
localStorage.removeItem("historyLog");
openHistory();
}

// ================= CHART =================
function openChartPopup(){
document.getElementById("chartPopup").style.display="block";
updateParameterOptions();
}

function closeChartPopup(){
document.getElementById("chartPopup").style.display="none";
}

function updateParameterOptions(){
let unit=document.getElementById("chartUnit").value;
let select=document.getElementById("chartParameter");
if(!parameterMap[unit]) return;
select.innerHTML="";
parameterMap[unit].forEach(function(p){
let opt=document.createElement("option");
opt.value=p.col;
opt.text=p.name;
select.appendChild(opt);
});
}

function generateChart(){
let unit=document.getElementById("chartUnit").value;
let col=parseInt(document.getElementById("chartParameter").value);
let rows=document.getElementById(unit+"-body").rows;

if(!col){alert("Pilih parameter dulu");return;}
if(rows.length===0){alert("Belum ada data");return;}

let labels=[];
let data=[];

for(let i=rows.length-1;i>=0;i--){
labels.push(rows[i].cells[0].innerText);
data.push(parseFloat(rows[i].cells[col].innerText));
}

let ctx=document.getElementById("monitorChart").getContext("2d");

if(chartInstance) chartInstance.destroy();

chartInstance=new Chart(ctx,{
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
options:{
responsive:true,
maintainAspectRatio:false,
scales:{ y:{ beginAtZero:true } }
}
});
}

// ================= DOWNLOAD =================
function downloadData(){
let data=JSON.parse(localStorage.getItem("monitoringData"))||[];
if(data.length===0){alert("Tidak ada data");return;}

let limited=data.slice(0,500);

let rows=[["Waktu","Unit","Param1","Param2","Param3","Param4","Param5","Param6","Param7","Status"]];

limited.forEach(d=>{
let row=[new Date(d.waktu).toLocaleString("id-ID"),d.unit,...d.values];
while(row.length<9) row.push("");
row.push(d.status);
rows.push(row);
});

let wb=XLSX.utils.book_new();
let ws=XLSX.utils.aoa_to_sheet(rows);
XLSX.utils.book_append_sheet(wb,ws,"Monitoring");
XLSX.writeFile(wb,"Monitoring_Data.xlsx");
}

let selectedRow = null;
let selectedUnit = null;
let selectedStatus = null;

function openForm(button, unit, status){
selectedRow = button.parentElement.parentElement;
selectedUnit = unit;
selectedStatus = status;

document.getElementById("formInfo").innerText =
"Unit: "+unit.toUpperCase()+" | Status: "+status;

document.getElementById("actionText").value = "";
document.getElementById("actionForm").style.display="block";
}

function closeForm(){
document.getElementById("actionForm").style.display="none";
}

function saveAction(){
let text = document.getElementById("actionText").value;

if(!text){
alert("Isi tindakan dulu!");
return;
}
// isi ke tabel
selectedRow.cells[selectedRow.cells.length-1].innerHTML = text;
// ================= SIMPAN UNTUK AUTO =================
lastActionPerUnit[selectedUnit] = text;
// ================= SAVE HISTORY =================
saveToHistory(
selectedUnit,
selectedStatus,
solusi(selectedStatus),
text
);
closeForm();
}
selectedRow.cells[selectedRow.cells.length-1].innerHTML = text;
// simpan tindakan terakhir per unit
lastActionPerUnit[selectedUnit] = text;
saveToHistory(
selectedUnit,
selectedStatus,
solusi(selectedStatus),
text
);

closeForm();
}
function saveSolusi(selectElement, unit, status){

let value = selectElement.value;
if(!value) return;

let row = selectElement.closest("tr");

// ganti dropdown jadi teks setelah dipilih
selectElement.outerHTML = value;

// simpan ke history
saveToHistory(
unit,
status,
value,
"-"
);

}

function clearAllTables(){
["pra","reservoir","clearwell","sed1","sed2","filter1","filter2","filter3","filter4","filter5"].forEach(id=>{
let body = document.getElementById(id+"-body");
if(body) body.innerHTML="";
});
}

let monitoringInterval = null;

function startMonitoring(){
if(monitoringInterval) return;

monitoringInterval = setInterval(()=>{
loadRealData();
}, 60000);
}

function stopMonitoring(){
clearInterval(monitoringInterval);
monitoringInterval = null;
}

document.addEventListener("visibilitychange", function(){
if(document.visibilityState === "visible"){
startMonitoring();
}else{
stopMonitoring();
}
});

window.onload = function(){
clearAllTables();
startMonitoring();
};
// ================= STANDAR PARAMETER =================

function openStandar(){
document.getElementById("standarPopup").style.display="block";
}

function closeStandar(){
document.getElementById("standarPopup").style.display="none";
}
// ================= BackFill =================
function backfillAction(unit, status, text){

let tb = document.getElementById(unit + "-body");
if(!tb) return;

for(let i = 0; i < tb.rows.length; i++){

let row = tb.rows[i];

let rowStatus = row.cells[row.cells.length - 3].innerText;
let actionCell = row.cells[row.cells.length - 1];

if(
rowStatus === status &&
actionCell.innerHTML.includes("button")
){
actionCell.innerHTML = text;
}
}
}

