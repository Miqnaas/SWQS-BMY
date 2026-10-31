"""Strict nine-feature research inference. Never load untrusted .joblib files."""
from __future__ import annotations
import json, math
from functools import lru_cache
import joblib
import numpy as np
import pandas as pd
from ml.train import FEATURES, MODEL_DIR

MISSING_ALLOWED={"ph","Sulfate","Trihalomethanes"}
CAUTION=("Research dataset classification only. This is not a laboratory test, "
         "does not certify drinking-water safety, and must not be used to decide if water is safe to drink.")

@lru_cache(maxsize=1)
def artifacts():
    metrics=json.loads((MODEL_DIR/"model_metrics.json").read_text(encoding="utf-8"))
    fitted=joblib.load(MODEL_DIR/"trained_pipeline.joblib")
    if list(metrics["features"])!=FEATURES:
        raise RuntimeError("Model and feature contract differ")
    if list(fitted.feature_names_in_)!=FEATURES:
        raise RuntimeError("Serialized pipeline feature order differs")
    return fitted,metrics

def normalize_features(values):
    if not isinstance(values,dict):
        raise ValueError("features must be a mapping of feature names to numbers")
    missing_keys=set(FEATURES)-set(values)
    extra_keys=set(values)-set(FEATURES)
    if missing_keys or extra_keys:
        raise ValueError(f"Schema mismatch. Missing: {sorted(missing_keys)}; extra: {sorted(extra_keys)}")
    cleaned={}
    warnings=[]
    for key in FEATURES:
        raw=values[key]
        if raw is None or raw=="":
            if key not in MISSING_ALLOWED:
                raise ValueError(f"{key} is required and cannot be blank")
            cleaned[key]=np.nan
            warnings.append(f"{key}: missing value replaced with training-set median (not a measured value).")
            continue
        if isinstance(raw,bool) or isinstance(raw,(dict,list)):
            raise ValueError(f"{key} must be finite numeric")
        try:
            num=float(raw)
        except (TypeError,ValueError):
            raise ValueError(f"{key} must be finite numeric") from None
        if not math.isfinite(num):
            raise ValueError(f"{key} must be finite numeric")
        if num<0:
            raise ValueError(f"{key} cannot be negative")
        if key=="ph" and num>14:
            raise ValueError("pH must be between 0 and 14 for this dataset")
        if key=="ph" and (num<2 or num>12):
            warnings.append("Extreme pH: verify measurement and calibration.")
        cleaned[key]=num
    return cleaned,warnings

def predict_one(values):
    normalized,warnings=normalize_features(values)
    fitted,details=artifacts()
    frame=pd.DataFrame([normalized],columns=FEATURES)
    for key,num in normalized.items():
        if np.isnan(num):
            continue
        r=details["training_feature_ranges"][key]
        if num<r["training_min"] or num>r["training_max"]:
            warnings.append(f"{key} is outside the training-data range.")
    predicted=int(fitted.predict(frame)[0])
    scores=fitted.predict_proba(frame)[0] if hasattr(fitted,"predict_proba") else None
    class1score=None if scores is None else float(scores[list(fitted.classes_).index(1)])
    return {
        "predicted_class":predicted,
        "predicted_label":"Potable (1) — dataset label only" if predicted else "Not Potable (0) — dataset label only",
        "class_1_model_score_uncalibrated":class1score,
        "selected_model":details["selected_model"],
        "caution":CAUTION,
        "limitations":details["limitations"],
        "input_warnings":warnings,
        "not_a_safety_assessment":True,
    }
