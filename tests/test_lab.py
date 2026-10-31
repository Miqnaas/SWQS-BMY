"""Research-lab integrity checks. Model-dependent cases are skipped until artifacts are trained."""
import json
from pathlib import Path
import pytest
from ml.train import ROOT, DATA_FILE, MODEL_DIR, FEATURES, build_candidates

def test_nine_features():
    assert len(FEATURES)==9
    assert len(set(FEATURES))==9

def test_all_five_pipelines():
    candidates=build_candidates()
    assert len(candidates)==5
    for pipeline in candidates.values():
        assert list(pipeline.named_steps)==["imputer","scaler","classifier"]

def test_web_files():
    assert (ROOT/"web/index.html").exists()
    assert (ROOT/"web/assets/app.js").exists()
    assert (ROOT/"web/assets/style.css").exists()

def test_training_notebook_valid_json():
    nb=json.loads((ROOT/"notebooks/Model_Training_Evaluation.ipynb").read_text(encoding="utf-8"))
    assert nb["nbformat"]==4

def test_dataset_schema_if_available():
    if not DATA_FILE.exists():
        pytest.skip("Dataset not in public repo; download it from Kaggle first")
    from ml.train import load_data
    df=load_data()
    assert df.shape[1]==10
    assert "Potability" in df.columns

def test_model_predictions_if_trained():
    if not (MODEL_DIR/"trained_pipeline.joblib").exists():
        pytest.skip("Train the saved pipeline before inference tests")
    from ml.predict import artifacts, predict_one
    model,meta=artifacts()
    values={f:meta["training_feature_ranges"][f]["training_median"] for f in FEATURES}
    result=predict_one(values)
    assert result["predicted_class"] in (0,1)
    assert result["not_a_safety_assessment"] is True

def test_invalid_input_rejected():
    from ml.predict import normalize_features
    with pytest.raises(ValueError):
        normalize_features({"ph":7.0})
