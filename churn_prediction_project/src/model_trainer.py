"""
Model Trainer Module for SaaS Churn Prediction.
Trains Logistic Regression, Random Forest, and XGBoost models with hyperparameter tuning.
Evaluates AUC-ROC (>0.85 target), Precision, Recall, and F1 Score.
"""

import os
import time
import joblib
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from typing import Dict, Any, Tuple

from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.metrics import (
    roc_auc_score,
    precision_score,
    recall_score,
    f1_score,
    roc_curve
)
import xgboost as xgb


class ModelTrainer:
    def __init__(self, output_dir: str = "outputs"):
        self.output_dir = output_dir
        os.makedirs(self.output_dir, exist_ok=True)
        self.models: Dict[str, Any] = {}
        self.results: Dict[str, Dict[str, float]] = {}
        self.best_model = None
        self.best_model_name = ""

    def train_and_evaluate(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        """Trains candidate models, tunes hyperparameters, and evaluates holdout metrics."""
        print("[ModelTrainer] Splitting dataset into train (80%) and holdout test (20%)...")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.20, random_state=42, stratify=y
        )

        # 1. Logistic Regression Pipeline
        print("[ModelTrainer] Tuning Candidate 1: Logistic Regression...")
        lr_pipe = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", LogisticRegression(max_iter=1000, random_state=42))
        ])
        lr_param_grid = {"classifier__C": [0.01, 0.1, 1.0, 10.0]}
        lr_grid = GridSearchCV(lr_pipe, lr_param_grid, cv=3, scoring="roc_auc", n_jobs=-1)
        lr_grid.fit(X_train, y_train)
        self.models["LogisticRegression"] = lr_grid.best_estimator_

        # 2. Random Forest Classifier
        print("[ModelTrainer] Tuning Candidate 2: Random Forest...")
        rf_clf = RandomForestClassifier(random_state=42)
        rf_param_grid = {
            "n_estimators": [100, 200],
            "max_depth": [6, 10],
            "min_samples_split": [2, 5]
        }
        rf_grid = GridSearchCV(rf_clf, rf_param_grid, cv=3, scoring="roc_auc", n_jobs=-1)
        rf_grid.fit(X_train, y_train)
        self.models["RandomForest"] = rf_grid.best_estimator_

        # 3. XGBoost Classifier
        print("[ModelTrainer] Tuning Candidate 3: XGBoost...")
        xgb_clf = xgb.XGBClassifier(
            eval_metric="logloss",
            random_state=42,
            use_label_encoder=False
        )
        xgb_param_grid = {
            "n_estimators": [100, 200],
            "max_depth": [4, 6],
            "learning_rate": [0.03, 0.1],
            "subsample": [0.8, 1.0]
        }
        xgb_grid = GridSearchCV(xgb_clf, xgb_param_grid, cv=3, scoring="roc_auc", n_jobs=-1)
        xgb_grid.fit(X_train, y_train)
        self.models["XGBoost"] = xgb_grid.best_estimator_

        # Evaluate all candidate models on Holdout Test Set
        print("\n" + "="*60)
        print("MODEL EVALUATION ON HOLDOUT TEST SET (20% Data)")
        print("="*60)

        best_auc = 0.0
        plt.figure(figsize=(8, 6))

        for name, model in self.models.items():
            y_pred_proba = model.predict_proba(X_test)[:, 1]
            y_pred = (y_pred_proba >= 0.5).astype(int)

            auc = roc_auc_score(y_test, y_pred_proba)
            prec = precision_score(y_test, y_pred, zero_division=0)
            rec = recall_score(y_test, y_pred, zero_division=0)
            f1 = f1_score(y_test, y_pred, zero_division=0)

            # Precision at threshold capturing 80% of actual churners
            precision_at_80_recall = self._calc_precision_at_target_recall(y_test.values, y_pred_proba, target_recall=0.80)

            self.results[name] = {
                "AUC_ROC": float(auc),
                "Precision": float(prec),
                "Recall": float(rec),
                "F1_Score": float(f1),
                "Precision_At_80_Recall": float(precision_at_80_recall)
            }

            print(f"Model: {name:20s} | AUC-ROC: {auc:.4f} | Precision: {prec:.4f} | Recall: {rec:.4f} | F1: {f1:.4f} | Prec@80%Rec: {precision_at_80_recall:.4f}")

            # ROC Curve Plot
            fpr, tpr, _ = roc_curve(y_test, y_pred_proba)
            plt.plot(fpr, tpr, label=f"{name} (AUC = {auc:.3f})")

            if auc > best_auc:
                best_auc = auc
                self.best_model = model
                self.best_model_name = name

        # Plot customization
        plt.plot([0, 1], [0, 1], 'k--', label='Random Chance')
        plt.xlabel('False Positive Rate')
        plt.ylabel('True Positive Rate')
        plt.title('ROC Curves - Churn Prediction Candidate Models')
        plt.legend()
        plt.grid(True)
        roc_plot_path = os.path.join(self.output_dir, "roc_curves.png")
        plt.savefig(roc_plot_path)
        plt.close()

        # Save Best Model Artifact
        best_model_path = os.path.join(self.output_dir, "best_model.pkl")
        joblib.dump({"model": self.best_model, "feature_names": list(X.columns)}, best_model_path)
        print(f"\n[ModelTrainer] Winner: {self.best_model_name} with AUC-ROC = {best_auc:.4f}")
        print(f"[ModelTrainer] Best model saved to: {best_model_path}")

        # Feature Importances for Best Tree Model
        self._save_feature_importances(X.columns)

        return {
            "best_model_name": self.best_model_name,
            "best_auc_roc": best_auc,
            "all_results": self.results,
            "best_model_path": best_model_path
        }

    def _calc_precision_at_target_recall(self, y_true: np.ndarray, y_proba: np.ndarray, target_recall: float = 0.80) -> float:
        """Calculates precision at the threshold that captures at least target_recall fraction of true churners."""
        sorted_indices = np.argsort(y_proba)[::-1]
        y_true_sorted = y_true[sorted_indices]
        total_positives = np.sum(y_true)

        if total_positives == 0:
            return 0.0

        cum_positives = np.cumsum(y_true_sorted)
        recalls = cum_positives / total_positives

        valid_threshold_indices = np.where(recalls >= target_recall)[0]
        if len(valid_threshold_indices) == 0:
            return 0.0

        idx = valid_threshold_indices[0]
        precision_at_k = cum_positives[idx] / (idx + 1)
        return float(precision_at_k)

    def _save_feature_importances(self, feature_names: pd.Index) -> None:
        """Saves top feature importances visual chart if supported by best model."""
        importances = None
        if hasattr(self.best_model, "feature_importances_"):
            importances = self.best_model.feature_importances_
        elif hasattr(self.best_model, "named_steps") and hasattr(self.best_model.named_steps["classifier"], "coef_"):
            importances = np.abs(self.best_model.named_steps["classifier"].coef_[0])

        if importances is not None:
            fi_df = pd.DataFrame({"feature": feature_names, "importance": importances})
            fi_df = fi_df.sort_values(by="importance", ascending=False).head(15)

            plt.figure(figsize=(10, 6))
            plt.barh(fi_df["feature"][::-1], fi_df["importance"][::-1], color="teal")
            plt.xlabel("Importance Score")
            plt.title(f"Top 15 Feature Importances - {self.best_model_name}")
            plt.tight_layout()
            fi_path = os.path.join(self.output_dir, "feature_importance.png")
            plt.savefig(fi_path)
            plt.close()
            print(f"[ModelTrainer] Feature importance chart saved to {fi_path}")
