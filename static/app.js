// app.js — DIA PREDICT
// Communicates with Flask API: /api/train, /api/predict

const FEAT_NAMES = ['Pregnancies','Glucose','BloodPressure','SkinThickness','Insulin','BMI','PedigreeFunc','Age'];
let pyResults  = null;
let clientData = [];
let scatterChart = null;
let lcChart      = null;
let modelChart   = null;
let rocChart     = null;
let predHistory  = [];

// ── FEATURE TOGGLE INIT ────────────────────────────────────
function initFeatureToggles() {
  const wrap = document.getElementById('featureToggles');
  if (!wrap) return;
  wrap.innerHTML = FEAT_NAMES.map((name, i) => `
    <div class="form-check form-switch d-flex align-items-center justify-content-between py-1" style="border-bottom:1px solid #f1f5f9">
      <label class="form-check-label" style="font-size:.78rem;font-weight:600;cursor:pointer" for="ft_${i}">${name}</label>
      <input class="form-check-input ms-2" type="checkbox" id="ft_${i}" value="${i}" checked style="cursor:pointer">
    </div>`).join('');
}

function getSelectedFeatures() {
  const checked = [...document.querySelectorAll('#featureToggles input:checked')].map(el => +el.value);
  return checked.length >= 2 ? checked : null; // null = use all
}

// ── SPLIT SLIDER ───────────────────────────────────────────
function onSplitChange(val) {
  document.getElementById('splitLabel').textContent = `${val} / ${100 - val}`;
}

// ── TOAST ──────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  const container = document.querySelector('.toast-container');
  const el = document.createElement('div');
  el.className = `toast align-items-center text-white bg-${type} border-0 fade-in`;
  el.setAttribute('role','alert');
  el.innerHTML = `<div class="d-flex"><div class="toast-body">${msg}</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>`;
  container.appendChild(el);
  const t = new bootstrap.Toast(el);
  t.show();
  el.addEventListener('hidden.bs.toast', () => el.remove());
}

// ── LOAD CSV FOR STATIC CHARTS ─────────────────────────────
async function loadCSV() {
  try {
    const res  = await fetch('/static/diabetes.csv');
    const text = await res.text();
    clientData = text.trim().split('\n').slice(1).map(l => l.split(',').map(Number));
    drawStaticCharts();
    updateScatter();
  } catch(e) { console.warn('CSV load failed', e); }
}

// ── STATIC CHART HELPERS ───────────────────────────────────
const CD = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: { grid:{display:false}, ticks:{font:{size:9},color:'#94a3b8'} },
    y: { grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{size:9},color:'#94a3b8'} }
  }
};

function hist(data, col, bins, mn, mx) {
  const w = (mx - mn) / bins, c = new Array(bins).fill(0);
  data.forEach(r => { const b = Math.min(bins-1, Math.floor((r[col]-mn)/w)); if(b>=0) c[b]++; });
  return c;
}
function binLabels(n, mn, mx) { const w=(mx-mn)/n; return Array.from({length:n},(_,i)=>Math.round(mn+i*w)); }
function mean(arr, col) { return arr.reduce((s,r)=>s+r[col],0)/arr.length; }

function drawStaticCharts() {
  if (!clientData.length) return;
  const diabetic = clientData.filter(r=>r[8]===1);
  const healthy  = clientData.filter(r=>r[8]===0);

  new Chart(document.getElementById('donutChart'),{
    type:'doughnut',
    data:{datasets:[{data:[diabetic.length,healthy.length],backgroundColor:['#E1757D','#e2e8f0'],borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false}}}
  });
  new Chart(document.getElementById('glucoseChart'),{
    type:'bar',
    data:{labels:binLabels(10,50,200),datasets:[{data:hist(clientData,1,10,50,200),backgroundColor:'rgba(225,117,125,.7)',borderRadius:4,borderSkipped:false}]},
    options:{...CD}
  });
  new Chart(document.getElementById('bmiChart'),{
    type:'bar',
    data:{labels:binLabels(10,15,67),datasets:[{data:hist(clientData,5,10,15,67),backgroundColor:'rgba(100,116,139,.5)',borderRadius:4,borderSkipped:false}]},
    options:{...CD}
  });

  // Radar (always shown)
  const dm  = [0,1,2,3,4,5,6,7].map(i=>mean(diabetic,i));
  const hm  = [0,1,2,3,4,5,6,7].map(i=>mean(healthy,i));
  const nrm = dm.map((v,i)=>Math.max(v,hm[i]));
  new Chart(document.getElementById('radarChart'),{
    type:'radar',
    data:{labels:['Preg','Gluc','BP','Skin','Ins','BMI','DPF','Age'],datasets:[
      {label:'Diabetic',data:dm.map((v,i)=>v/nrm[i]*100),backgroundColor:'rgba(225,117,125,.18)',borderColor:'#E1757D',borderWidth:2,pointRadius:2},
      {label:'Healthy', data:hm.map((v,i)=>v/nrm[i]*100),backgroundColor:'rgba(100,116,139,.1)', borderColor:'#94a3b8',borderWidth:2,pointRadius:2}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:9},boxWidth:10,color:'#475569'}}},
      scales:{r:{ticks:{display:false},grid:{color:'rgba(0,0,0,.06)'},pointLabels:{font:{size:8},color:'#475569'}}}}
  });
}

