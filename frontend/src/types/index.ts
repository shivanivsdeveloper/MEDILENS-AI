export interface QualityMetrics {
  sharpness_score: number;
  contrast_score: number;
  exposure_score: number;
  snr_score: number;
  resolution_score: number;
  blur_detected: boolean;
  under_exposed: boolean;
  over_exposed: boolean;
  aspect_ratio: number;
  dimensions: [number, number];
  status_summary: string;
}

export interface PredictionItem {
  label: string;
  probability: number;
  percentage: number;
  is_primary: boolean;
}

export interface AnalysisData {
  id: number;
  scan_id: number;
  scan_uid: string;
  model_name: string;
  model_version: string;
  modality: string;
  predicted_label: string;
  probability: number;
  confidence_score: number;
  uncertainty_score: number;
  entropy: number;
  is_ood: boolean;
  ood_score: number;
  risk_indicator: 'Low' | 'Moderate' | 'High' | 'Needs Review';
  risk_rationale?: string;
  heatmap_url?: string;
  segmentation_mask_url?: string;
  elevation_grid?: number[][];
  measurements: {
    total_regions_count?: number;
    total_roi_area_pct?: number;
    regions?: Array<{
      region_id: number;
      bounding_box: [number, number, number, number];
      area_pixels: number;
      perimeter_pixels: number;
      relative_area_pct: number;
    }>;
  };
  all_predictions: PredictionItem[];
  ensemble_agreement: {
    consensus_level?: string;
    variance?: number;
    agreement_ratio?: number;
  };
  inference_time_ms: number;
  is_demo_mode: boolean;
  safety_disclaimer: string;
  created_at: string;
}

export interface ScanItem {
  id: number;
  scan_uid: string;
  patient_id?: number;
  patient_reference_id?: string;
  file_name: string;
  file_url: string;
  original_file_name: string;
  file_size_bytes: number;
  file_format: string;
  detected_modality: string;
  modality_confidence: number;
  quality_score: number;
  quality_category: string;
  quality_metrics: QualityMetrics;
  status: string;
  is_synthetic_demo: boolean;
  created_at: string;
  has_analysis: boolean;
  predicted_label?: string;
  risk_indicator?: 'Low' | 'Moderate' | 'High' | 'Needs Review';
  review_status?: string;
  analysis?: AnalysisData;
}

export interface PatientItem {
  id: number;
  reference_id: string;
  pseudonym?: string;
  age?: number;
  sex?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  scans_count?: number;
  scans?: ScanItem[];
}

export interface ReviewQueueItem {
  scan_id: number;
  scan_uid: string;
  patient_reference_id: string;
  file_url: string;
  modality: string;
  quality_score: number;
  predicted_label: string;
  confidence_pct: number;
  uncertainty_score: number;
  risk_indicator: string;
  review_status: string;
  reviewer_name?: string;
  reviewer_notes?: string;
  reviewed_at?: string;
  created_at: string;
}

export interface ModelEntry {
  id: number;
  model_id: string;
  name: string;
  version: string;
  architecture: string;
  modality: string;
  task_type: string;
  dataset_name: string;
  labels: string[];
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  roc_auc: number;
  sensitivity: number;
  specificity: number;
  inference_speed_ms: number;
  is_active: boolean;
  is_installed: boolean;
  status: string;
  created_at: string;
  confusion_matrix?: number[][];
  roc_curve?: Array<{ fpr: number; tpr: number }>;
}

export interface ExperimentItem {
  id: number;
  experiment_id: string;
  name: string;
  model_name: string;
  dataset_name: string;
  architecture: string;
  epochs: number;
  batch_size: number;
  learning_rate: number;
  optimizer: string;
  train_loss_history: number[];
  val_loss_history: number[];
  train_acc_history: number[];
  val_acc_history: number[];
  final_metrics: Record<string, number>;
  notes?: string;
  status: string;
  created_at: string;
}

export interface DashboardAnalytics {
  total_scans: number;
  today_scans: number;
  reviewed_cases: number;
  pending_reviews: number;
  abnormal_screenings: number;
  average_inference_time_ms: number;
  system_health: string;
  models_active_count: number;
  scan_volume_trend: Array<{ date: string; scans: number; abnormal: number }>;
  risk_distribution: Record<string, number>;
  modality_breakdown: Record<string, number>;
  recent_scans: ScanItem[];
}

export interface SystemHealthData {
  status: string;
  version: string;
  environment: string;
  platform: string;
  python_runtime: string;
  pytorch_version: string;
  compute_device: string;
  cuda_available: boolean;
  database_status: string;
  inference_engine: string;
  storage: {
    free_gb: number;
    total_gb: number;
    used_pct: number;
    status: string;
  };
  privacy_mode: string;
  offline_ready: boolean;
}

export interface AuditLogItem {
  id: number;
  timestamp: string;
  user_identifier: string;
  role: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details: Record<string, any>;
  ip_address: string;
}

// Research & Intelligence Types
export interface EmbeddingNode {
  index: number;
  scan_id: number;
  scan_uid: string;
  file_name: string;
  patient_id?: number;
  modality: string;
  diagnosis: string;
  confidence: number;
  risk: string;
  coord_2d: [number, number];
  coord_3d: [number, number, number];
  cluster_id: number;
  cluster_label: string;
  outlier_score: number;
  is_outlier: boolean;
}

