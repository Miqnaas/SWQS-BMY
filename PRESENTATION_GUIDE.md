# SWQS-BMY — Presentation & Defense Guide

## Open these links
- [Presentation Mode](https://miqnaas.github.io/SWQS-BMY/presentation.html)
- [Research Explorer](https://miqnaas.github.io/SWQS-BMY/research.html)
- [3D Water & ESP32](https://miqnaas.github.io/SWQS-BMY/experience.html)
- [Live Prediction Lab](https://miqnaas.github.io/SWQS-BMY/)
- [Academic Paper PDF](https://miqnaas.github.io/SWQS-BMY/academic/Smart_Water_Quality_Paper.pdf)

Presentation controls: **ArrowRight / Space** next, **ArrowLeft** previous, **N** speaker notes, **F** fullscreen.

## Speaker flow (11 slides)
1. **Scope:** An educational dataset-classification study, not a certified water safety instrument.
2. **Problem:** Water quality has many indicators; laboratory analysis and low-cost sensor prototypes have different capabilities.
3. **Dataset:** 3,276 records; nine numeric features; label 0/1.
4. **Class balance:** 1,998 class-0 (60.99%) vs 1,278 class-1 (39.01%).
5. **EDA:** Missing Sulfate 781; pH 491; Trihalomethanes 162. Solids is skewed. Pairwise Pearson coefficients are weak.
6. **Preprocessing:** 80/20 stratified split = 2,620/656, seed 42, training-only medians and scales. CV uses preprocessing inside each model Pipeline.
7. **Training:** Dummy, Logistic Regression, KNN, SVM, Random Forest; 5-fold training CV. Winner by balanced accuracy: RF ≈ 0.6168.
8. **Held-out errors:** Accuracy 66.16%, balanced accuracy 59.73%, macro F1 0.5875, ROC-AUC 0.6553. Confusion matrix [[356,44],[178,78]].
9. **Sensors:** pH and turbidity can be directly measured with calibration; TDS is only a proxy for Solids; EC is optional; temperature is not a model input. Five chemical features are missing.
10. **Demo:** Show Research Explorer, preprocessing transformation, prediction on nine fields, optional 3D device scene.
11. **Conclusion:** Real model and reproducible code, but significant limitations. External validation and compatible labeled sensor data are mandatory before safety-related claims.

## Practical live-demo route
1. At the Research Explorer, choose **Solids** → Histogram → Boxplot.
2. Inspect the Correlation Matrix: near-zero Pearson correlation does not prove no predictive value.
3. In the Preprocessing Journey, select row **2** and **Sulfate**: raw NaN → training median ≈ **333.074** → scaled ≈ **−0.0192**.
4. In the Prediction Lab, select a held-out record or enter all nine compatible numeric features. Interpret the output only as a *dataset label*.
5. In the 3D Explorer, rotate the water view and switch to ESP32; explain why simulated sensor sliders are **not** ML inputs.

## Likely questions and good answers
**Why split before imputation?** Otherwise test distribution statistics leak into training and inflate evaluation.

**Why stratify?** Classes are approximately 61/39; stratification preserves proportions in both partitions.

**Why the median?** Robustness to outliers, especially in features with extreme observed values. Not all columns were proven non-normal.

**Why Random Forest?** Best training-only cross-validated balanced accuracy among the five candidates. Selection did not look at the held-out test first.

**Is 66.16% enough to tell someone water is safe?** No. Balanced accuracy is only 59.73%, with 44 false-safe errors out of 400 actual class-0 test cases. Real-water safety requires certified testing.

**Can four sensors supply the nine-feature model?** No. Units, measurement methods and five unobserved chemical features do not match the training schema. Never invent these values for a physical sample.

**Is 20.7% a chance that water is safe?** No. The displayed Random Forest class-1 score is uncalibrated and is not a real-world safety probability.

**Did you use real hardware?** The ESP32 scene is a planned/illustrative sensor prototype; the current browser sliders are simulations, not measurements.

## Backup plan
If WebGL/CDN is unavailable, use the Research Explorer and its downloadable paper. If internet fails altogether, open the paper PDF and run the Jupyter notebook locally. Never present a mocked prediction as an actual measured result.
