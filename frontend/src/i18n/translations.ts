export type Language = 'en' | 'ta' | 'hi';

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

    // Roles & Portal
    role_patient: "Patient",
    role_doctor: "Doctor / Radiologist",
    role_scan_center: "Scan Center Staff",
    role_admin: "System Administrator",
    role_researcher: "Research Scientist",

    // Patient Plain-Language Portal
    patient_portal_title: "My Health Imaging & Records",
    explain_my_scan: "Explain My Scan in Simple Words",
    my_timeline: "My Health Timeline & Scan History",
    questions_for_doctor: "Questions to Ask My Doctor",
    next_steps_guide: "Next Steps & When to Seek Urgent Care",
    share_with_doctor: "Share Scan with My Doctor",
    privacy_access_control: "Who Viewed My Scans",
    simple_mode_toggle: "Simple Mode (High Contrast & Large Text)",

    // Doctor Clinical Portal
    urgent_first_worklist: "Urgent First Worklist",
    blinded_second_opinion: "Blinded Second Opinion",
    show_me_why: "Show Me Why (AI Attribution Saliency)",
    not_sure_alert: "AI Uncertainty / Review Required",
    auto_report_draft: "Auto Report Draft & Attending Sign-Off",
    compare_past_scans: "Compare Past Scans Side-by-Side",
    voice_notes_dictate: "Voice Dictation Findings",

    // Scan Center Portal
    easy_upload_title: "Multi-Modality Scan Ingestion",
    quality_check_instant: "Instant Quality Check (Before Patient Leaves)",
    assign_doctor_btn: "Assign to Radiologist",
    scan_stage_tracker: "5-Stage Workflow Tracker",
    daily_workload: "Daily Scan Intake & Delivery",

    // Safety
    safety_disclaimer_badge: "AI Decision-Support System — Not a Definitive Clinical Diagnosis",
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
    confidence: "How sure the AI is",
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

    // Roles & Portal
    role_patient: "நோயாளி",
    role_doctor: "மருத்துவர் / கதிரியக்க நிபுணர்",
    role_scan_center: "ஸ்கேன் மைய ஊழியர்",
    role_admin: "கணினி நிர்வாகி",
    role_researcher: "ஆராய்ச்சி விஞ்ஞானி",

    // Patient Plain-Language Portal
    patient_portal_title: "எனது மருத்துவ ஸ்கேன் மற்றும் தகவல்கள்",
    explain_my_scan: "எனது ஸ்கேன் முடிவை எளிய தமிழில் விளக்குங்கள்",
    my_timeline: "எனது உடல்நல ஸ்கேன் வரலாறு",
    questions_for_doctor: "மருத்துவரிடம் கேட்க வேண்டிய கேள்விகள்",
    next_steps_guide: "அடுத்த கட்ட நடவடிக்கைகள் & அவசர உதவி",
    share_with_doctor: "மருத்துவருடன் ஸ்கேன் பகிர்வு",
    privacy_access_control: "எனது ஸ்கேனை யார் பார்த்தார்கள்",
    simple_mode_toggle: "எளிய முறை (பெரிய எழுத்துகள் & தெளிவான பொத்தான்கள்)",

    // Doctor Clinical Portal
    urgent_first_worklist: "அவசர முன்னுரிமை வரிசை",
    blinded_second_opinion: "மருத்துவர் சுய பார்வை & AI ஒப்பீடு",
    show_me_why: "காரணத்தை காட்டு (AI கவன வரைபடம்)",
    not_sure_alert: "AI ஐயம் / மருத்துவர் நேரடி பார்வை தேவை",
    auto_report_draft: "தானியங்கி அறிக்கை & மருத்துவர் கையொப்பம்",
    compare_past_scans: "பழைய vs புதிய ஸ்கேன் ஒப்பீடு",
    voice_notes_dictate: "குரல் வழி அறிக்கை பதிவு",

    // Scan Center Portal
    easy_upload_title: "எளிய ஸ்கேன் பதிவேற்றம்",
    quality_check_instant: "உடனடி படத் தர சோதனை",
    assign_doctor_btn: "மருத்துவருக்கு அனுப்புக",
    scan_stage_tracker: "5-படிநிலை கண்காணிப்பாளர்",
    daily_workload: "தினசரி ஸ்கேன் நிலவரம்",

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
    confidence: "AI கணிப்பின் உறுதித்தன்மை",
    uncertainty: "நிலையற்ற தன்மை",
    risk_level: "ஆபத்து நிலை"
  },
  hi: {
    app_title: "मेडिस्कैन AI",
    app_subtitle: "मेडिकल इमेजिंग विश्लेषण एवं अनुसंधान मंच",
    nav_dashboard: "डैशबोर्ड",
    nav_scan_center: "स्कैन केंद्र",
    nav_ai_analysis: "AI विश्लेषण",
    nav_patients: "मरीज़",
    nav_review_queue: "डॉक्टर समीक्षा कतार",
    nav_comparison: "स्कैन तुलना",
    nav_reports: "रिपोर्ट केंद्र",
    nav_model_lab: "मॉडल लैब",
    nav_datasets: "डेटासेट",
    nav_experiments: "प्रयोग",
    nav_bias_fairness: "सटीकता व निष्पक्षता",
    nav_audit_log: "ऑडिट रिकॉर्ड",
    nav_system_health: "सिस्टम स्वास्थ्य",

    // Roles & Portal
    role_patient: "मरीज़",
    role_doctor: "डॉक्टर / रेडियोलॉजिस्ट",
    role_scan_center: "स्कैन केंद्र स्टाफ",
    role_admin: "सिस्टम प्रशासक",
    role_researcher: "अनुसंधान वैज्ञानिक",

    // Patient Plain-Language Portal
    patient_portal_title: "मेरी मेडिकल रिपोर्ट और स्कैन",
    explain_my_scan: "सरल भाषा में मेरा स्कैन समझाइए",
    my_timeline: "स्वास्थ्य टाइमलाइन एवं इतिहास",
    questions_for_doctor: "डॉक्टर से पूछने योग्य प्रश्न",
    next_steps_guide: "अगले कदम और आपातकालीन सलाह",
    share_with_doctor: "डॉक्टर के साथ स्कैन साझा करें",
    privacy_access_control: "मेरी रिपोर्ट किसने देखी",
    simple_mode_toggle: "सरल मोड (बड़ा टेक्स्ट व आसान बटन)",

    // Doctor Clinical Portal
    urgent_first_worklist: "आपातकालीन प्राथमिकता सूची",
    blinded_second_opinion: "स्वतंत्र डॉक्टर राय व AI तुलना",
    show_me_why: "कारण देखें (AI अटेंशन मैप)",
    not_sure_alert: "AI अनिश्चितता / व्यक्तिगत समीक्षा आवश्यक",
    auto_report_draft: "स्वतः रिपोर्ट प्रारूप व डॉक्टर हस्ताक्षर",
    compare_past_scans: "पुराने बनाम नए स्कैन की तुलना",
    voice_notes_dictate: "वॉइस डिक्टेशन द्वारा निष्कर्ष दर्ज करें",

    // Scan Center Portal
    easy_upload_title: "आसान स्कैन अपलोड",
    quality_check_instant: "त्वरित स्कैन गुणवत्ता जांच",
    assign_doctor_btn: "रेडियोलॉजिस्ट को सौंपें",
    scan_stage_tracker: "5-चरणीय प्रगति ट्रैकर",
    daily_workload: "दैनिक स्कैन प्रगति",

    // Safety
    safety_disclaimer_badge: "AI निर्णय-सहायता प्रणाली — यह अंतिम चिकित्सीय निदान नहीं है",
    safety_disclaimer_full: "मेडिस्कैन AI अनुसंधान और नैदानिक निर्णय सहायता मंच है। सभी AI परिणामों का चिकित्सकीय सत्यापन अनिवार्य है।",

    // Dashboard
    total_scans: "कुल स्कैन",
    today_scans: "आज के स्कैन",
    reviewed_cases: "समीक्षित केस",
    pending_reviews: "लंबित समीक्षाएं",
    abnormal_screenings: "असामान्य संकेत",
    avg_inference_time: "औसत गणना समय",
    system_status: "सिस्टम स्थिति",
    active_models: "सक्रिय AI मॉडल",
    scan_volume: "7-दिवसीय स्कैन संख्या",
    risk_breakdown: "जोखिम स्तर वितरण",
    modality_breakdown: "स्कैन प्रकार",
    recent_scans: "हाल के स्कैन",

    // Actions
    upload_new_scan: "नया स्कैन अपलोड करें",
    analyze_scan: "AI जांच चलाएं",
    view_details: "विवरण देखें",
    download_report: "PDF रिपोर्ट डाउनलोड करें",
    accept_prediction: "परिणाम स्वीकार करें",
    correct_label: "परिणाम संशोधित करें",
    reject_escalate: "उच्च समीक्षा हेतु भेजें",
    toggle_3d: "2.5D टोपोग्राफिकल व्यू",

    // Metrics
    quality_score: "इमेज गुणवत्ता",
    modality: "स्कैन का प्रकार",
    confidence: "AI का विश्वास स्तर",
    uncertainty: "अनिश्चितता",
    risk_level: "जोखिम स्तर"
  }
};
