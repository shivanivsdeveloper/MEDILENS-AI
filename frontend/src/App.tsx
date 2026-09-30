import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout/MainLayout';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { ScanCenterPage } from './pages/ScanCenterPage';
import { AIAnalysisPage } from './pages/AIAnalysisPage';
import { HistoricalComparisonPage } from './pages/HistoricalComparisonPage';
import { PatientsPage } from './pages/PatientsPage';
import { PatientDetailPage } from './pages/PatientDetailPage';
import { ReviewQueuePage } from './pages/ReviewQueuePage';
import { ReportsHubPage } from './pages/ReportsHubPage';
import { ModelLabPage } from './pages/ModelLabPage';
import { DatasetExplorerPage } from './pages/DatasetExplorerPage';
import { ExperimentsPage } from './pages/ExperimentsPage';
import { BiasFairnessPage } from './pages/BiasFairnessPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { SystemHealthPage } from './pages/SystemHealthPage';
import { EmbeddingUniversePage } from './pages/EmbeddingUniversePage';
import { ModelCourtPage } from './pages/ModelCourtPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { StressTestArenaPage } from './pages/StressTestArenaPage';
import { AnnotationStudioPage } from './pages/AnnotationStudioPage';

// Role-Based Dedicated Portals
import { PatientDashboardPage } from './pages/PatientDashboardPage';
import { DoctorDashboardPage } from './pages/DoctorDashboardPage';
import { ScanCenterDashboardPage } from './pages/ScanCenterDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// MediScan AI Lab Research Modules (14 Preserved Modules)
import { LabDashboardPage } from './pages/LabDashboardPage';
import { ModelTrainingStudioPage } from './pages/ModelTrainingStudioPage';
import { ExplainabilityLabPage } from './pages/ExplainabilityLabPage';
import { TrustFailureLabPage } from './pages/TrustFailureLabPage';
import { SegmentationLabPage } from './pages/SegmentationLabPage';
import { PatternDiscoveryPage } from './pages/PatternDiscoveryPage';
import { SimilarCasesPage } from './pages/SimilarCasesPage';
import { DatasetScannerPage } from './pages/DatasetScannerPage';
import { ResearchAutopilotPage } from './pages/ResearchAutopilotPage';
import { AdvancedResearchToolsPage } from './pages/AdvancedResearchToolsPage';

import { CommandPalette } from './components/common/CommandPalette';
import { Language } from './i18n/translations';

export const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('en');
  const [userRole, setUserRole] = useState<string>('Lead Radiologist');
  const [isCommandOpen, setIsCommandOpen] = useState(false);

  return (
    <Router>
      <CommandPalette isOpen={isCommandOpen} onClose={() => setIsCommandOpen(false)} />
      <Routes>
        <Route path="/login" element={<AuthPage />} />
        
        <Route
          element={
            <MainLayout
              language={language}
              onLanguageChange={setLanguage}
              userRole={userRole}
              onRoleChange={setUserRole}
            />
          }
        >
          {/* ==================================================== */}
          {/* 1. DEDICATED ROLE PORTALS                            */}
          {/* ==================================================== */}
          <Route path="/patient/dashboard" element={<PatientDashboardPage language={language} onLanguageChange={setLanguage} />} />
          <Route path="/doctor/worklist" element={<DoctorDashboardPage language={language} />} />
          <Route path="/scan-center/dashboard" element={<ScanCenterDashboardPage language={language} />} />
          <Route path="/admin/governance" element={<AdminDashboardPage language={language} />} />

          {/* ==================================================== */}
          {/* 2. CLINICAL WORKSTATION ROUTES (PRESERVED)           */}
          {/* ==================================================== */}
          <Route path="/" element={<DashboardPage language={language} />} />
          <Route path="/scans/upload" element={<ScanCenterPage language={language} />} />
          <Route path="/analysis" element={<AIAnalysisPage language={language} userRole={userRole} />} />
          <Route path="/compare" element={<HistoricalComparisonPage language={language} />} />
          <Route path="/patients" element={<PatientsPage language={language} />} />
          <Route path="/patients/:id" element={<PatientDetailPage language={language} />} />
          <Route path="/reviews" element={<ReviewQueuePage language={language} userRole={userRole} />} />
          <Route path="/reports" element={<ReportsHubPage language={language} />} />
          <Route path="/annotation-studio" element={<AnnotationStudioPage language={language} />} />
          <Route path="/digital-twin" element={<DigitalTwinPage language={language} />} />
          <Route path="/bias-fairness" element={<BiasFairnessPage language={language} />} />

          {/* ==================================================== */}
          {/* 3. MEDISCAN AI LAB (14 INTEGRATED RESEARCH MODULES)   */}
          {/* ==================================================== */}
          <Route path="/lab" element={<LabDashboardPage language={language} />} />
          <Route path="/lab/dashboard" element={<LabDashboardPage language={language} />} />
          <Route path="/lab/training" element={<ModelTrainingStudioPage language={language} />} />
          <Route path="/lab/model-court" element={<ModelCourtPage language={language} />} />
          <Route path="/model-court" element={<ModelCourtPage language={language} />} />
          <Route path="/lab/explainability" element={<ExplainabilityLabPage language={language} />} />
          <Route path="/lab/trust-failure" element={<TrustFailureLabPage language={language} />} />
          <Route path="/lab/segmentation" element={<SegmentationLabPage language={language} />} />
          <Route path="/lab/pattern-discovery" element={<PatternDiscoveryPage language={language} />} />
          <Route path="/embedding-universe" element={<EmbeddingUniversePage language={language} />} />
          <Route path="/lab/similar-cases" element={<SimilarCasesPage language={language} />} />
          <Route path="/lab/stress-test" element={<StressTestArenaPage language={language} />} />
          <Route path="/stress-test" element={<StressTestArenaPage language={language} />} />
          <Route path="/lab/dataset-scanner" element={<DatasetScannerPage language={language} />} />
          <Route path="/datasets" element={<DatasetExplorerPage language={language} />} />
          <Route path="/lab/experiments" element={<ExperimentsPage language={language} />} />
          <Route path="/experiments" element={<ExperimentsPage language={language} />} />
          <Route path="/lab/autopilot" element={<ResearchAutopilotPage language={language} />} />
          <Route path="/lab/model-registry" element={<ModelLabPage language={language} />} />
          <Route path="/models" element={<ModelLabPage language={language} />} />
          <Route path="/lab/advanced-tools" element={<AdvancedResearchToolsPage language={language} />} />

          {/* ==================================================== */}
          {/* 4. GOVERNANCE & TELEMETRY (PRESERVED)                */}
          {/* ==================================================== */}
          <Route path="/audit" element={<AuditLogPage language={language} />} />
          <Route path="/health" element={<SystemHealthPage language={language} />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};
