"""Reproducible, leakage-safe benchmark and held-out evaluation.
Research labels are not safety certifications.
Run from root: python -m ml.train
"""
from __future__ import annotations
import hashlib, json, platform
from pathlib import Path
import joblib
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import sklearn
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, balanced_accuracy_score, classification_report, confusion_matrix,
    f1_score, precision_score, recall_score, roc_auc_score, ConfusionMatrixDisplay, make_scorer
)
from sklearn.model_selection import StratifiedKFold, cross_validate, train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

ROOT=Path(__file__).resolve().parents[1]
DATA_FILE=ROOT/"data"/"water_potability.csv"
MODEL_DIR=ROOT/"models"
RESULTS_DIR=ROOT/"results"
FEATURES=["ph","Hardness","Solids","Chloramines","Sulfate","Conductivity","Organic_carbon","Trihalomethanes","Turbidity"]
TARGET="Potability"
SEED=42
CLASS_LABELS=["Not Potable (0)","Potable (1)"]

def load_data():
    df=pd.read_csv(DATA_FILE)
    if list(df.columns)!=FEATURES+[TARGET]:
        raise ValueError("CSV schema mismatch: expected nine features plus Potability")
    if df[TARGET].isna().any() or set(df[TARGET].unique())!={0,1}:
        raise ValueError("Expected complete binary target 0/1")
    if not all(pd.api.types.is_numeric_dtype(df[f]) for f in FEATURES):
        raise ValueError("All nine features must be numeric")
    return df

def make_split(df):
    return train_test_split(df[FEATURES],df[TARGET],test_size=.2,random_state=SEED,stratify=df[TARGET])

def build_candidates():
    models={
        "DummyClassifier":DummyClassifier(strategy="most_frequent"),
        "Logistic Regression":LogisticRegression(max_iter=1800,random_state=SEED),
        "K-Nearest Neighbors":KNeighborsClassifier(n_neighbors=15),
        "Support Vector Machine":SVC(C=1.0,kernel="rbf",probability=True,random_state=SEED),
        "Random Forest":RandomForestClassifier(n_estimators=160,min_samples_leaf=3,random_state=SEED,n_jobs=1),
    }
    return {name:Pipeline([("imputer",SimpleImputer(strategy="median")),("scaler",StandardScaler()),("classifier",model)]) for name,model in models.items()}

def benchmark_models(X_train,y_train):
    scoring={
        "accuracy":"accuracy",
        "balanced_accuracy":"balanced_accuracy",
        "macro_f1":make_scorer(f1_score,average="macro",zero_division=0),
        "recall_not_potable":make_scorer(recall_score,pos_label=0,zero_division=0),
        "recall_potable":make_scorer(recall_score,pos_label=1,zero_division=0),
        "roc_auc":"roc_auc",
    }
    cv=StratifiedKFold(n_splits=5,shuffle=True,random_state=SEED)
    rows=[]
    for name,pipeline in build_candidates().items():
        scores=cross_validate(pipeline,X_train,y_train,cv=cv,scoring=scoring,n_jobs=2,error_score="raise")
        row={"model":name}
        for metric in scoring:
            row[f"cv_{metric}_mean"]=float(np.mean(scores[f"test_{metric}"]))
            row[f"cv_{metric}_std"]=float(np.std(scores[f"test_{metric}"]))
        row["cv_false_safe_rate_mean"]=1-row["cv_recall_not_potable_mean"]
        rows.append(row)
        print(f"{name}: CV balanced accuracy {row['cv_balanced_accuracy_mean']:.3f}",flush=True)
    return pd.DataFrame(rows).sort_values(
        ["cv_balanced_accuracy_mean","cv_macro_f1_mean","cv_false_safe_rate_mean"],
        ascending=[False,False,True]
    ).reset_index(drop=True)

def evaluate_model(fitted,X_test,y_test):
    pred=fitted.predict(X_test)
    score=fitted.predict_proba(X_test)[:,list(fitted.classes_).index(1)] if hasattr(fitted,"predict_proba") else fitted.decision_function(X_test)
    cm=confusion_matrix(y_test,pred,labels=[0,1])
    n0=int(cm[0].sum())
    metrics={
        "accuracy":float(accuracy_score(y_test,pred)),
        "balanced_accuracy":float(balanced_accuracy_score(y_test,pred)),
        "macro_f1":float(f1_score(y_test,pred,average="macro",zero_division=0)),
        "precision_potable":float(precision_score(y_test,pred,pos_label=1,zero_division=0)),
        "recall_potable":float(recall_score(y_test,pred,pos_label=1,zero_division=0)),
        "recall_not_potable":float(recall_score(y_test,pred,pos_label=0,zero_division=0)),
        "roc_auc":float(roc_auc_score(y_test,score)),
        "confusion_matrix":cm.tolist(),
        "false_safe_count":int(cm[0,1]),
        "false_safe_rate":float(cm[0,1]/n0) if n0 else None,
        "test_class_counts":{"0":int((y_test==0).sum()),"1":int((y_test==1).sum())},
        "classification_report":classification_report(y_test,pred,labels=[0,1],target_names=CLASS_LABELS,output_dict=True,zero_division=0)
    }
    return metrics,pred

