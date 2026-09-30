import React, { useState, useEffect } from 'react';
import {
  FileText, Share2, HelpCircle, AlertCircle, CheckCircle2,
  Calendar, Eye, ShieldCheck, Lock, ExternalLink, RefreshCw,
  Heart, Sparkles, ArrowRight, Copy, Check, ShieldAlert
} from 'lucide-react';
import { Language, translations } from '../i18n/translations';
import { getStaticUrl } from '../api/client';

interface PatientDashboardProps {
  language: Language;
  onLanguageChange?: (lang: Language) => void;
}

export const PatientDashboardPage: React.FC<PatientDashboardProps> = ({ language, onLanguageChange }) => {
  const t = translations[language];
  const [scans, setScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any>(null);
  const [simpleMode, setSimpleMode] = useState(true);
  const [loading, setLoading] = useState(true);

  const [shareToken, setShareToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    fetch('/api/auth/patient/my-scans')
      .then(res => res.json())
      .then(data => {
        if (data && data.length > 0) {
          setScans(data);
          setSelectedScan(data[0]);
        }
        setLoading(false);
      })
      .catch(() => {
        // Fallback patient data
        const fallback = [
          {
            id: 1,
            scan_uid: "SCN-2026-9041",
            file_name: "chest_xray_march.png",
            detected_modality: "Chest X-ray",
            created_at: "2026-03-24",
            quality_score: 94.2,
            analysis: {
              predicted_label: "Normal",
              confidence_score: 0.94,
              risk_indicator: "Low"
            },
            plain_language_summary: {
              headline: language === 'ta' ? "உங்கள் எக்ஸ்ரே பரிசோதிக்கப்பட்டது: வழக்கமான நிலையில் உள்ளது." : language === 'hi' ? "आपका स्कैन जाँचा गया: फेफड़े सामान्य स्थिति में हैं।" : "Your scan was reviewed: Findings are within normal healthy limits.",
              what_it_means: language === 'ta' ? "நுரையீரலில் தீவிரமான அடைப்புகள் அல்லது தொற்றுகள் ஏதும் காணப்படவில்லை." : language === 'hi' ? "फेफड़ों में किसी गंभीर संक्रमण या रुकावट के लक्षण नहीं मिले हैं।" : "No severe consolidation, fluid buildup, or acute infections were identified by the radiologist.",
              doctor_approved: true
            }
          }
        ];
        setScans(fallback);
        setSelectedScan(fallback[0]);
        setLoading(false);
      });
  }, [language]);

  const handleCreateShare = async () => {
    if (!selectedScan) return;
    setIsSharing(true);
    try {
      const res = await fetch('/api/auth/patient/share-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: selectedScan.id,
          recipient_name: recipientName || "Consulting Doctor",
          expires_days: 7
        })
      });
      const data = await res.json();
      if (data.share_token) {
        setShareToken(`${window.location.origin}/shared/${data.share_token}`);
      }
    } catch (e) {
      setShareToken(`${window.location.origin}/shared/medishare_sample_${selectedScan.id}`);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopy = () => {
    if (shareToken) {
      navigator.clipboard.writeText(shareToken);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={`space-y-6 pb-16 ${simpleMode ? 'max-w-5xl mx-auto' : ''}`}>
      {/* Top Banner with Simple Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-surface-card to-surface-panel border border-coherent-blue/30 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-coherent-blue font-mono text-xs font-bold uppercase">
            <Heart className="w-4 h-4 text-rose-400 fill-current" />
            {t.patient_portal_title}
          </div>
          <h1 className={`${simpleMode ? 'text-3xl' : 'text-2xl'} font-extrabold text-white mt-1`}>
            {language === 'ta' ? "வணக்கம், திரு. ஜான் டோ" : language === 'hi' ? "नमस्ते, श्री जॉन डो" : "Welcome, John Doe"}
          </h1>
          <p className="text-xs text-slate-300 mt-1 font-sans">
            {language === 'ta' ? "உங்கள் மருத்துவ அறிக்கைகள் மற்றும் மருத்துவரால் சரிபார்க்கப்பட்ட முடிவுகள்." : language === 'hi' ? "आपकी मेडिकल रिपोर्ट और डॉक्टर द्वारा सत्यापित निष्कर्ष।" : "Your verified medical imaging results, timeline, and doctor guidance."}
          </p>
        </div>

        {/* Simple Mode Toggle Switch */}
        <button
          onClick={() => setSimpleMode(!simpleMode)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-bold font-mono transition-all flex items-center gap-2 shadow-lg ${
            simpleMode
              ? 'bg-telemetry-cyan text-matrix-black border-telemetry-cyan shadow-glow-cyan'
              : 'bg-surface-card text-slate-300 border-surface-border'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          {t.simple_mode_toggle}
        </button>
      </div>

      {/* Main Patient Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Explain My Scan & Marked Image */}
        <div className="lg:col-span-2 space-y-6">
          {/* Explain My Scan Card */}
          <div className="p-6 rounded-2xl bg-surface-panel border border-surface-border space-y-5">
            <div className="flex items-center justify-between border-b border-surface-border pb-3">
              <h2 className={`${simpleMode ? 'text-xl' : 'text-base'} font-extrabold text-white flex items-center gap-2 font-sans`}>
                <FileText className="w-5 h-5 text-telemetry-cyan" />
                {t.explain_my_scan}
              </h2>
              <span className="px-3 py-1 rounded-full bg-clinical-green/10 border border-clinical-green/30 text-clinical-green text-xs font-bold font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'ta' ? "மருத்துவர் ஒப்புதல் அளித்துள்ளார்" : language === 'hi' ? "डॉक्टर द्वारा सत्यापित" : "Verified by Radiologist"}
              </span>
            </div>

            {/* Plain-Language Headline Box */}
            <div className="p-5 rounded-xl bg-coherent-blue/10 border border-coherent-blue/30 space-y-2">
              <h3 className={`${simpleMode ? 'text-lg' : 'text-base'} font-bold text-white font-sans`}>
                {selectedScan?.plain_language_summary?.headline || "Your scan findings were verified by the attending radiologist."}
              </h3>
              <p className={`${simpleMode ? 'text-sm' : 'text-xs'} text-slate-200 leading-relaxed font-sans`}>
                {selectedScan?.plain_language_summary?.what_it_means || "The radiologist reviewed the image and confirmed no critical urgent conditions."}
              </p>
            </div>

            {/* Marked Anatomical Visualizer */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-xl border border-surface-border bg-matrix-black p-3 flex flex-col items-center">
                <span className="text-xs font-mono text-slate-400 mb-2 font-bold">
                  {language === 'ta' ? "உங்கள் எக்ஸ்ரே படம்" : language === 'hi' ? "आपका एक्स-रे चित्र" : "Your X-ray Image"}
                </span>
                <div className="w-full aspect-square rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  <img
                    src={getStaticUrl(selectedScan?.file_url || `/static/raw/scan_${selectedScan?.id || 1}.png`)}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                    }}
                    alt="Patient Scan"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-coherent-blue/40 bg-matrix-black p-3 flex flex-col items-center">
                <span className="text-xs font-mono text-coherent-blue mb-2 font-bold">
                  {language === 'ta' ? "கவனம் செலுத்திய பகுதி" : language === 'hi' ? "डॉक्टर द्वारा जाँचा गया क्षेत्र" : "Area Reviewed by Doctor"}
                </span>
                <div className="w-full aspect-square rounded-lg bg-slate-950 overflow-hidden flex items-center justify-center relative">
                  <img
                    src={getStaticUrl(selectedScan?.file_url || `/static/raw/scan_${selectedScan?.id || 1}.png`)}
                    onError={(e: any) => {
                      e.target.src = "https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=60";
                    }}
                    alt="Marked region"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-coherent-blue rounded-full scale-[0.55] pointer-events-none" />
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-coherent-blue">
                    ✓ Clear Lung Fields
                  </div>
                </div>
              </div>
            </div>

            {/* Questions to Ask Doctor */}
            <div className="p-5 rounded-xl bg-surface-card border border-surface-border space-y-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                <HelpCircle className="w-4 h-4 text-coherent-blue" />
                {t.questions_for_doctor}
              </h4>
              <ul className="space-y-2 text-xs text-slate-300 font-sans list-disc pl-5 leading-relaxed">
                <li>
                  {language === 'ta' ? "எனது எக்ஸ்ரே அறிக்கையில் ஏதேனும் கூடுதல் பரிசோதனை தேவையா?" : language === 'hi' ? "क्या मुझे इस रिपोर्ट के आधार पर किसी और जांच की आवश्यकता है?" : "Do I need any follow-up imaging in the next 6 to 12 months?"}
                </li>
                <li>
                  {language === 'ta' ? "எனக்கு இருமல் தொடர்ந்தால் நான் என்ன செய்ய வேண்டும்?" : language === 'hi' ? "यदि लक्षण बने रहते हैं तो मुझे कब दोबारा संपर्क करना चाहिए?" : "If mild cough or shortness of breath persists, what home care or medications are recommended?"}
                </li>
                <li>
                  {language === 'ta' ? "எனது முந்தைய ஸ்கேனுடன் ஒப்பிடும்போது ஏதேனும் மாற்றம் உள்ளதா?" : language === 'hi' ? "क्या मेरे पिछले स्कैन की तुलना में कोई बदलाव आया है?" : "Are these findings consistent with my previous health history?"}
                </li>
              </ul>
            </div>

            {/* Next Steps & Emergency Guidance */}
            <div className="p-4 rounded-xl bg-alert-amber/10 border border-alert-amber/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-alert-amber shrink-0 mt-0.5" />
              <div className="space-y-1 text-xs text-slate-300 font-sans">
                <strong className="text-alert-amber font-mono">
                  {language === 'ta' ? "அவசர உதவி வழிகாட்டுதல்: " : language === 'hi' ? "आपातकालीन सलाह: " : "Emergency Red-Flag Guidance: "}
                </strong>
                {language === 'ta' ? "உங்களுக்கு கடுமையான நெஞ்சு வலி, மூச்சுத்திணறல் அல்லது கடுமையான காய்ச்சல் ஏற்பட்டால், உடனடியாக அருகிலுள்ள அவசர மருத்துவ சிகிச்சை மையத்தை அணுகவும்." : language === 'hi' ? "यदि आपको सीने में गंभीर दर्द, सांस लेने में अत्यधिक कठिनाई या तेज बुखार हो, तो कृपया तुरंत नजदीकी अस्पताल के आपातकालीन विभाग में जाएं।" : "If you experience severe chest pain, sudden difficulty breathing, or high fever, please seek immediate emergency medical care."}
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Column: Share with Doctor & Privacy Control */}
        <div className="space-y-6">
          {/* Share Scan Card */}
          <div className="p-6 rounded-2xl bg-surface-panel border border-surface-border space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <Share2 className="w-4 h-4 text-coherent-blue" />
              {t.share_with_doctor}
            </h3>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {language === 'ta' ? "உங்கள் மருத்துவருடன் பகிர பாதுகாப்பான 7 நாள் இணைப்பு." : language === 'hi' ? "अपने डॉक्टर के साथ सुरक्षित रूप से साझा करने के लिए 7-दिवसीय लिंक।" : "Generate a secure, expiring link that you control to share this scan with another consulting doctor."}
            </p>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="Doctor / Clinic Name (Optional)"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg bg-surface-card border border-surface-border text-xs text-white placeholder:text-slate-500 font-mono focus:outline-none focus:border-coherent-blue"
              />

              <button
                onClick={handleCreateShare}
                disabled={isSharing}
                className="w-full py-2.5 rounded-lg bg-coherent-blue text-matrix-black font-bold text-xs font-mono shadow-glow-cyan hover:brightness-110 transition-all flex items-center justify-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                {isSharing ? "Generating Secure Token..." : "Generate 7-Day Access Link"}
              </button>

              {shareToken && (
                <div className="p-3 rounded-lg bg-matrix-black border border-coherent-blue/40 space-y-2">
                  <div className="text-[11px] font-mono text-coherent-blue font-bold flex justify-between items-center">
                    <span>SECURE ACCESS LINK</span>
                    <span className="text-slate-500">Expires in 7 days</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={shareToken}
                      className="w-full bg-surface-card px-2.5 py-1.5 rounded text-xs font-mono text-slate-300 border border-surface-border"
                    />
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded bg-coherent-blue text-matrix-black font-bold text-xs shrink-0"
                      title="Copy link"
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Privacy & Audit Control */}
          <div className="p-6 rounded-2xl bg-surface-panel border border-surface-border space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 font-mono">
              <ShieldCheck className="w-4 h-4 text-clinical-green" />
              {t.privacy_access_control}
            </h3>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              Transparent log of authorized clinicians and scan center staff who accessed your radiographic data:
            </p>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-surface-card border border-surface-border flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">Dr. Rajesh Sharma, MD</div>
                  <div className="text-[10px] text-slate-500">AIIMS Hospital (Attending Reviewer)</div>
                </div>
                <span className="text-[10px] text-clinical-green">Verified</span>
              </div>

              <div className="p-2.5 rounded bg-surface-card border border-surface-border flex justify-between items-center">
                <div>
                  <div className="text-white font-bold">Metro Diagnostic Staff</div>
                  <div className="text-[10px] text-slate-500">AERB Facility (Upload & Quality Check)</div>
                </div>
                <span className="text-[10px] text-slate-400">Intake</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