// ── SCATTER ────────────────────────────────────────────────
function updateScatter() {
  if (!clientData.length) return;
  const xi = +document.getElementById('scatterX').value;
  const yi = +document.getElementById('scatterY').value;
  const scD = clientData.filter(r=>r[8]===1&&r[xi]>0&&r[yi]>0).map(r=>({x:r[xi],y:r[yi]}));
  const scH = clientData.filter(r=>r[8]===0&&r[xi]>0&&r[yi]>0).map(r=>({x:r[xi],y:r[yi]}));
  if (scatterChart) scatterChart.destroy();
  scatterChart = new Chart(document.getElementById('scatterChart'),{
    type:'scatter',
    data:{datasets:[
      {label:'Diabetic',data:scD,backgroundColor:'rgba(225,117,125,.5)',pointRadius:3.5,pointHoverRadius:6},
      {label:'Healthy', data:scH,backgroundColor:'rgba(100,116,139,.3)',pointRadius:3.5,pointHoverRadius:6}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:10},boxWidth:12,color:'#475569'}}},
      scales:{
        x:{grid:{display:false},ticks:{font:{size:9},color:'#94a3b8'},title:{display:true,text:FEAT_NAMES[xi],font:{size:10},color:'#94a3b8'}},
        y:{grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{size:9},color:'#94a3b8'},title:{display:true,text:FEAT_NAMES[yi],font:{size:10},color:'#94a3b8'}}
      }}
  });
}

// ── TRAIN ──────────────────────────────────────────────────
async function trainModels() {
  const btn = document.getElementById('trainBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Training…';
  document.getElementById('trainStatus').textContent = 'Training all 4 models…';

  // Collect parameters from UI controls
  const testSize = (100 - parseInt(document.getElementById('splitSlider').value)) / 100;
  const hyperparams = {
    svm_C:    parseFloat(document.getElementById('svmC').value),
    knn_k:    parseInt(document.getElementById('knnK').value),
    dt_depth: parseInt(document.getElementById('dtDepth').value),
  };
  const selectedFeatures = getSelectedFeatures();

  try {
    const res  = await fetch('/api/train', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ test_size: testSize, hyperparams, features: selectedFeatures })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    pyResults = data.results;

    // stats
    const keys = ['svm','lr','knn','dt'];
    document.getElementById('c-acc').textContent =
      (Math.max(...keys.map(k=>data.results[k].test_acc))*100).toFixed(1)+'%';
    document.getElementById('c-auc').textContent =
      Math.max(...keys.map(k=>data.results[k].roc_auc)).toFixed(3);
    document.getElementById('trainStatus').textContent =
      `✓ Trained on ${data.dataset.n_train} samples · tested on ${data.dataset.n_test} samples`;
    document.getElementById('modelSubtitle').textContent =
      `Trained on ${data.dataset.n_train} samples · tested on ${data.dataset.n_test} samples`;

    fillModelCards(data.results);
    fillFeatureTable(data.features);
    initModelBarChart(data.results);
    initROCChart(data.results);
    showCM('svm', null);
    showLC('svm', null);

    // enable predict
    const pb = document.getElementById('predictBtn');
    pb.disabled = false;
    pb.innerHTML = '<i class="fas fa-stethoscope me-2"></i>Analyse Patient Risk';

    btn.innerHTML = '<i class="fas fa-check me-2"></i>Retrain Models';
    btn.disabled  = false;
    showToast('✓ All 4 scikit-learn models trained successfully');

  } catch(err) {
    showToast(err.message, 'danger');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-play me-2"></i>Train All Models';
    document.getElementById('trainStatus').textContent = 'Training failed — check terminal';
  }
}

