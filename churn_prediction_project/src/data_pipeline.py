"""
Data Pipeline Module for SaaS Churn Prediction.
Handles data loading, synthetic data generation if needed, and clean data merging.
"""

import os
import numpy as np
import pandas as pd
from typing import Tuple, Dict


class DataPipeline:
    def __init__(self, data_dir: str = "/data/customer_data/"):
        self.data_dir = data_dir
        if not os.path.exists(self.data_dir):
            # Fallback to local relative path if absolute path is restricted
            self.data_dir = os.path.join(os.getcwd(), "data", "customer_data")
        os.makedirs(self.data_dir, exist_ok=True)

    def generate_synthetic_data(self, num_customers: int = 10000) -> None:
        """Generates realistic synthetic SaaS customer, usage, and billing datasets."""
        print(f"[DataPipeline] Generating {num_customers} synthetic customer records...")
        np.random.seed(42)

        customer_ids = [f"CUST_{i:06d}" for i in range(1, num_customers + 1)]
        plan_types = np.random.choice(["Starter", "Professional", "Enterprise"], size=num_customers, p=[0.5, 0.35, 0.15])
        industries = np.random.choice(["Tech", "Finance", "Healthcare", "E-commerce", "Education"], size=num_customers)
        regions = np.random.choice(["US-East", "US-West", "EU-Central", "APAC"], size=num_customers)
        tenure_days = np.random.randint(30, 730, size=num_customers)

        customers_df = pd.DataFrame({
            "customer_id": customer_ids,
            "plan_type": plan_types,
            "industry": industries,
            "region": regions,
            "tenure_days": tenure_days
        })

        # Base churn risk logic based on plan and tenure
        base_risk = (
            (customers_df["plan_type"] == "Starter") * 0.15 +
            (customers_df["tenure_days"] < 90) * 0.20 +
            np.random.normal(0, 0.05, size=num_customers)
        )

        # Usage patterns
        daily_active_mins = np.maximum(0, np.random.normal(loc=45 - base_risk * 60, scale=15))
        features_used = np.clip(np.random.poisson(lam=8 - base_risk * 10), 1, 15)
        support_tickets = np.clip(np.random.poisson(lam=2 + base_risk * 8), 0, 12)
        days_since_last_login = np.clip(np.random.exponential(scale=2 + base_risk * 25), 0, 60)

        usage_df = pd.DataFrame({
            "customer_id": customer_ids,
            "daily_active_minutes": daily_active_mins,
            "features_used_count": features_used,
            "support_tickets_30d": support_tickets,
            "days_since_last_login": days_since_last_login
        })

        # Billing patterns
        monthly_amounts = customers_df["plan_type"].map({"Starter": 49.0, "Professional": 199.0, "Enterprise": 799.0})
        overdue_status = (base_risk + np.random.uniform(0, 0.3, size=num_customers)) > 0.35
        payment_history_score = np.clip(100 - (overdue_status * 35) - np.random.randint(0, 20, size=num_customers), 0, 100)

        billing_df = pd.DataFrame({
            "customer_id": customer_ids,
            "monthly_amount": monthly_amounts,
            "overdue_status": overdue_status.astype(int),
            "payment_history_score": payment_history_score
        })

        # Ground truth churn label (~5.2% target churn rate alignment)
        churn_logits = (
            -2.5 +
            (days_since_last_login * 0.08) +
            (support_tickets * 0.25) +
            (overdue_status * 1.5) -
            (daily_active_mins * 0.04) -
            (payment_history_score * 0.02)
        )
        churn_probs = 1 / (1 + np.exp(-churn_logits))
        churned = (churn_probs > np.percentile(churn_probs, 94.8)).astype(int)

        customers_df["churned"] = churned

        # Save to CSV files
        customers_df.to_csv(os.path.join(self.data_dir, "customers.csv"), index=False)
        usage_df.to_csv(os.path.join(self.data_dir, "usage.csv"), index=False)
        billing_df.to_csv(os.path.join(self.data_dir, "billing.csv"), index=False)
        print(f"[DataPipeline] Synthetic data successfully written to {self.data_dir}")

    def load_and_merge_data(self) -> pd.DataFrame:
        """Loads customer, usage, and billing datasets and merges on customer_id."""
        cust_path = os.path.join(self.data_dir, "customers.csv")
        usage_path = os.path.join(self.data_dir, "usage.csv")
        bill_path = os.path.join(self.data_dir, "billing.csv")

        if not (os.path.exists(cust_path) and os.path.exists(usage_path) and os.path.exists(bill_path)):
            print("[DataPipeline] Raw data files not found. Triggering synthetic generation...")
            self.generate_synthetic_data()

        customers = pd.read_csv(cust_path)
        usage = pd.read_csv(usage_path)
        billing = pd.read_csv(bill_path)

        merged = customers.merge(usage, on="customer_id", how="inner")
        merged = merged.merge(billing, on="customer_id", how="inner")

        print(f"[DataPipeline] Successfully merged datasets into shape: {merged.shape}")
        return merged
