# Project Nightingale - Medical Disclaimer & System Limitations

> [!WARNING]
> **DISCLAIMER**: This project is built solely as a portfolio/hackathon demonstration MVP for clinical workflow modeling, telemetry visualization, and machine learning risk scoring. It is **NOT** a certified medical device and must **NOT** be used for clinical diagnosis, treatment decisions, or active emergency patient care.

## Architectural & Compliance Considerations for Production Deployment

1. **Regulatory Compliance (HIPAA / GDPR)**
   - **Current MVP state**: Basic JWT authentication with role-based access. Patient details are stored in plain database tables.
   - **Production Requirement**: HIPAA (Health Insurance Portability and Accountability Act) and GDPR compliance require:
     - End-to-end data encryption at rest (e.g., AWS KMS, PostgreSQL TDE) and in transit (TLS 1.3).
     - Strict Access Logging & Immutable Audit Trails (tracking every read/write action on protected health information PHI).
     - Business Associate Agreements (BAA) with third-party hosting and AI API providers.

2. **FDA / CE Medical Device Software (SaMD)**
   - **Current MVP state**: Machine learning models (XGBoost risk classifier and NLP summarizers) provide informational risk flags.
   - **Production Requirement**: AI tools offering diagnostic aid or triage scoring often qualify as **Software as a Medical Device (SaMD)** under FDA 510(k) or EU MDR regulations, requiring clinical validation trials, risk management systems (ISO 14971), and regulatory filing.

3. **Real-time Vitals Telemetry**
   - **Current MVP state**: Simulated vitals generated over WebSocket standard connections.
   - **Production Requirement**: Standard protocol integration (HL7 / FHIR standard formats, IEEE 11073 medical device communication), fault-tolerant queueing (Kafka / RabbitMQ), and fail-safe alarm handling.

4. **Third-Party LLM & Diagnostics API Privacy**
   - **Current MVP state**: Diagnostic summaries process mock clinical report strings.
   - **Production Requirement**: Direct sending of unstructured medical notes to commercial public APIs requires HIPAA-compliant zero-retention enterprise tier agreements or self-hosted open-source medical LLMs (e.g., Med-PaLM, Llama-3-Clinical).
