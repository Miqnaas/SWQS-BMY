# Smart Water Quality Monitoring System — SWQS-BMY

An academic research project with a real machine-learning benchmarking workflow, a browser-based Prediction Lab, a unified EDA/preprocessing notebook, and a live interactive Research Explorer with plots and a preprocessing walkthrough; 3D sensor exploration is the next phase.

**Important:** This system predicts a *dataset label*. It is **NOT** a drinking-water safety test, a certified laboratory instrument, or a basis for consumption decisions.

## What's in this repository

| Directory / file | Purpose |
|---|---|
| `ml/train.py` | Five scikit-learn Pipelines; 80/20 stratified split, training-only 5-fold CV, held-out test evaluation |
| `ml/predict.py` | Strict nine-feature schema validation + inference |
| `ml/api.py` | FastAPI endpoints and same-origin web UI |
| `web/` | Responsive interactive Prediction Lab and model comparison UI |
| `notebooks/Water_Quality_EDA_Preprocessing.ipynb` | Unified team EDA and preprocessing |
| `notebooks/Model_Training_Evaluation.ipynb` | Training/evaluation notebook |
| `results/model_comparison.csv` | Recorded cross-validation comparison from the completed local experiment |
| `MODEL_REPORT.md` | Experiment metrics, model selection, limitations |
| `tests/` | Integrity and inference checks; artifact-dependent tests are skipped until retrained |
| `academic/` | Complete Sections 1–4 research paper (PDF and DOCX) |
| `docs/` | Free GitHub Pages site: actual on-device ML inference + interactive EDA and research experience |

The original CSV, trained model binary, fitted evaluation metrics, and complete research paper are checked in. Dataset license: CC0 Public Domain; cite the original Kaggle source.

## Quick start

Requires Python 3.11+ (Python 3.13 used in the CI) and the original public CSV.

1. Download the dataset: https://www.kaggle.com/datasets/adityakadiwal/water-potability
2. Save it as `data/water_potability.csv`
3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Train and evaluate the models, then export artifacts:
   ```bash
   python -m ml.train
   ```
5. Launch the Prediction Lab:
   ```bash
   uvicorn ml.api:app --reload --host 127.0.0.1 --port 8000
   ```
6. Open http://127.0.0.1:8000 to try genuine model inference.

Run checks: `python -m pytest -q` (install `pytest` and `httpx` first).

## Endpoints

- `GET /api/health` — status of the actual serialized model
- `GET /api/metadata` — CV scores, test metrics, feature ranges and limitations
- `GET /api/samples` — held-out records after training
- `POST /api/predict` — all nine dataset-compatible features required; pH/Sulfate/Trihalomethanes may be null for *dataset-style missingness demonstration*, not a substitute for unmeasured live chemical features

## Experimental results from the completed local run

The training-only CV selected **Random Forest**. On 656 held-out samples: accuracy **66.16%**, balanced accuracy **59.73%**, ROC-AUC **0.6553**, macro F1 **0.5875**. There were **44 false-safe classification errors** (actual 0 predicted 1) out of 400 actual class-0 examples. These results demonstrate significant limitations, not real-world validation.

Scores returned by `predict_proba` are **uncalibrated model scores**. Do not treat them as drinking-water safety probabilities.

## Hosting

The free public website is live at **https://miqnaas.github.io/SWQS-BMY/** and uses on-device inference with a validated export of the trained Random Forest. Python/FastAPI hosting is optional for future server-side workflows. See [DEPLOYMENT.md](DEPLOYMENT.md).

## Dataset–sensor compatibility

The source data use nine physicochemical features; a basic low-cost ESP32 setup cannot supply all nine. The sensor design remains conceptual and separate from validated model inference.

Original dataset citation: Kadiwal, A. *Water Quality*. Kaggle, 2021. https://www.kaggle.com/datasets/adityakadiwal/water-potability.## GitHub and free deployment

Repository: https://github.com/Miqnaas/SWQS-BMY

The **free static Prediction Lab** is in `docs/`, and the **interactive Research Explorer** is live at https://miqnaas.github.io/SWQS-BMY/research.html. It uses a browser-native export of the exact 160 fitted Random Forest trees, train-fitted imputation medians and StandardScaler parameters; inference happens client-side and requires no server or paid subscription.

GitHub Pages is already enabled. `.github/workflows/deploy-pages.yml` publishes `docs/` on every push to `main`. Inspect GitHub Actions for deployment verification.

The original FastAPI backend remains in `ml/api.py` and `web/` if a Python server is wanted later. It is **not required** for the free GitHub Pages site.

### Checked-in artifacts

- `models/trained_pipeline.joblib`: trained scikit-learn Pipeline, losslessly compressed using joblib (loads with `joblib.load`).
- `models/model_metrics.json` and `results/heldout_demo_samples.csv`: actual evaluation and example records.
- `data/water_potability.csv`: Kaggle dataset, CC0 Public Domain. Attribution: https://www.kaggle.com/datasets/adityakadiwal/water-potability
- `academic/Smart_Water_Quality_Paper.pdf` and `.docx`: Sections 1–4 deliverables.
- `docs/assets/forest.bin.gz`: exact fitted Random Forest nodes for browser inference; `model_manifest.json`: original preprocessing/metric parameters.



## Interactive research explorer — Stage 2

Visit https://miqnaas.github.io/SWQS-BMY/research.html for the browser-only academic experience:

- Sections 1–4 overview and the downloadable research paper in PDF/DOCX.
- Real CSV-driven class balance, missingness, 9 selectable histograms and boxplots, and an interactive 10×10 Pearson heatmap.
- Choose an original CSV row and feature to see raw → training-median imputation → train-fitted StandardScaler output.
- Zero paid backend dependencies. The page reads the included `docs/data/water_potability.csv` and fitted `docs/assets/model_manifest.json` locally in the browser.

**Not yet built:** the advanced 3D water-and-ESP32 experience, hardware-connected readings, final presentation mode and live cross-device acceptance tests. Sensor readings are not direct substitutes for nine laboratory-defined model features.