def save_outputs(X_train,X_test,y_train,y_test,comparison,selected,fitted,metrics,pred):
    MODEL_DIR.mkdir(parents=True,exist_ok=True)
    RESULTS_DIR.mkdir(parents=True,exist_ok=True)
    joblib.dump(fitted,MODEL_DIR/"trained_pipeline.joblib")
    comparison.to_csv(RESULTS_DIR/"model_comparison.csv",index=False)
    sample=X_test.copy()
    sample.insert(0,"sample_id",X_test.index.to_numpy())
    sample["actual_potability"]=y_test.to_numpy()
    sample["predicted_potability"]=pred
    sample.to_csv(RESULTS_DIR/"heldout_demo_samples.csv",index=False)
    ranges={f:{"training_min":float(X_train[f].min()),"training_max":float(X_train[f].max()),"training_median":float(X_train[f].median())} for f in FEATURES}
    detail={
        "selected_model":selected,
        "selection_rule":"Maximum 5-fold training-only CV balanced accuracy; macro F1 then lower false-safe rate as tie-breakers.",
        "split":{"train_rows":int(len(X_train)),"test_rows":int(len(X_test)),"train_fraction":.8,"test_fraction":.2,"stratify":True,"random_state":SEED,"cv_folds":5,"cv_shuffle":True},
        "features":FEATURES,
        "dataset_sha256":hashlib.sha256(DATA_FILE.read_bytes()).hexdigest(),
        "training_feature_ranges":ranges,
        "cross_validation":comparison.to_dict(orient="records"),
        "held_out_test":metrics,
        "selected_model_outputs_uncalibrated_scores":True,
        "limitations":[
            "Dataset labels are not independently validated drinking-water safety certifications.",
            "Training data are not necessarily representative of real sensor measurements or local water sources.",
            "Predicted probabilities are uncalibrated scores and are not safety probabilities.",
            "False-safe errors make this model unsuitable for safety decisions.",
            "The model requires all nine features; an ESP32 sensor kit alone cannot supply them."
        ],
        "versions":{"python":platform.python_version(),"scikit_learn":sklearn.__version__,"pandas":pd.__version__,"numpy":np.__version__}
    }
    (MODEL_DIR/"model_metrics.json").write_text(json.dumps(detail,indent=2,ensure_ascii=False),encoding="utf-8")
    (RESULTS_DIR/"split_indices.json").write_text(json.dumps({"train_indices":list(map(int,X_train.index)),"test_indices":list(map(int,X_test.index))},indent=2))
    fig,ax=plt.subplots(figsize=(7.4,6.1))
    ConfusionMatrixDisplay(confusion_matrix=np.array(metrics["confusion_matrix"]),display_labels=CLASS_LABELS).plot(ax=ax,cmap="Blues",colorbar=False)
    ax.set_title(f"Held-out confusion matrix — {selected}",pad=15)
    fig.tight_layout()
    fig.savefig(RESULTS_DIR/"confusion_matrix.png",dpi=180)
    plt.close(fig)
    fig,ax=plt.subplots(figsize=(9,4.2))
    tmp=comparison.sort_values("cv_balanced_accuracy_mean",ascending=True)
    ax.barh(tmp["model"],tmp["cv_balanced_accuracy_mean"],color="#168d95")
    ax.axvline(.5,color="gray",linestyle="--",linewidth=1,label="Balanced baseline (0.5)")
    ax.set_xlim(0,1)
    ax.set_xlabel("5-fold CV balanced accuracy (training only)")
    ax.legend(loc="lower right",fontsize=8)
    fig.tight_layout()
    fig.savefig(RESULTS_DIR/"cv_model_comparison.png",dpi=180)
    plt.close(fig)
    return detail

def train_experiment():
    df=load_data()
    X_train,X_test,y_train,y_test=make_split(df)
    assert not set(X_train.index).intersection(X_test.index)
    print(f"Dataset: {df.shape}; train={len(X_train)}, test={len(X_test)}")
    comparison=benchmark_models(X_train,y_train)
    selected=str(comparison.iloc[0]["model"])
    fitted=build_candidates()[selected]
    fitted.fit(X_train,y_train)
    metrics,pred=evaluate_model(fitted,X_test,y_test)
    detail=save_outputs(X_train,X_test,y_train,y_test,comparison,selected,fitted,metrics,pred)
    print("Selected on training CV:",selected)
    print("Held-out balanced accuracy:",round(metrics["balanced_accuracy"],4))
    print("False-safe count:",metrics["false_safe_count"])
    return detail

if __name__=="__main__":
    train_experiment()
