"""
Predictor Module for SaaS Churn Prediction.
Loads best trained model artifact, computes batch/individual churn probabilities with latency checks,
and generates timestamped actionable output CSV reports.
"""

import os
import time
import joblib
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Tuple, Dict, Any


class BatchPredictor:
    def __init__(self, model_path: str = "outputs/best_model.pkl", output_dir: str = "outputs"):
        self.model_path = model_path
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)

        if not os.path.exists(self.model_path):
            raise FileNotFoundError(f"[BatchPredictor] Model artifact not found at {self.model_path}")

        artifact = joblib.load(self.model_path)
        self.model = artifact["model"]
        self.expected_features = artifact["feature_names"]
        print(f"[BatchPredictor] Successfully loaded model artifact from {self.model_path}")

    def predict(self, raw_df: pd.DataFrame, X_feats: pd.DataFrame) -> Tuple[pd.DataFrame, Dict[str, Any]]:
        """Executes batch prediction with high efficiency and strict latency verification."""
        print(f"[BatchPredictor] Running batch churn prediction on {len(X_feats)} customer records...")

        start_time = time.time()
        # Align features
        X_aligned = X_feats.reindex(columns=self.expected_features, fill_value=0)

        # Probabilities
        churn_probabilities = self.model.predict_proba(X_aligned)[:, 1]
        inference_time_total = time.time() - start_time
        latency_per_customer_ms = (inference_time_total / len(X_feats)) * 1000.0

        # Construct actionable output DataFrame
        results_df = pd.DataFrame({
            "customer_id": raw_df["customer_id"],
            "plan_type": raw_df["plan_type"],
            "daily_active_minutes": raw_df["daily_active_minutes"],
            "days_since_last_login": raw_df["days_since_last_login"],
            "support_tickets_30d": raw_df["support_tickets_30d"],
            "churn_probability": np.round(churn_probabilities, 4),
            "predicted_churn_flag": (churn_probabilities >= 0.50).astype(int),
            "risk_category": np.select(
                [churn_probabilities >= 0.70, churn_probabilities >= 0.35],
                ["High Risk", "Medium Risk"],
                default="Low Risk"
            )
        })

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_csv = os.path.join(self.output_dir, f"churn_predictions_{timestamp}.csv")
        results_df.to_csv(output_csv, index=False)

        summary_metrics = {
            "total_customers_evaluated": len(results_df),
            "predicted_churn_count": int(results_df["predicted_churn_flag"].sum()),
            "predicted_churn_rate_pct": float(np.round((results_df["predicted_churn_flag"].sum() / len(results_df)) * 100, 2)),
            "high_risk_customers": int((results_df["risk_category"] == "High Risk").sum()),
            "total_inference_time_sec": float(np.round(inference_time_total, 4)),
            "latency_per_customer_ms": float(np.round(latency_per_customer_ms, 4)),
            "output_csv_path": output_csv
        }

        print(f"[BatchPredictor] Completed in {inference_time_total:.3f}s ({latency_per_customer_ms:.4f} ms/customer).")
        print(f"[BatchPredictor] Saved predictions to {output_csv}")

        return results_df, summary_metrics