// ── FILL MODEL CARDS ───────────────────────────────────────
function fillModelCards(results) {
  const keys = ['svm','lr','knn','dt'];
  keys.forEach(k => {
    const r = results[k];
    document.getElementById('ma-'+k).textContent = (r.test_acc*100).toFixed(1)+'%';
    const wrap = document.getElementById(k+'-metrics');
    wrap.innerHTML = [
      {l:'Train Acc',  v:(r.train_acc*100).toFixed(1)+'%'},
      {l:'Test Acc',   v:(r.test_acc*100).toFixed(1)+'%'},
      {l:'F1 Score',   v:r.f1.toFixed(3)},
      {l:'ROC-AUC',    v:r.roc_auc.toFixed(3)},
      {l:'Precision',  v:r.precision.toFixed(3)},
      {l:'Recall',     v:r.recall.toFixed(3)},
    ].map(m=>`<div class="metric fade-in">
      <span class="metric-label">${m.l}</span>
      <span class="metric-value">${m.v}</span>
    </div>`).join('');
  });
}

// ── MODEL BAR CHART ────────────────────────────────────────
function initModelBarChart(results) {
  if (modelChart) modelChart.destroy();
  const wrap = document.getElementById('modelBarChart').parentElement;
  wrap.innerHTML = '<canvas id="modelBarChart"></canvas>';
  const keys = ['svm','lr','knn','dt'];
  modelChart = new Chart(document.getElementById('modelBarChart'),{
    type:'bar',
    data:{labels:['SVM','KNN','LogReg','DTree'],datasets:[
      {label:'Accuracy',data:keys.map(k=>+(results[k].test_acc*100).toFixed(1)),backgroundColor:'rgba(225,117,125,.8)',borderRadius:5,borderSkipped:false},
      {label:'F1',      data:keys.map(k=>+(results[k].f1*100).toFixed(1)),       backgroundColor:'rgba(59,130,246,.6)',  borderRadius:5,borderSkipped:false},
      {label:'ROC-AUC', data:keys.map(k=>+(results[k].roc_auc*100).toFixed(1)),  backgroundColor:'rgba(34,197,94,.6)',   borderRadius:5,borderSkipped:false},
    ]},
    options:{...CD,
      plugins:{legend:{display:true,position:'top',labels:{font:{size:10},boxWidth:12,color:'#475569'}}},
      scales:{...CD.scales,y:{...CD.scales.y,min:60,max:100}}
    }
  });
}

// ── CONFUSION MATRIX ───────────────────────────────────────
function showCM(key, btn) {
  document.querySelectorAll('#cmTabs .btn').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (!pyResults) return;
  const r  = pyResults[key];
  const cm = r.cm;
  document.getElementById('cm-tn').textContent = cm[0][0];
  document.getElementById('cm-fp').textContent = cm[0][1];
  document.getElementById('cm-fn').textContent = cm[1][0];
  document.getElementById('cm-tp').textContent = cm[1][1];
  const tbody = document.getElementById('cmTableBody');
  tbody.innerHTML = '';
  const rep = r.report;
  [
    {cls:'Healthy (0)',  p:rep['0'].precision,        rec:rep['0'].recall,        f1:rep['0']['f1-score'],        sup:rep['0'].support},
    {cls:'Diabetic (1)', p:rep['1'].precision,        rec:rep['1'].recall,        f1:rep['1']['f1-score'],        sup:rep['1'].support},
    {cls:'Accuracy',     p:'—',                       rec:'—',                    f1:r.test_acc,                  sup:rep['0'].support+rep['1'].support},
    {cls:'Macro Avg',    p:rep['macro avg'].precision,rec:rep['macro avg'].recall,f1:rep['macro avg']['f1-score'],sup:'—'},
  ].forEach(row => {
    const fmt = v => typeof v==='number'?(v>1?v:(v*100).toFixed(1)+'%'):v;
    const tr = document.createElement('tr');
    tr.innerHTML = `<td class="fw-semibold">${row.cls}</td><td>${fmt(row.p)}</td><td>${fmt(row.rec)}</td><td><strong style="color:var(--primary-color)">${fmt(row.f1)}</strong></td><td>${row.sup}</td>`;
    tbody.appendChild(tr);
  });
}

