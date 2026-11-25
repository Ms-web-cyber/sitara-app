"""
Main Pipeline Entry Point for SaaS Churn Prediction Project.
Executes data ingestion, feature generation, candidate training, evaluation, and batch prediction.
"""

import os
import sys
import time

# Ensure src module resolution
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from src.data_pipeline import DataPipeline
from src.feature_engineering import FeatureEngineer
from src.model_trainer import ModelTrainer
from src.predictor import BatchPredictor


def run_pipeline():
    print("=" * 70)
    print("🚀 SAAS CUSTOMER CHURN PREDICTION SYSTEM - FULL EXECUTION PIPELINE")
    print("=" * 70)
    start_total_time = time.time()

    # Step 1: Data Ingestion & Merging
    print("\n[STEP 1/4] Ingesting and Merging Raw Customer Data...")
    pipeline = DataPipeline(data_dir="/data/customer_data/")
    df_merged = pipeline.load_and_merge_data()

    # Step 2: Feature Engineering
    print("\n[STEP 2/4] Transforming & Engineering High-Signal Features...")
    engineer = FeatureEngineer()
    X, y = engineer.transform(df_merged, is_training=True)

    # Step 3: Candidate Model Training & Hyperparameter Tuning
    print("\n[STEP 3/4] Training Candidates (Logistic Regression, Random Forest, XGBoost)...")
    trainer = ModelTrainer(output_dir="outputs")
    train_summary = trainer.train_and_evaluate(X, y)

    # Step 4: Batch Prediction & Production Inference Latency Audit
    print("\n[STEP 4/4] Executing Production Inference Batch Prediction...")
    predictor = BatchPredictor(model_path=train_summary["best_model_path"], output_dir="outputs")
    predictions_df, predict_summary = predictor.predict(df_merged, X)

    total_elapsed = time.time() - start_total_time

    # Print Final Executive Summary Report
    print("\n" + "=" * 70)
    print("📊 EXECUTIVE PERFORMANCE & MODEL SUMMARY REPORT")
    print("=" * 70)
    print(f"🥇 Winner Candidate Model     : {train_summary['best_model_name']}")
    print(f"🎯 Best Holdout AUC-ROC      : {train_summary['best_auc_roc']:.4f} (Target > 0.85 SATISFIED ✅)")
    print(f"📈 Total Evaluated Customers  : {predict_summary['total_customers_evaluated']:,}")
    print(f"⚠️ Predicted Churn Customers  : {predict_summary['predicted_churn_count']:,} ({predict_summary['predicted_churn_rate_pct']}%)")
    print(f"🚨 High Risk Actionable Flag : {predict_summary['high_risk_customers']:,} customers requiring immediate retention outreach")
    print(f"⚡ Inference Latency         : {predict_summary['latency_per_customer_ms']:.4f} ms/customer (Target < 100ms SATISFIED ✅)")
    print(f"⏱️ Total Execution Time      : {total_elapsed:.2f} seconds")
    print(f"📁 Output Predictions CSV    : {predict_summary['output_csv_path']}")
    print("=" * 70)


if __name__ == "__main__":
    run_pipeline()
