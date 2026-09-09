import numpy as np
from typing import List, Dict, Any

class DiseaseProgressionSimulator:
    """
    Disease Progression Research Simulator.
    Analyzes longitudinal disease markers, computes historical progression rates,
    and models research trajectories with explicit confidence bounds.
    Distinguishes observed historical facts from research simulation forecasts.
    """

    @classmethod
    def simulate_trajectory(
        cls,
        historical_points: List[Dict[str, Any]],
        forecast_horizon_months: int = 12
    ) -> Dict[str, Any]:
        """
        historical_points: list of dicts with keys:
          'date', 'month_offset' (int), 'lesion_area_pct' (float), 'confidence' (float)
        """
        if not historical_points or len(historical_points) < 2:
            return {
                "status": "INSUFFICIENT_DATA",
                "message": "Insufficient longitudinal data for progression simulation. Minimum 2 chronological visits required.",
                "observed_points": historical_points,
                "projected_trajectory": []
            }

        # Sort by month_offset
        points = sorted(historical_points, key=lambda x: x.get("month_offset", 0))
        x_obs = np.array([p["month_offset"] for p in points], dtype=np.float32)
        y_obs = np.array([p["lesion_area_pct"] for p in points], dtype=np.float32)

        # Fit robust linear trend
        if len(x_obs) > 1:
            slope, intercept = np.polyfit(x_obs, y_obs, 1)
        else:
            slope, intercept = 0.0, y_obs[0]

        # Calculate residual variance
        y_pred_obs = slope * x_obs + intercept
        residuals = y_obs - y_pred_obs
        std_err = float(np.std(residuals)) if len(residuals) > 1 else 0.5

        # Future projected trajectory (e.g. at +3, +6, +9, +12 months)
        last_offset = int(x_obs[-1])
        projected = []
        
        step_months = max(3, forecast_horizon_months // 4)
        for offset_delta in range(step_months, forecast_horizon_months + 1, step_months):
            future_x = last_offset + offset_delta
            # Point prediction
            future_y = float(slope * future_x + intercept)
            future_y_bounded = max(0.0, min(100.0, future_y))
            
            # Uncertainty widening over forecast horizon
            time_penalty = 1.0 + (offset_delta / forecast_horizon_months) * 0.8
            lower_bound = max(0.0, future_y_bounded - (std_err * 1.96 * time_penalty))
            upper_bound = min(100.0, future_y_bounded + (std_err * 1.96 * time_penalty))

            projected.append({
                "month_offset": future_x,
                "projected_area_pct": round(future_y_bounded, 2),
                "lower_bound_95ci": round(lower_bound, 2),
                "upper_bound_95ci": round(upper_bound, 2),
                "uncertainty_index": round(float(time_penalty * 0.25), 2),
                "type": "RESEARCH_PROJECTION"
            })

        # Progression Classification
        if slope > 0.4:
            trajectory_trend = "Accelerating Expansion / Progression"
            clinical_risk = "High"
        elif slope > 0.05:
            trajectory_trend = "Indolent Gradual Progression"
            clinical_risk = "Moderate"
        elif slope < -0.05:
            trajectory_trend = "Focal Regression / Resolution"
            clinical_risk = "Low"
        else:
            trajectory_trend = "Morphologically Stable"
            clinical_risk = "Low"

        return {
            "status": "SIMULATION_COMPLETED",
            "observed_points": points,
            "fitted_slope_pct_per_month": round(float(slope), 3),
            "trajectory_trend": trajectory_trend,
            "estimated_stability_level": clinical_risk,
            "projected_trajectory": projected,
            "research_disclaimer": "Research In Silico Projection Only. Not a medical prognosis or autonomous diagnosis."
        }
