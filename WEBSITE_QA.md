# SWQS-BMY Website QA — October 31, 2026

## Verified with actual project data
- Original CSV: 3,276 × 10, target 0: 1,998 and 1: 1,278.
- Missing values: Sulfate 781, pH 491, Trihalomethanes 162.
- Research Explorer: 9 switchable histograms, 9 boxplot views, 100 clickable Pearson matrix cells, dynamic missingness and target charts, all computed directly from the original CSV.
- Pipeline walkthrough: row 2 / Sulfate renders raw NaN → training-only median 333.074 → z-score −0.0192 using exported fitted parameters.
- Local DOM browser tests: research page desktop (1440px) and mobile (390px) had no page exceptions and no document horizontal overflow.
- 3D page: scene toggle, sensor details, five simulated controls and responsive layouts passed DOM tests; compiled module passed Node syntax checks. **Actual WebGL rendering from the public Three.js CDN was not verifiable in the sandbox and must still be checked on a real browser.**
- Presentation: 11 slides, navigation, final-slide bounds, speaker notes and mobile layout passed Playwright checks, with no page exceptions.
- All JavaScript modules for the Prediction Lab, EDA, 3D, and Presentation Mode passed `node --check`.
- Existing ML browser inference had previously matched the Python fitted Random Forest on 150 test samples; this stage did not modify its inference script or tree data.

## Repository & deployment
- All source files are in `docs/` and deployed via the free GitHub Actions Pages workflow.
- PDF / DOCX and original CSV are duplicated inside `docs/` for stable Pages downloads.
- Python backend remains available in `ml/` for reproducibility, but is not required by the published browser app.
- The model is educational and has **66.16% accuracy, 59.73% balanced accuracy, and 44/400 false-safe errors** on the held-out dataset.

## Performance payload (source sizes, not measured Lighthouse metrics)
- Prediction Lab: forest binary compressed ~774 KB; small HTML/CSS/JS/metadata files.
- Research: original CSV ~525 KB; three primary source files ~40 KB combined.
- Presentation: HTML/CSS/JS ~20 KB.
- 3D: local HTML/CSS/JS ~29 KB plus the pinned Three.js CDN module. WebGL pixel ratio capped at 1.5; reduced-motion preference supported.
- Paper files ~1.22 MB each, loaded only when opened or downloaded.

## Important final manual acceptance tests (not yet verified)
1. Open the live 3D Experience on a modern WebGL desktop browser and a mobile device; confirm the droplet and ESP32 geometry render, drag rotates, and hotspots remain clickable.
2. Verify a JS-disabled / no-WebGL fallback shows explanatory content without claiming the 3D model is operating.
3. Verify the published PDF/DOCX links and source Notebook navigation after Pages deployment succeeds.
4. Check a real browser's Network/Console and mobile scrolling behavior at the public URL.
5. Run Lighthouse on live URL for performance, accessibility and network throttling. Do not treat file sizes as performance scores.
6. Confirm the academic paper and notebook are archived outside GitHub as a presentation fallback.

## Scientific limitation
No certified drinking-water assessment, calibrated real-time ESP32 sensor feed or independently labeled physical sensor data are provided. The web experiment must never represent simulated values as validated potability predictions.
