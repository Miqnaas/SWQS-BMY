# ML First — Experiment Report

**Project:** Smart Water Quality Monitoring System  
**Dataset:** Water Quality and Potability (`water_potability.csv`, source Kaggle / adityakadiwal)  
**Evaluation status:** Completed and reproduced with original provided CSV  
**Safety status:** Educational retrospective classification; **NOT** a drinking-water-safety system.

## Dataset and integrity

- **3,276** rows, 9 numeric input features, 1 label (`Potability`: 0, 1), no fully duplicated rows.
- Missing values: `ph=491`, `Sulfate=781`, `Trihalomethanes=162`. Only the training fold statistics are used to impute.
- **80/20 stratified hold-out split:** train 2,620 / final test 656 rows, `random_state=42`, exactly no overlapping rows.
- Models and preprocessing evaluated with **5-fold StratifiedKFold**, `shuffle=True`, `random_state=42` within the training partition only.
- Every candidate is a complete scikit-learn `Pipeline(SimpleImputer(median), StandardScaler(), estimator)`. No pre-scaling or imputation is fit before CV.

## Five-model cross-validation (training data ONLY)

| Model | CV Accuracy | CV Balanced Acc. | CV Macro F1 | CV Recall class 0 | CV Recall class 1 | CV False-safe rate | CV ROC-AUC |
|---|---:|---:|---:|---:|---:|---:|---:|
| DummyClassifier | 60.99% | 50.00% | 37.89% | 100.00% | 0.00% | 0.00% | 0.5000 |
| Logistic Regression | 60.99% | 50.00% | 37.89% | 100.00% | 0.00% | 0.00% | 0.4774 |
| KNN (k=15) | 64.08% | 57.54% | 56.15% | 87.30% | 27.79% | 12.70% | 0.6544 |
| SVM (RBF) | 67.98% | 61.02% | 59.77% | 92.68% | 29.35% | 7.32% | 0.7019 |
| **Random Forest** | **67.86%** | **61.68%** | **61.03%** | 89.80% | **33.56%** | 10.20% | 0.6830 |

Model choice is determined by maximum mean **training CV balanced accuracy**; tie-breakers are macro F1 then lower false-safe rate. It is not based on the final test result. SVM has higher training CV ROC-AUC and a lower training CV false-safe rate; Random Forest wins on the predefined balanced accuracy criterion. Candidate results are not evidence that predictions are safe to act upon.

## Single held-out test: selected Random Forest

| Metric | Held-out value |
|---|---:|
| Accuracy | **66.16%** |
| Balanced accuracy | **59.73%** |
| Macro F1 | **58.75%** |
| Recall class 0 | **89.00%** |
| Recall class 1 | **30.47%** |
| Precision when predicting class 1 | **63.93%** |
| ROC-AUC | **0.6553** |
| False-safe rate (actual 0 predicted 1) | **11.00%** |

### Confusion matrix

**Rows = actual, columns = predicted**:

| Actual / Predicted | Class 0 | Class 1 |
|---|---:|---:|
| Actual 0 | 356 | **44** ← false-safe mistakes |
| Actual 1 | 178 | 78 |

Thus **44 / 400 actual class-0 records** were predicted as class 1. The result is scientifically insufficient for a drinking-water safety decision. It also misses many true class-1 records, so accuracy alone is misleading.

## Inference engine and app

The saved trusted artifact `models/trained_pipeline.joblib` contains **the complete imputation, scaling and Random Forest classifier**. An API accepts **exactly nine named feature keys**, rejects negative/non-finite values and ph >14, allows missing (`null`) only for the three features missing in training, and emits out-of-range warnings and explicit safety limitations. The browser UI includes:

- Manual nine-feature input, with validation.
- Selection of **held-out** original data rows to compare known dataset labels against actual model predictions.
- Class 1 **uncalibrated model score** and its disclaimer.
- Validation metrics, comparison bars, and true confusion matrix.

The web UI requires the Python FastAPI service; it does not work as a GitHub Pages-only static bundle. No hardware sensor is connected. Live real-world prediction would require independent matching sensor/lab data and further external validation.

## Reproduction

```bash
pip install -r requirements.txt
python -m ml.train
python -m pytest -q
uvicorn ml.api:app --host 127.0.0.1 --port 8000
```

The notebook `notebooks/Model_Training_Evaluation.ipynb` was executed from start to finish without cell errors. All reported numeric results reflect the provided CSV, seed and software environment. No real-world water certification or generalization claim has been established.