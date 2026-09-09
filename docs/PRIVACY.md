# Privacy, Security & Compliance Policy

MediScan AI is designed to uphold strict healthcare privacy standards (HIPAA and GDPR compliance) through architectural privacy-by-design.

---

## 1. Zero Cloud Dependency
- All neural network inferences, Grad-CAM computations, and PDF report generations execute **100% locally** on the host machine.
- No medical pixel data, patient identifiers, or diagnostic telemetry are transmitted over the public internet.

---

## 2. Minimal Data Collection & Pseudonymization
- Patient records use de-identified reference IDs (e.g. `PT-2026-0881`) and optional pseudonyms.
- No direct personal identifiers (SSN, government ID, phone numbers) are collected or stored.

---

## 3. Cryptographic Audit Trail
- All user actions, model selections, threshold modifications, and clinician reviews are logged in an immutable `audit_logs` table with UTC timestamps and IP addresses.