// ── LEARNING CURVE ─────────────────────────────────────────
function showLC(key, btn) {
  document.querySelectorAll('#lcTabs .btn').forEach(b=>b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (!pyResults) return;
  const lc = pyResults[key].lc;
  if (lcChart) lcChart.destroy();
  lcChart = new Chart(document.getElementById('lcChart'),{
    type:'line',
    data:{labels:lc.sizes,datasets:[
      {label:'Training',   data:lc.train_scores,borderColor:'#E1757D',backgroundColor:'rgba(225,117,125,.08)',borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#E1757D',tension:.35,fill:true},
      {label:'CV Validation',data:lc.val_scores,borderColor:'#3b82f6',backgroundColor:'rgba(59,130,246,.08)', borderWidth:2.5,pointRadius:4,pointBackgroundColor:'#3b82f6',tension:.35,fill:true}
    ]},
    options:{responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:false}},
      scales:{
        x:{title:{display:true,text:'Training Samples',font:{size:10},color:'#94a3b8'},grid:{display:false},ticks:{font:{size:9},color:'#94a3b8'}},
        y:{title:{display:true,text:'Accuracy',font:{size:10},color:'#94a3b8'},min:.5,max:1,grid:{color:'rgba(0,0,0,.04)'},ticks:{font:{size:9},color:'#94a3b8',callback:v=>(v*100).toFixed(0)+'%'}}
      }}
  });
}

// ── FEATURE TABLE ──────────────────────────────────────────
function fillFeatureTable(features) {
  const tbody = document.getElementById('ftBody');
  tbody.innerHTML = '';
  features.forEach((f, i) => {
    const d   = f.dM - f.hM;
    const pct = ((d / f.hM) * 100).toFixed(0);
    const tr  = document.createElement('tr');
    tr.innerHTML = `
      <td class="text-muted small">${i+1}</td>
      <td class="fw-semibold">${f.name}</td>
      <td style="color:var(--primary-color);font-weight:700">${f.imp.toFixed(3)}</td>
      <td><div class="imp-track"><div class="imp-fill" style="width:${f.imp*100}%"></div></div></td>
      <td style="color:var(--primary-color)">${f.dM.toFixed(2)}</td>
      <td class="text-muted">${f.hM.toFixed(2)}</td>
      <td style="color:${d>0?'#ef4444':'#22c55e'};font-weight:600">+${pct}%</td>`;
    tbody.appendChild(tr);
  });
}

// ── GAUGE ──────────────────────────────────────────────────
function updateGauge(p) {
  const c = p<.33?'#22c55e':p<.6?'#f59e0b':'#E1757D';
  document.getElementById('gaugePath').style.strokeDashoffset = 235.6*(1-p);
  document.getElementById('gaugePath').style.stroke = c;
  const a=Math.PI*(1-p), cx=85+75*Math.cos(Math.PI-a), cy=88-75*Math.sin(Math.PI-a);
  document.getElementById('gaugeNeedle').setAttribute('cx',cx);
  document.getElementById('gaugeNeedle').setAttribute('cy',cy);
  document.getElementById('gaugeNeedle').style.fill = c;
  document.getElementById('gaugePct').textContent = (p*100).toFixed(1)+'%';
  document.getElementById('gaugePct').style.color  = c;
}

