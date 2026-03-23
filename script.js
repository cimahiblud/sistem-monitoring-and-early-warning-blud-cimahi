// ================= CHART GLOBAL =================
let chartInstance = null;

// ================= PARAMETER MAP =================
const parameterMap = {
pra:[
{name:"Turbidity",col:1},
{name:"EC",col:2},
{name:"Temp",col:3},
{name:"TDS",col:4},
{name:"Debit L/s",col:5},
{name:"Debit m3",col:6}
],
reservoir:[
{name:"Turbidity",col:1},
{name:"pH",col:2},
{name:"Level",col:3},
{name:"Temp",col:4},
{name:"Cl",col:5},
{name:"Debit L/s",col:6},
{name:"Debit m3",col:7}
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
"Debit L/s","Debit m3",
"Status","Solusi","Tindakan Operator"
]) +
tableTemplate("reservoir",[
"Waktu","Turbidity","pH","Level","Temp","Cl",
"Debit L/s","Debit m3",
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

if(status === "Waspada" || status === "Kritis"){
actionButton = "<button onclick=\"openForm(this,'"+id+"','"+status+"')\">Isi Tindakan</button>";
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
const sheetURL="https://opensheet.elk.sh/1wdgeQFJiY9Eoutit2PyLUFOAdh7hkE1RlFz80zc-GAE/Sheet1";

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
async function loadRealData(){

// ================= DUMMY MODE =================
if(dummyMode){

// nilai random agar terlihat realistis
let turbPra = (Math.random()*15).toFixed(2);
let ecPra = (200 + Math.random()*200).toFixed(0);
let tempPra = (25 + Math.random()*5).toFixed(1);
let tdsPra = (100 + Math.random()*200).toFixed(0);
let debitLS = (10 + Math.random()*5).toFixed(2);
let debitM3 = (800 + Math.random()*200).toFixed(0);

// LOGIKA STATUS BERDASARKAN TURBIDITY
let statusPra = "Normal";
if(turbPra > 5) statusPra = "Waspada";
if(turbPra > 10) statusPra = "Kritis";

addRow("pra",[turbPra,ecPra,tempPra,tdsPra,debitLS,debitM3],statusPra);

// reservoir dummy
let turbRes = (Math.random()*10).toFixed(2);
let statusRes = turbRes > 4 ? "Waspada" : "Normal";
if(turbRes > 8) statusRes = "Kritis";

addRow("reservoir",[turbRes,7.2,80,26,0.5,debitLS,debitM3],statusRes);

addRow("clearwell",[120,2,250],"Normal");
addRow("sed1",[4,26,200,7],"Normal");
addRow("sed2",[4,26,200,7],"Normal");

return; // hentikan supaya tidak fetch sheet
}

// ================= REAL DATA =================
try{
const res=await fetch(sheetURL);
const data=await res.json();
if(data.length<1) return;

let last=data[data.length-1];

// ================= PRA =================
let turbPra = parseFloat(last["TURBIDITY_PRA"]);
let tdsPra = parseFloat(last["TDS_PRA"]);
let phPra = parseFloat(last["PH_PRA"]);
let tempPra = parseFloat(last["TEMP_PRA"]);

let statusPra = getStatusPra(turbPra, tdsPra, phPra, tempPra);

addRow("pra",[
turbPra,
last["EC_PRA"],
tempPra,
tdsPra,
last["DEBIT_LS_PRA"],
last["DEBIT_M3_PRA"]
],statusPra);


// ================= RESERVOIR =================
let turbRes = parseFloat(last["TURBIDITY_RES"]);
let tdsRes = parseFloat(last["TDS_RES"]);
let phRes = parseFloat(last["PH_RES"]);
let tempRes = parseFloat(last["TEMP_RES"]);

let statusRes = getStatusReservoir(turbRes, tdsRes, phRes, tempRes);

addRow("reservoir",[
turbRes,
phRes,
last["LEVEL_RES"],
tempRes,
last["CL_RES"],
last["DEBIT_LS_RES"],
last["DEBIT_M3_RES"]
],statusRes);


// ================= SEDIMENTASI 1 =================
let turbSed1 = parseFloat(last["TURBIDITY_SED1"]);
let tdsSed1 = parseFloat(last["TDS_SED1"] || 0);
let phSed1 = parseFloat(last["PH_SED1"]);
let tempSed1 = parseFloat(last["TEMP_SED1"]);

let statusSed1 = getStatusSedimentasi(turbSed1, tdsSed1, phSed1, tempSed1);

addRow("sed1",[
turbSed1,
tempSed1,
last["EC_SED1"],
phSed1
],statusSed1);


// ================= SEDIMENTASI 2 =================
let turbSed2 = parseFloat(last["TURBIDITY_SED2"]);
let tdsSed2 = parseFloat(last["TDS_SED2"] || 0);
let phSed2 = parseFloat(last["PH_SED2"]);
let tempSed2 = parseFloat(last["TEMP_SED2"]);

let statusSed2 = getStatusSedimentasi(turbSed2, tdsSed2, phSed2, tempSed2);

addRow("sed2",[
turbSed2,
tempSed2,
last["EC_SED2"],
phSed2
],statusSed2);


// ================= CLEARWELL =================
addRow("clearwell",[
last["TDS_CLEAR"],
last["TURBIDITY_CLEAR"],
last["EC_CLEAR"]
],"Normal");


// ================= FILTER =================
addFilterRow("filter1",[last["WL_F1"],last["TEMP_F1"]],"Normal");
addFilterRow("filter2",[last["WL_F2"],last["TEMP_F2"]],"Normal");
addFilterRow("filter3",[last["WL_F3"],last["TEMP_F3"]],"Normal");
addFilterRow("filter4",[last["WL_F4"],last["TEMP_F4"]],"Normal");
addFilterRow("filter5",[last["WL_F5"],last["TEMP_F5"]],"Normal");

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

selectedRow.cells[selectedRow.cells.length-1].innerHTML = text;

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
