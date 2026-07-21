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

// ================= LIMIT ROWS =================
function limitRows(id){
  let tb = document.getElementById(id+"-body");
  if(!tb) return;
  while(tb.rows.length > 20){
    tb.deleteRow(tb.rows.length - 1);
  }
}

// ================= MODE =================
// Ganti ke false untuk menggunakan data real dari Google Sheets
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
  tableTemplate("pra",["Waktu","Turbidity","EC","Temp","TDS","Status","Solusi","Tindakan Operator"]) +
  tableTemplate("reservoir",["Waktu","Turbidity","pH","Temp","Status","Solusi","Tindakan Operator"]) +
  tableTemplate("clearwell",["Waktu","TDS","Turbidity","EC","Status","Solusi","Tindakan Operator"]) +
