export type Language = 'en' | 'ta';

export const translations = {
  en: {
    app_title: "MediScan AI",
    app_subtitle: "Spatial Medical Screening & Explainability Platform",
    nav_dashboard: "Dashboard",
    nav_scan_center: "Scan Center",
    nav_ai_analysis: "AI Analysis",
    nav_patients: "Patients",
    nav_review_queue: "Review Queue",
    nav_comparison: "Scan Comparison",
    nav_reports: "Reports Hub",
    nav_model_lab: "Model Lab",
    nav_datasets: "Dataset Explorer",
    nav_experiments: "Experiments",
    nav_bias_fairness: "Bias & Fairness",
    nav_audit_log: "Audit Trail",
    nav_system_health: "System Health",
    
    // Safety
    safety_disclaimer_badge: "AI Screening Decision-Support System — Not a Definitive Clinical Diagnosis",
    safety_disclaimer_full: "MediScan AI is an academic and clinical decision-support platform. All model predictions, heatmaps, and probability indicators must be verified by a licensed healthcare professional.",

    // Dashboard
    total_scans: "Total Scans",
    today_scans: "Today's Ingestions",
    reviewed_cases: "Clinician Reviewed",
    pending_reviews: "Pending Review Queue",
    abnormal_screenings: "Abnormal Indications",
    avg_inference_time: "Avg Inference Latency",
    system_status: "System Telemetry",
    active_models: "Active ML Engines",
    scan_volume: "7-Day Scan Volume",
    risk_breakdown: "Screening Risk Distribution",
    modality_breakdown: "Modality Breakdown",
    recent_scans: "Recent Radiographic Scans",
    
    // Actions
    upload_new_scan: "Upload New Scan",
    analyze_scan: "Run AI Screening",
    view_details: "View Workstation",
    download_report: "Download PDF Report",
    accept_prediction: "Accept Screening",
    correct_label: "Correct Finding",
    reject_escalate: "Escalate Case",
    toggle_3d: "2.5D Topographical Elevation",
    
    // Metrics
    quality_score: "Image Quality Score",
    modality: "Imaging Modality",
    confidence: "Model Confidence",
    uncertainty: "Shannon Uncertainty",
    risk_level: "Screening Risk Level"
  },
  ta: {
    app_title: "மெடிஸ்கேன் AI",
    app_subtitle: "மருத்துவ பட பகுப்பாய்வு மற்றும் விளக்கத்திறன் தளம்",
    nav_dashboard: "முதன்மை பலகை",
    nav_scan_center: "ஸ்கேன் மையம்",
    nav_ai_analysis: "AI பகுப்பாய்வு",
    nav_patients: "நோயாளிகள்",
    nav_review_queue: "மருத்துவர் சரிபார்ப்பு வரிசை",
    nav_comparison: "ஸ்கேன் ஒப்பீடு",
    nav_reports: "அறிக்கைகள் மையம்",
    nav_model_lab: "மாதிரி ஆய்வகம்",
    nav_datasets: "தரவுத்தொகுப்பு",
    nav_experiments: "பரிசோதனைகள்",
    nav_bias_fairness: "சார்பு பகுப்பாய்வு",
    nav_audit_log: "தணிக்கை பதிவு",
    nav_system_health: "கணினி நிலை",

    // Safety
    safety_disclaimer_badge: "AI பரிசோதனை முடிவு — இது இறுதியான மருத்துவ நோயறிதல் அல்ல",
    safety_disclaimer_full: "மெடிஸ்கேன் AI என்பது ஆராய்ச்சி மற்றும் மருத்துவ முடிவு ஆதரவு தளமாகும். அனைத்து AI முடிவுகளும் தகுதிவாய்ந்த மருத்துவரால் மதிப்பாய்வு செய்யப்பட வேண்டும்.",

    // Dashboard
    total_scans: "மொத்த ஸ்கேன்கள்",
    today_scans: "இன்றைய ஸ்கேன்கள்",
    reviewed_cases: "மருத்துவர் சரிபார்த்தவை",
    pending_reviews: "சரிபார்ப்பு நிலுவையில்",
    abnormal_screenings: "மாறுபட்ட அறிகுறிகள்",
    avg_inference_time: "சராசரி கணிப்பு வேகம்",
    system_status: "கணினி நிலைமை",
    active_models: "செயலில் உள்ள மாதிரிகள்",
    scan_volume: "7 நாள் ஸ்கேன் எண்ணிக்கை",
    risk_breakdown: "ஆபத்து நிலை பகிர்வு",
    modality_breakdown: "ஸ்கேன் வகைப்பாடு",
    recent_scans: "சமீபத்திய ஸ்கேன்கள்",

    // Actions
    upload_new_scan: "புதிய ஸ்கேன் பதிவேற்றுக",
    analyze_scan: "AI பகுப்பாய்வு இயக்கு",
    view_details: "விவரங்களை காண்க",
    download_report: "PDF அறிக்கை பதிவிறக்குக",
    accept_prediction: "முடிவை ஏற்றுக்கொள்",
    correct_label: "முடிவை திருத்து",
    reject_escalate: "உயர் பார்வைக்கு அனுப்புக",
    toggle_3d: "2.5D நிலப்பரப்பு உயர்வு காட்சி",

    // Metrics
    quality_score: "படத்தின் தரம்",
    modality: "ஸ்கேன் வகை",
    confidence: "மாதிரி நம்பிக்கை",
    uncertainty: "நிலையற்ற தன்மை",
    risk_level: "ஆபத்து நிலை"
  }
};
