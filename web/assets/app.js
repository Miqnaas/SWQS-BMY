"use strict";
const features=[
 ["ph","pH"],["Hardness","Hardness"],["Solids","Solids / TDS"],["Chloramines","Chloramines"],
 ["Sulfate","Sulfate"],["Conductivity","Conductivity"],["Organic_carbon","Organic carbon"],
 ["Trihalomethanes","Trihalomethanes"],["Turbidity","Turbidity"]
];
const defaults={ph:7.04,Hardness:196.97,Solids:20927.83,Chloramines:7.13,Sulfate:333.07,Conductivity:421.88,Organic_carbon:14.22,Trihalomethanes:66.62,Turbidity:3.96};
const el=id=>document.getElementById(id);
let samples=[],active=null;
const pct=v=>Number.isFinite(Number(v))?(100*v).toFixed(2)+"%":"—";
async function getJson(url,opts){
 const res=await fetch(url,opts);
 const body=await res.json();
 if(!res.ok)throw new Error(typeof body.detail==="string"?body.detail:"HTTP "+res.status);
 return body;
}
function showError(message){el("error").hidden=false;el("error").textContent=message;}
function clearError(){el("error").hidden=true;el("error").textContent="";}
function fillForm(values){
 features.forEach(([key])=>{el("input-"+key).value=values[key]===null||values[key]===undefined?"":values[key];});
}
function createForm(){
 const parent=el("featureFields");
 features.forEach(([key,label])=>{
  const container=document.createElement("label");container.className="field";
  const title=document.createElement("span");title.textContent=label;
  const input=document.createElement("input");input.type="number";input.step="any";input.id="input-"+key;input.value=defaults[key];
  input.addEventListener("input",()=>{active=null;el("sampleSelect").value="";});
  container.append(title,input);parent.appendChild(container);
 });
 el("sampleSelect").addEventListener("change",event=>{
  const idx=event.target.value;
  active=idx===""?null:samples[Number(idx)];
  if(active){fillForm(active.features);clearError();}
 });
 el("predictForm").addEventListener("submit",submitPrediction);
}
async function submitPrediction(event){
 event.preventDefault();clearError();
 const vals={};
 for(const [key] of features){
  const raw=el("input-"+key).value.trim();
  if(!raw&&!["ph","Sulfate","Trihalomethanes"].includes(key)){showError(key+" is required.");return;}
  vals[key]=raw===""?null:Number(raw);
  if(raw!==""&&!Number.isFinite(vals[key])){showError(key+" must be a number.");return;}
 }
 const button=el("predictBtn");
 button.disabled=true;button.textContent="Running prediction…";
 try{
  const out=await getJson("/api/predict",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({features:vals})});
  el("resultEmpty").hidden=true;el("resultBody").hidden=false;
  el("predictedLabel").textContent=out.predicted_label;
  el("predictedLabel").dataset.class=String(out.predicted_class);
  const score=out.class_1_model_score_uncalibrated;
  el("scoreValue").textContent=score==null?"Unavailable":pct(score);
  el("scoreBar").style.width=score==null?"0%":pct(score);
  el("actualLabel").hidden=!active;
  if(active)el("actualLabel").textContent="Original held-out dataset label: "+active.actual_label+" (not a certified safety test).";
  el("warnings").replaceChildren();
  (out.input_warnings||[]).forEach(w=>{
    const p=document.createElement("p");p.textContent="⚠ "+w;el("warnings").appendChild(p);
  });
 }catch(err){showError(err.message||String(err));}
 finally{button.disabled=false;button.textContent="Run research prediction →";}
}
function renderMetadata(meta){
 el("chosenModel").textContent=meta.model||"Unknown";
 el("balancedAccuracy").textContent=pct(meta.held_out_test?.balanced_accuracy);
 const parent=el("cvBars");parent.replaceChildren();
 (meta.cross_validation||[]).slice().sort((a,b)=>b.cv_balanced_accuracy_mean-a.cv_balanced_accuracy_mean).forEach(row=>{
  const outer=document.createElement("div");outer.className="bar-row";
  const top=document.createElement("div");top.className="bar-top";
  const name=document.createElement("span");name.textContent=row.model;
  const val=document.createElement("strong");val.textContent=pct(row.cv_balanced_accuracy_mean);
  top.append(name,val);
  const track=document.createElement("div");track.className="bar-track";
  const bar=document.createElement("span");bar.style.width=pct(row.cv_balanced_accuracy_mean);
  track.append(bar);outer.append(top,track);parent.appendChild(outer);
 });
 const cm=meta.held_out_test?.confusion_matrix||[[null,null],[null,null]];
 el("cm00").textContent=cm[0][0]??"—";
 el("cm01").textContent=cm[0][1]??"—";
 el("cm10").textContent=cm[1][0]??"—";
 el("cm11").textContent=cm[1][1]??"—";
}
async function loadSamples(){
 try{
  const out=await getJson("/api/samples?limit=16&seed=42");
  samples=out.samples||[];
  samples.forEach((record,i)=>{
   const option=document.createElement("option");
   option.value=String(i);option.textContent="Sample "+record.sample_id+" · actual "+record.actual_label;
   el("sampleSelect").appendChild(option);
  });
 }catch{el("sampleSelect").innerHTML='<option value="">Samples require training</option>';}
}
async function init(){
 createForm();
 try{
  const [health,meta]=await Promise.all([getJson("/api/health"),getJson("/api/metadata")]);
  el("connection").textContent=health.model+" · connected";
  renderMetadata(meta);
  await loadSamples();
 }catch(err){
  el("connection").textContent="Model unavailable — train and start Python";
  el("cvBars").textContent="Training artifacts not loaded.";
  showError(err.message||String(err));
 }
}
document.addEventListener("DOMContentLoaded",init);
