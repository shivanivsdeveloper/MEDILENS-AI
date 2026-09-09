# Automated Testing & Verification Suite

MediScan AI incorporates a comprehensive automated testing suite built with `pytest` and `fastapi.testclient`.

---

## Running Test Suites

```bash
# In project root:
backend\.venv\Scripts\python.exe -m pytest backend/tests -v
```

---

## Test Coverage
1. `test_root_endpoint`: Verifies API root gateway and safety disclaimer presence.
2. `test_health_endpoint`: Asserts hardware telemetry, GPU device detection, and storage capacity.
3. `test_analytics_dashboard`: Validates 7-day scan trends, risk stratification breakdown, and KPI counters.
4. `test_list_scans`: Verifies scan repository querying and pagination.
5. `test_list_models`: Ensures all 5 diagnostic modules are registered and ready.
6. `test_uncertainty_calculation`: Validates Shannon entropy, margin-based uncertainty, and confidence normalization.
7. `test_risk_engine_logic`: Asserts risk stratification across Normal, Pathological, Substandard, and Out-of-Distribution cases.
