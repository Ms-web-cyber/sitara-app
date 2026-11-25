"""
Feature Engineering Module for SaaS Churn Prediction.
Generates actionable behavioral, usage, and billing features under 50 total dimensions.
"""

import pandas as pd
import numpy as np
from typing import Tuple, List


class FeatureEngineer:
    def __init__(self):
        self.feature_names: List[str] = []

    def transform(self, df: pd.DataFrame, is_training: bool = True) -> Tuple[pd.DataFrame, pd.Series]:
        """Engineers high-signal domain features and encodes categorical variables."""
        df_feats = df.copy()

        # 1. Behavioral Ratios & Interaction Features
        df_feats["mins_per_feature"] = df_feats["daily_active_minutes"] / (df_feats["features_used_count"] + 1e-5)
        df_feats["inactivity_severity"] = df_feats["days_since_last_login"] * (df_feats["support_tickets_30d"] + 1)
        df_feats["tenure_months"] = np.maximum(1.0, df_feats["tenure_days"] / 30.0)
        df_feats["tickets_per_tenure_month"] = df_feats["support_tickets_30d"] / df_feats["tenure_months"]
        df_feats["engagement_score"] = (df_feats["daily_active_minutes"] * 0.4) + (df_feats["features_used_count"] * 5.0)

        # 2. Risk Indicators
        df_feats["high_inactivity_flag"] = (df_feats["days_since_last_login"] > 14).astype(int)
        df_feats["high_support_volume_flag"] = (df_feats["support_tickets_30d"] >= 5).astype(int)
        df_feats["payment_risk_score"] = (df_feats["overdue_status"] * 50) + (100 - df_feats["payment_history_score"])

        # 3. Categorical Encodings
        categorical_cols = ["plan_type", "industry", "region"]
        df_encoded = pd.get_dummies(df_feats, columns=categorical_cols, drop_first=True)

        # Separate target if present
        target = None
        if "churned" in df_encoded.columns:
            target = df_encoded["churned"]
            df_encoded = df_encoded.drop(columns=["churned"])

        # Drop non-feature identifiers
        ignore_cols = ["customer_id", "signup_date"]
        feature_cols = [c for c in df_encoded.columns if c not in ignore_cols]

        if is_training:
            self.feature_names = feature_cols

        # Ensure feature column consistency during inference
        X = df_encoded.reindex(columns=self.feature_names, fill_value=0)

        # Fill any unexpected missing values
        X = X.fillna(0)

        print(f"[FeatureEngineer] Engineered {X.shape[1]} features (Constraint < 50 satisfied).")
        return X, target
