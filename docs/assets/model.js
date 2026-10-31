/* Exact RandomForest node structure exported from the fitted sklearn Pipeline.
   Client-only inference; all numbers originate from the training artifacts. */
const PHYSICOCHEMICAL_KEYS=['ph','Hardness','Solids','Chloramines','Sulfate','Conductivity','Organic_carbon','Trihalomethanes','Turbidity'];
const MISSING_ALLOWED=new Set(['ph','Sulfate','Trihalomethanes']);
const CAUTION='Research dataset classification only. This is not a laboratory test, does not certify drinking-water safety, and cannot be used to decide whether water is safe to drink.';
let config=null, trees=null, demoSamples=null;
const loadJSON=async path=>{const response=await fetch(path);if(!response.ok)throw Error('Unable to load '+path);return response.json()};
async function setupModel(){
 const [c, response, demo] = await Promise.all([loadJSON('./assets/model_manifest.json'),fetch('./assets/forest.bin.gz'),loadJSON('./assets/demo_samples.json')]);
 if(!response.ok)throw Error('Unable to load exported forest model');
 if(typeof DecompressionStream==='undefined')throw Error('This browser does not support gzip decompression. Use a current Chrome, Firefox, Safari or Edge.');
 const stream=response.body.pipeThrough(new DecompressionStream('gzip'));
 const buffer=await new Response(stream).arrayBuffer();
 const dv=new DataView(buffer);let off=0;
 const treeNum=dv.getUint32(off,true);off+=4;
 const parsed=[];
 for(let t=0;t<treeNum;t++){
  const n=dv.getUint32(off,true);off+=4;
  // Each node is exactly 28 bytes: left/right/feature int32, threshold/prob float64.
  const nodes=[];
  for(let k=0;k<n;k++){
   nodes.push({left:dv.getInt32(off,true),right:dv.getInt32(off+4,true),feature:dv.getInt32(off+8,true),threshold:dv.getFloat64(off+12,true),p1:dv.getFloat64(off+20,true)});
   off+=28;
  }
  parsed.push(nodes);
 }
 if(off!==buffer.byteLength||parsed.length!==160)throw Error('Model export data mismatch');
 config=c;trees=parsed;demoSamples=demo;
 return c;
}
function validateAndPrepare(values){
 if(!values||typeof values!=='object'||Array.isArray(values))throw Error('features must be a mapping of feature names to numbers');
 const keys=Object.keys(values);
 if(keys.length!==PHYSICOCHEMICAL_KEYS.length||PHYSICOCHEMICAL_KEYS.some(k=>!(k in values))||keys.some(k=>!PHYSICOCHEMICAL_KEYS.includes(k)))throw Error('Schema mismatch: exactly nine input features are required');
 const prepared=[];const warnings=[];
 PHYSICOCHEMICAL_KEYS.forEach((key,i)=>{
  let num=values[key];
  if(num===null||num===''){
   if(!MISSING_ALLOWED.has(key))throw Error(key+' is required and cannot be blank');
   warnings.push(key+': missing value replaced using the training-set median (not a measured value).');
   num=config.imputer_medians[i];
  }else{
   if(typeof num==='boolean'||typeof num==='object'||typeof num==='string'&&num.trim()==='')throw Error(key+' must be a finite numeric value');
   num=Number(num);
   if(!Number.isFinite(num))throw Error(key+' must be a finite numeric value');
   if(num<0)throw Error(key+' cannot be negative');
   if(key==='ph'&&num>14)throw Error('pH must be between 0 and 14 for this dataset');
   if(key==='ph'&&(num<2||num>12))warnings.push('Extreme pH value: verify measurement and calibration; dataset itself includes extreme records.');
   const range=config.training_feature_ranges[key];
   if(num<range.training_min||num>range.training_max)warnings.push(key+' is outside the training-data range; the prediction is extrapolative.');
  }
  prepared.push((num-config.scaler_means[i])/config.scaler_scales[i]);
 });
 return {prepared,warnings};
}
function scoreInput(values){
 if(!trees||!config)throw Error('Model is not loaded');
 const {prepared,warnings}=validateAndPrepare(values);
 let score=0;
 for(const tree of trees){
  let nodeId=0;
  while(tree[nodeId].left!==-1){const node=tree[nodeId];nodeId=prepared[node.feature]<=node.threshold?node.left:node.right;}
  score+=tree[nodeId].p1;
 }
 score/=trees.length;
 const predictedClass=score>0.5?1:0;
 return {predicted_class:predictedClass,predicted_label:predictedClass===1?'Potable (1) — dataset label only':'Not Potable (0) — dataset label only',class_1_model_score_uncalibrated:score,selected_model:config.selected_model,caution:CAUTION,limitations:config.limitations,input_warnings:warnings,not_a_safety_assessment:true};
}
const BrowserLab={setupModel,scoreInput,getConfig:()=>config,getSamples:()=>demoSamples};
if(typeof module!=='undefined')module.exports=BrowserLab;
