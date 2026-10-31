# Generated model artifacts

\`python -m ml.train\` generates \`trained_pipeline.joblib\` and \`model_metrics.json\` here, and \`heldout_demo_samples.csv\` in \`results/\`.

The model binary is not currently included in this public source repository. Training requires the original CSV downloaded from Kaggle.

Do not load an untrusted \`.joblib\` file. Model predictions are dataset-label estimates, **not drinking-water safety decisions**.