// ── PREDICT ────────────────────────────────────────────────
async function runPrediction() {
  const vals = {
    pregnancies: +document.getElementById('f_preg').value,
    glucose:     +document.getElementById('f_gluc').value,
    bloodpressure:+document.getElementById('f_bp').value,
    skinthickness:+document.getElementById('f_skin').value,
    insulin:     +document.getElementById('f_ins').value,
    bmi:         +document.getElementById('f_bmi').value,
    diabetespedigreefunction:+document.getElementById('f_dpf').value,
    age:         +document.getElementById('f_age').value,
  };

  const btn = document.getElementById('predictBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Running…';
  document.getElementById('resultEmpty').style.display   = 'none';
  document.getElementById('resultContent').style.display = 'none';

  try {
    const res  = await fetch('/api/predict', {
      method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(vals)
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);

    const ens   = data.ensemble;
    const isPos = ens > 0.5;

    // Save history
    predHistory.push({vals, prob:ens, pos:isPos, probs:data.probs, preds:data.preds});
    renderHistory();

    // Update model cards live
    ['svm','lr','knn','dt'].forEach(k => {
      const prob = data.probs[k];
      const pred = data.preds[k];
      const wrap = document.getElementById(k+'-metrics');
      // remove old patient row if exists
      wrap.querySelectorAll('.patient-metric').forEach(el=>el.remove());
      const div = document.createElement('div');
      div.className = 'metric patient-metric fade-in';
      div.innerHTML = `<span class="metric-label">⚡ This Patient</span><span class="metric-value">${(prob*100).toFixed(1)}%</span>`;
      wrap.appendChild(div);

      const chip = document.getElementById('vc-'+k);
      chip.className = 'verdict-chip '+(pred===1?'risk':'safe');
      chip.textContent = pred===1 ? '⚠ Risk Detected' : '✓ Low Risk';

      const card = document.getElementById('mc-'+k);
      card.classList.add('updated');
      setTimeout(()=>card.classList.remove('updated'), 1000);
    });

    // scroll to results
    document.getElementById('sec-results').scrollIntoView({behavior:'smooth', block:'start'});

    setTimeout(() => {
      // outcome badge
      document.getElementById('outcomeBadge').innerHTML = `
        <div class="outcome-badge ${isPos?'pos':'neg'}">
          <i class="fas fa-${isPos?'exclamation-triangle':'check-circle'}"></i>
          ${isPos?'Elevated Risk Detected':'Low Diabetes Risk'}
          <span class="fw-normal ms-1 small">${(ens*100).toFixed(1)}%</span>
        </div>`;

      setTimeout(()=>updateGauge(ens), 80);

      // vote cards
      const vc = document.getElementById('voteCards');
      vc.innerHTML = '';
      const labels = {svm:'SVM',lr:'LogReg',knn:'KNN',dt:'DTree'};
      Object.entries(data.probs).forEach(([k,prob])=>{
        const pred = data.preds[k];
        const col  = document.createElement('div');
        col.className='col-6';
        col.innerHTML=`<div class="vote-card ${pred===1?'risk':'safe'}">
          <div class="vote-model">${labels[k]}</div>
          <div class="vote-prob">${(prob*100).toFixed(1)}%</div>
          <div class="small" style="color:${pred===1?'var(--primary-color)':'#15803d'}">${pred===1?'⚠ Risk':'✓ Safe'}</div>
        </div>`;
        vc.appendChild(col);
      });

      // analysis
      const flags = [];
      if(vals.glucose>126)  flags.push(`high glucose (${vals.glucose} mg/dL)`);
      if(vals.bmi>30)       flags.push(`elevated BMI (${vals.bmi})`);
      if(vals.age>40)       flags.push(`age risk (${vals.age}yr)`);
      if(vals.pregnancies>5)flags.push(`multiple pregnancies (${vals.pregnancies})`);
      if(vals.diabetespedigreefunction>.6) flags.push(`pedigree (${vals.diabetespedigreefunction})`);
      const votes = Object.values(data.preds).filter(v=>v===1).length;
      document.getElementById('analysisText').textContent = isPos
        ? `${votes}/4 models predict elevated risk. Key factors: ${flags.length?flags.join(', '):'combination of features'}. Ensemble probability: ${(ens*100).toFixed(1)}%. Clinical evaluation recommended.`
        : `${votes}/4 models predict low risk. Probability: ${(ens*100).toFixed(1)}%. ${flags.length?'Monitor: '+flags.join(', ')+'.':'All markers within typical range.'} Maintain routine check-ups.`;

      document.getElementById('resultContent').classList.add('fade-in');
      document.getElementById('resultContent').style.display = 'block';
      btn.disabled = false;
      btn.innerHTML = '<i class="fas fa-stethoscope me-2"></i>Analyse Patient Risk';
      showToast(`✓ Prediction: ${(ens*100).toFixed(1)}% risk — scroll up to see model cards`);
    }, 500);

  } catch(err) {
    showToast(err.message, 'danger');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-stethoscope me-2"></i>Analyse Patient Risk';
  }
}

// ── HISTORY ────────────────────────────────────────────────
function renderHistory() {
  const list = document.getElementById('historyList');
  if (!predHistory.length) {
    list.innerHTML = '<p class="text-muted text-center py-4">No analyses yet.</p>';
    return;
  }
  list.innerHTML = '';
  [...predHistory].reverse().forEach((h, i) => {
    const div = document.createElement('div');
    div.className = 'history-item fade-in';
    div.onclick = () => {
      const idx = predHistory.length - 1 - i;
      const hh  = predHistory[idx];
      document.getElementById('f_preg').value = hh.vals.pregnancies;
      document.getElementById('f_gluc').value = hh.vals.glucose;
      document.getElementById('f_bp').value   = hh.vals.bloodpressure;
      document.getElementById('f_skin').value = hh.vals.skinthickness;
      document.getElementById('f_ins').value  = hh.vals.insulin;
      document.getElementById('f_bmi').value  = hh.vals.bmi;
      document.getElementById('f_dpf').value  = hh.vals.diabetespedigreefunction;
      document.getElementById('f_age').value  = hh.vals.age;
      document.getElementById('sec-predict').scrollIntoView({behavior:'smooth'});
    };
    div.innerHTML = `
      <div>
        <div class="fw-semibold small mb-1">Glucose:${h.vals.glucose}  BMI:${h.vals.bmi}  Age:${h.vals.age}</div>
        <span class="hi-tag ${h.pos?'pos':'neg'}">${h.pos?'⚠ Elevated Risk':'✓ Low Risk'} · ${(h.prob*100).toFixed(1)}%</span>
      </div>
      <span class="text-muted small">#${predHistory.length - i}</span>`;
    list.appendChild(div);
  });
}

function clearHistory() { predHistory = []; renderHistory(); }

function exportCSV() {
  if (!predHistory.length) { alert('No predictions yet.'); return; }
  const hdr = 'Pregnancies,Glucose,BP,Skin,Insulin,BMI,Pedigree,Age,Result,Prob\n';
  const rows = predHistory.map(h =>
    [h.vals.pregnancies,h.vals.glucose,h.vals.bloodpressure,h.vals.skinthickness,
     h.vals.insulin,h.vals.bmi,h.vals.diabetespedigreefunction,h.vals.age,
     h.pos?1:0, h.prob.toFixed(3)].join(',')
  ).join('\n');
  const a = document.createElement('a');
  a.href = 'data:text/csv;charset=utf-8,'+encodeURIComponent(hdr+rows);
  a.download = 'predictions.csv';
  a.click();
}

// ── ROC CHART ──────────────────────────────────────────────
function initROCChart(results) {
  if (rocChart) rocChart.destroy();
  const wrap = document.getElementById('rocChart').parentElement;
  wrap.innerHTML = '<canvas id="rocChart"></canvas>';

  const colors = {
    svm: '#E1757D',
    lr:  '#3b82f6',
    knn: '#f59e0b',
    dt:  '#22c55e',
  };
  const labels = { svm: 'SVM', lr: 'LogReg', knn: 'KNN', dt: 'DTree' };

  const datasets = Object.entries(results).map(([key, r]) => ({
    label: `${labels[key]} (AUC ${r.roc_auc.toFixed(3)})`,
    data: r.roc.fpr.map((fpr, i) => ({ x: fpr, y: r.roc.tpr[i] })),
    borderColor: colors[key],
    backgroundColor: 'transparent',
    borderWidth: 2.5,
    pointRadius: 0,
    tension: 0.3,
  }));

  // Diagonal reference line
  datasets.push({
    label: 'Random (AUC 0.5)',
    data: [{x:0,y:0},{x:1,y:1}],
    borderColor: 'rgba(0,0,0,.2)',
    borderDash: [6, 4],
    borderWidth: 1.5,
    pointRadius: 0,
  });

  rocChart = new Chart(document.getElementById('rocChart'), {
    type: 'scatter',
    data: { datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      showLine: true,
      plugins: {
        legend: { display: true, position: 'top', labels: { font: { size: 10 }, boxWidth: 14, color: '#475569' } }
      },
      scales: {
        x: { min: 0, max: 1, title: { display: true, text: 'False Positive Rate', font: { size: 10 }, color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 9 }, color: '#94a3b8' } },
        y: { min: 0, max: 1, title: { display: true, text: 'True Positive Rate', font: { size: 10 }, color: '#94a3b8' }, grid: { color: 'rgba(0,0,0,.04)' }, ticks: { font: { size: 9 }, color: '#94a3b8' } },
      }
    }
  });
}

// ── INIT ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => { loadCSV(); initFeatureToggles(); });