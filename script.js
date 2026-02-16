
// ================= CHART GLOBAL =================

let chartInstance = null;

const parameterMap = {
pra:[
{name:"Turbidity",col:1},
{name:"EC",col:2},
{name:"Temp",col:3},
{name:"TDS",col:4},
{name:"Debit",col:5}
],
reservoir:[
{name:"Turbidity",col:1},
{name:"pH",col:2},
{name:"Level",col:3},
{name:"Temp",col:4},
{name:"Cl",col:5},
{name:"Debit",col:6}
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
tableTemplate("pra",["Waktu","Turbidity","EC","Temp","TDS","Debit","Status","Solusi","Aksi","Tindakan Operator"]) +
tableTemplate("reservoir",["Waktu","Turbidity","pH","Level","Temp","Cl","Debit","Status","Solusi","Aksi","Tindakan Operator"]) +
tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Solusi","Aksi","Tindakan Operator"]) +
tableTemplate("sed1",["Waktu","Turbidity","Temp","EC","pH","Status","Solusi","Aksi","Tindakan Operator"]) +
tableTemplate("sed2",["Waktu","Turbidity","Temp","EC","pH","Status","Solusi","Aksi","Tindakan Operator"])+
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
</div>`

// ================= TAB =================
function openTab(evt,id){
document.querySelectorAll(".tab-content").forEach(t=>t.classList.remove("active"));
document.querySelectorAll(".tab").forEach(b=>b.classList.remove("active"));
document.getElementById(id).classList.add("active");
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

function timestamp(){return new Date().toLocaleTimeString('id-ID');}

// ================= STATUS =================
function statusClass(s){return s==="Normal"?"normal":s==="Waspada"?"warning":"critical";}
function solusi(s){
if(s==="Normal") return "Parameter aman";
if(s==="Waspada") return "Monitoring intensif";
return "Tindakan segera!";
}
function limitRows(id){
let tb=document.getElementById(id+"-body");
if(tb.rows.length>20) tb.deleteRow(20);
}

// ================= ALARM =================
let audioContext=null;
function initAudio(){if(!audioContext){audioContext=new(window.AudioContext||window.webkitAudioContext)();}}
function playBeep(d,f){
let osc=audioContext.createOscillator();
let gain=audioContext.createGain();
osc.connect(gain); gain.connect(audioContext.destination);
osc.frequency.value=f; osc.start();
gain.gain.setValueAtTime(1,audioContext.currentTime);
gain.gain.exponentialRampToValueAtTime(0.001,audioContext.currentTime+d);
osc.stop(audioContext.currentTime+d);
}
function triggerAlarm(status){
if(!audioContext) return;
if(status==="Waspada") playBeep(0.3,600);
if(status==="Kritis"){ playBeep(0.5,900); setTimeout(()=>playBeep(0.5,900),600); }
}

// ================= ACTION =================
let currentRow=null;
function openActionForm(row,unit,status){
currentRow=row;
document.getElementById("formInfo").innerText=unit+" | "+status;
document.getElementById("actionForm").style.display="block";
}
function closeForm(){document.getElementById("actionForm").style.display="none";}
function saveAction(){
let text=document.getElementById("actionText").value;
if(text==="") return alert("Isi tindakan dulu");
currentRow.cells[currentRow.cells.length-1].innerText=text;
saveToHistory(
document.getElementById("formInfo").innerText.split(" | ")[0],
document.getElementById("formInfo").innerText.split(" | ")[1],
currentRow.cells[currentRow.cells.length-3].innerText,
text);
document.getElementById("actionText").value="";
closeForm();
}

// ================= ADD ROW =================

function addRow(id,values,status){
let tb=document.getElementById(id+"-body");
let tr=tb.insertRow(0);

let aksi=status!=="Normal"
? `<button onclick="openActionForm(this.parentElement.parentElement,'${id.toUpperCase()}','${status}')">Input</button>`
: "-";

tr.innerHTML="<td>"+timestamp()+"</td>"+
values.map(v=>"<td>"+v+"</td>").join("")+
"<td class='"+statusClass(status)+"'>"+status+"</td>"+
"<td>"+solusi(status)+"</td>"+
"<td>"+aksi+"</td><td>-</td>";

limitRows(id);
}
let sumId = null;

if(id==="pra") sumId="sum-pra";
else if(id==="reservoir") sumId="sum-res";
else if(id==="clearwell") sumId="sum-clear";
else if(id==="sed1") sumId="sum-sed1";
else if(id==="sed2") sumId="sum-sed2";

if(sumId){
document.getElementById(sumId).className="summary-box "+statusClass(status);
document.getElementById(sumId).innerText=id.toUpperCase()+" : "+status;}

// ================= GOOGLE SHEET REAL DATA =================
const sheetURL = "https://opensheet.elk.sh/1wdgeQFJiY9Eoutit2PyLUFOAdh7hkE1RlFz80zc-GAE/Sheet1";

async function loadRealData(){
try{

const res = await fetch(sheetURL);
const data = await res.json();

if(data.length < 4) return;

// ambil baris terakhir
let last = data[data.length - 1];

// ================= PRA =================
addRow("pra",[
last["TURBIDITY_PRA"],
last["EC_PRA"],
last["TEMP_PRA"],
last["TDS_PRA"],
last["DEBIT_LS_PRA"],
last["DEBIT_M3_PRA"]
],"Normal");

// ================= RESERVOIR =================
addRow("reservoir",[
last["TURBIDITY_RES"],
last["PH_RES"],
last["LEVEL_RES"],
last["TEMP_RES"],
last["CL_RES"],
last["DEBIT_LS_RES"],
last["DEBIT_M3_RES"]
],"Normal");

// ================= CLEARWELL =================
addRow("clearwell",[
last["TDS_CLEAR"],
last["TURBIDITY_CLEAR"],
last["EC_CLEAR"]
],"Normal");

// ================= SED1 =================
addRow("sed1",[
last["TURBIDITY_SED1"],
last["TEMP_SED1"],
last["EC_SED1"],
last["PH_SED1"]
],"Normal");

// ================= SED2 =================
addRow("sed2",[
last["TURBIDITY_SED2"],
last["TEMP_SED2"],
last["EC_SED2"],
last["PH_SED2"]
],"Normal");

// ================= FILTER =================
addRow("filter1",[last["WL_F1"],last["TEMP_F1"]],"Normal");
addRow("filter2",[last["WL_F2"],last["TEMP_F2"]],"Normal");
addRow("filter3",[last["WL_F3"],last["TEMP_F3"]],"Normal");
addRow("filter4",[last["WL_F4"],last["TEMP_F4"]],"Normal");
addRow("filter5",[last["WL_F5"],last["TEMP_F5"]],"Normal");

}catch(err){
console.log("Error load sheet:",err);
}
}

window.onload = function(){
loadRealData();
setInterval(loadRealData,60000); // update tiap 1 menit
};

// ================= HISTORY =================
function saveToHistory(unit,status,solusi,tindakan){
let h=JSON.parse(localStorage.getItem("historyLog"))||[];
h.unshift({waktu:new Date().toLocaleString("id-ID"),unit,status,solusi,tindakan});
localStorage.setItem("historyLog",JSON.stringify(h));
}
function openHistory(){
let h=JSON.parse(localStorage.getItem("historyLog"))||[];
let body=document.getElementById("historyBody"); body.innerHTML="";
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
function closeHistory(){document.getElementById("historyPopup").style.display="none";}
function clearHistory(){localStorage.removeItem("historyLog"); openHistory();}

// ================= KRITIS POPUP =================
function showCriticalPopup(unit){
document.getElementById("criticalText").innerText="Unit: "+unit;
document.getElementById("criticalPopup").style.display="block";
}
function closeCriticalPopup(){document.getElementById("criticalPopup").style.display="none";}

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

if(!col){
alert("Pilih parameter dulu");
return;
}

if(rows.length===0){
alert("Belum ada data");
return;
}

let labels=[];
let data=[];

for(let i=rows.length-1;i>=0;i--){
labels.push(rows[i].cells[0].innerText);
data.push(parseFloat(rows[i].cells[col].innerText));
}

let ctx=document.getElementById("monitorChart").getContext("2d");

if(chartInstance){
chartInstance.destroy();
}

chartInstance=new Chart(ctx,{
type:'line',
data:{
labels:labels,
datasets:[{
label:document.getElementById("chartParameter").selectedOptions[0].text,
data:data,
borderColor:'#007bff',
backgroundColor:'rgba(0,123,255,0.2)',
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