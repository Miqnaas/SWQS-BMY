# Smart Water Quality Monitoring System — SWQS-BMY

An academic research project with a real machine-learning benchmarking workflow, a browser-based Prediction Lab, a unified EDA/preprocessing notebook, and planned 3D research visualizations.

**Important:** This system predicts a *dataset label*. It is **NOT** a drinking-water safety test, a certified laboratory instrument, or a basis for consumption decisions.

## What's in this repository

| Directory / file | Purpose |
|---|---|
| \`ml/train.py\` | Five scikit-learn Pipelines; 80/20 stratified split, training-only 5-fold CV, held-out test evaluation |
| \`ml/predict.py\` | Strict nine-feature schema validation + inference |
| \`ml/api.py\` | FastAPI endpoints and same-origin web UI |
| \`web/\` | Responsive interactive Prediction Lab and model comparison UI |
| \`notebooks/Water_Quality_EDA_Preprocessing.ipynb\` | Unified team EDA and preprocessing |
| \`notebooks/Model_Training_Evaluation.ipynb\` | Training/evaluation notebook |
| \`results/model_comparison.csv\` | Recorded cross-validation comparison from the completed local experiment |
| \`MODEL_REPORT.md\` | Experiment metrics, model selection, limitations |
| \`tests/\` | Integrity and inference checks; artifact-dependent tests are skipped until retrained |
| \`academic/\` | Academic-paper delivery guidance (PDF/DOCX not yet committed) |

The original CSV and generated trained model binary are **not yet included in this public repository**. The notebook and training source are available. Redistribution terms of the Kaggle dataset need verification.

## Quick start

Requires Python 3.11+ (Python 3.13 used in the CI) and the original public CSV.

1. Download the dataset: https://www.kaggle.com/datasets/adityakadiwal/water-potability
2. Save it as \`data/water_potability.csv\`
3. Install Python dependencies:
   \`\`\`bash
   pip install -r requirements.txt
   \`\`\`
4. Train and evaluate the models, then export artifacts:
   \`\`\`bash
   python -m ml.train
   \`\`\`
5. Launch the Prediction Lab:
   \`\`\`bash
   uvicorn ml.api:app --reload --host 127.0.0.1 --port 8000
   \`\`\`
6. Open http://127.0.0.1:8000 to try genuine model inference.

Run checks: \`python -m pytest -q\` (install \`pytest\` and \`httpx\` first).

## Endpoints

- \`GET /api/health\` — status of the actual serialized model
- \`GET /api/metadata\` — CV scores, test metrics, feature ranges and limitations
- \`GET /api/samples\` — held-out records after training
- \`POST /api/predict\` — all nine dataset-compatible features required; pH/Sulfate/Trihalomethanes may be null for *dataset-style missingness demonstration*, not a substitute for unmeasured live chemical features

## Experimental results from the completed local run

The training-only CV selected **Random Forest**. On 656 held-out samples: accuracy **66.16%**, balanced accuracy **59.73%**, ROC-AUC **0.6553**, macro F1 **0.5875**. There were **44 false-safe classification errors** (actual 0 predicted 1) out of 400 actual class-0 examples. These results demonstrate significant limitations, not real-world validation.

Scores returned by \`predict_proba\` are **uncalibrated model scores**. Do not treat them as drinking-water safety probabilities.

## Hosting

This repository is source code, **not yet a live website**. The Python backend requires Python hosting; GitHub Pages alone will not execute FastAPI. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Dataset–sensor compatibility

The source data use nine physicochemical features; a basic low-cost ESP32 setup cannot supply all nine. The sensor design remains conceptual and separate from validated model inference.

Original dataset citation: Kadiwal, A. *Water Quality*. Kaggle, 2021. https://www.kaggle.com/datasets/adityakadiwal/water-potability.
