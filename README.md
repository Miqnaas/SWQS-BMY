# Smart Water Quality Monitoring System (SWQS-BMY)

University research project: **Water Quality & Potability classification** with reproducible exploratory analysis, a leakage-safe ML benchmarking workflow, and an interactive Prediction Lab.

**Research-only warning:** Outputs are dataset-label estimates, not drinking-water safety certifications. The model does not replace laboratory analysis.

## Project tracks

- Academic deliverables: Sections 1–4 research paper, EDA and preprocessing notebook.
- Machine learning: DummyClassifier, Logistic Regression, KNN, SVM and Random Forest; training-only cross-validation; held-out evaluation.
- Interactive lab: validated nine-feature inputs and a research demonstration, with a Python API. A public web deployment is not yet active.
- Future: optional 3D research experience and ESP32/sensor visualization (not yet implemented).

Dataset: [Kaggle — Water Quality and Potability](https://www.kaggle.com/datasets/adityakadiwal/water-potability).

**Dataset files may be downloaded separately from the original source until redistribution rights are checked.**

Repository owner: [Miqnaas](https://github.com/Miqnaas). GitHub repository: `Miqnaas/SWQS-BMY`.

## Deployment

GitHub Pages alone cannot run the Python FastAPI backend. Run locally or deploy to a Python-capable host. Do not represent an uncalibrated model score as a probability of drinking-water safety.

> This repository is being populated from the completed academic and ML First project. Files are published incrementally; the existence of this README alone does not mean the public website is deployed.
