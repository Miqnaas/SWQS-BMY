"""FastAPI + same-origin browser research lab.
Run: uvicorn ml.api:app --host 127.0.0.1 --port 8000
"""
from __future__ import annotations
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, ConfigDict
import pandas as pd
from ml.predict import artifacts, predict_one
from ml.train import ROOT, RESULTS_DIR, FEATURES

app=FastAPI(title="Smart Water Quality — Prediction Lab",version="1.0",description="Educational; not a water-safety certification")
WEB=ROOT/"web"
app.mount("/assets",StaticFiles(directory=WEB/"assets"),name="assets")

class PredictionRequest(BaseModel):
    model_config=ConfigDict(extra="forbid")
    features:dict[str,float|None]

@app.get("/")
def index():
    return FileResponse(WEB/"index.html")

@app.get("/api/health")
def health():
    _,meta=artifacts()
    return {"status":"ok","model":meta["selected_model"],"feature_count":len(FEATURES),"research_only":True}

@app.get("/api/metadata")
def metadata():
    _,m=artifacts()
    return {
        "model":m["selected_model"],"features":m["features"],"dataset_samples":3276,
        "split":m["split"],"cross_validation":m["cross_validation"],
        "held_out_test":m["held_out_test"],"feature_ranges":m["training_feature_ranges"],
        "limitations":m["limitations"],"score_is_uncalibrated":True,
    }

@app.get("/api/samples")
def samples(limit:int=Query(default=12,ge=1,le=30),seed:int=Query(default=42,ge=0,le=100000)):
    demo=pd.read_csv(RESULTS_DIR/"heldout_demo_samples.csv")
    chosen=demo.sample(n=min(len(demo),limit),random_state=seed)
    records=[]
    for _,r in chosen.iterrows():
        vals={key:(None if pd.isna(r[key]) else float(r[key])) for key in FEATURES}
        records.append({"sample_id":int(r["sample_id"]),"features":vals,"actual_label":int(r["actual_potability"])})
    return {"source":"Held-out test records; original dataset measurements","samples":records}

@app.post("/api/predict")
def predict(request:PredictionRequest):
    try:
        return predict_one(request.features)
    except ValueError as exc:
        raise HTTPException(status_code=422,detail=str(exc)) from exc
