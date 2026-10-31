# Deployment

This project includes a Python / FastAPI prediction service. GitHub Pages alone cannot run the Python API.

## Run locally

1. Download the Kaggle `water_potability.csv` file and put it at `data/water_potability.csv` (subject to the original dataset terms).
2. Install dependencies: `pip install -r requirements.txt`.
3. Train and export artifacts: `python -m ml.train`.
4. Start the application: `uvicorn ml.api:app --host 127.0.0.1 --port 8000`.
5. Open `http://127.0.0.1:8000` and test `/api/health` and `/api/predict`.

## Live hosting

Choose a Python-capable host. Set the build command to install dependencies and make trusted model artifacts available, and the start command to `uvicorn ml.api:app --host 0.0.0.0 --port $PORT` (adapt for your host). No live server is deployed yet.

**Research use only:** Predictions are not certified safety tests, and the model's scores are uncalibrated. A low-cost sensor array does not supply all nine required inputs.