export interface EmbeddingUniverseData {
  total_nodes: number;
  manifold_dimensions: number;
  clustering_algorithm: string;
  nodes: EmbeddingNode[];
}

export interface SimilarCaseItem {
  scan_id: number;
  patient_id?: number;
  scan_uid: string;
  file_name: string;
  modality: string;
  diagnosis: string;
  confidence: number;
  similarity_score: number;
  similarity_percentage: number;
  heatmap_filename?: string;
  clinical_notes: string;
  category_label: string;
}

export interface CourtOpinionItem {
  model_id: string;
  model_name: string;
  architecture: string;
  version: string;
  modality: string;
  predicted_label: string;
  confidence: number;
  uncertainty: number;
  probability: number;
  risk: string;
  heatmap_filename?: string;
  key_rationale: string;
}

export interface ModelCourtDebateResult {
  scan_id: number;
  scan_uid: string;
  detected_modality: string;
  consensus_status: string;
  consensus_label: string;
  agreement_ratio: number;
  dispute_level: string;
  total_judges: number;
  majority_votes: number;
  average_confidence: number;
  confidence_variance: number;
  action_recommendation: string;
  court_opinions: CourtOpinionItem[];
}

export interface DigitalTwinTimelineItem {
  visit_index: number;
  scan_id: number;
  scan_uid: string;
  date: string;
  modality: string;
  diagnosis: string;
  confidence: number;
  risk: string;
  file_name: string;
  heatmap_filename?: string;
  quality_score: number;
}

export interface DigitalTwinComparisonItem {
  from_scan_id: number;
  to_scan_id: number;
  interval_label: string;
  difference_map_filename?: string;
  ssim_similarity: number;
  structural_stability_percent: number;
  anatomical_change_percent: number;
  delta_magnitude: string;
}

export interface PatientDigitalTwinData {
  patient: {
    id: number;
    reference_id: string;
    pseudonym?: string;
    age?: number;
    sex?: string;
  };
  total_visits: number;
  timeline: DigitalTwinTimelineItem[];
  consecutive_comparisons: DigitalTwinComparisonItem[];
}

export interface ProgressionTrajectoryPoint {
  month_offset: number;
  projected_area_pct: number;
  lower_bound_95ci: number;
  upper_bound_95ci: number;
  uncertainty_index: number;
  type: string;
}

export interface ProgressionSimulationResult {
  status: string;
  message?: string;
  observed_points: Array<{
    scan_id: number;
    date: string;
    month_offset: number;
    lesion_area_pct: number;
    confidence: number;
  }>;
  fitted_slope_pct_per_month?: number;
  trajectory_trend?: string;
  estimated_stability_level?: string;
  projected_trajectory: ProgressionTrajectoryPoint[];
  research_disclaimer?: string;
}

export interface PerturbationResultItem {
  perturbation_type: string;
  severity: number;
  perturbed_image_filename: string;
  perturbed_prediction: string;
  perturbed_confidence: number;
  prediction_maintained: boolean;
  confidence_delta: number;
  heatmap_filename?: string;
  status: string;
}

export interface StressTestResult {
  scan_id: number;
  model_id: string;
  baseline_label: string;
  baseline_confidence: number;
  overall_stability_score: number;
  robustness_tier: string;
  tests_evaluated: number;
  tests_passed: number;
  perturbation_results: PerturbationResultItem[];
}

export interface CalibrationBin {
  bin_midpoint: number;
  accuracy: number;
  confidence: number;
  calibration_gap: number;
  sample_count: number;
}

export interface CalibrationData {
  model_id: string;
  sample_size: number;
  ece: number;
  mce: number;
  brier_score: number;
  calibration_status: string;
  reliability_bins: CalibrationBin[];
}

export interface DatasetLeakageReport {
  status: string;
  leakage_score: number;
  patient_leakage_detected: boolean;
  overlapping_patient_ids: number[];
  duplicate_files_detected: number;
  train_patient_count: number;
  test_patient_count: number;
  val_patient_count: number;
  summary_recommendation: string;
}

export interface DatasetHealthReport {
  dataset_name: string;
  health_score: number;
  health_grade: string;
  total_samples: number;
  penalties: {
    missing_labels_penalty: number;
    low_quality_penalty: number;
    corrupted_penalty: number;
    class_imbalance_penalty: number;
  };
  class_distribution: Record<string, number>;
}

export interface ClinicalAnnotation {
  id: number;
  scan_id: number;
  author_name: string;
  author_role: string;
  annotation_type: string;
  label: string;
  data: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    points?: Array<{ x: number; y: number }>;
  };
  confidence: number;
  current_version: number;
  created_at: string;
  updated_at: string;
}

export interface ReviewerConsensusData {
  scan_id: number;
  raters_count: number;
  agreement_percentage: number;
  cohens_kappa: number;
  interpretation: string;
  labels_annotated?: string[];
}

export interface ModelCardData {
  model_id: string;
  name?: string;
  version?: string;
  architecture?: string;
  intended_use: string;
  non_intended_use: string;
  training_data_summary?: string;
  ethical_considerations?: string;
  limitations_known?: string;
  performance_breakdown: Record<string, number>;
  approval_status: string;
}
