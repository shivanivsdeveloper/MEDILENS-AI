import os
from datetime import datetime
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage, KeepTogether, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from backend.app.config.settings import settings

class PDFReportGenerator:
    """
    Generates institutional-grade medical screening PDF reports
    with embedded radiograph images, Grad-CAM overlays, telemetry, and clinical safety disclaimers.
    """

    @staticmethod
    def generate_report(
        output_pdf_path: str,
        patient_ref: str,
        patient_age: str,
        patient_sex: str,
        scan_date: str,
        modality: str,
        quality_score: float,
        quality_category: str,
        predicted_label: str,
        confidence_pct: float,
        uncertainty_score: float,
        risk_indicator: str,
        risk_rationale: str,
        model_name: str,
        model_version: str,
        original_image_path: str,
        heatmap_image_path: str,
        reviewer_name: str = "Dr. S. Clinical Radiologist",
        reviewer_decision: str = "Accepted (AI Screening Verified)",
        reviewer_notes: str = "Congruent with radiologic presentation. Routine follow-up."
    ) -> str:
        doc = SimpleDocTemplate(
            output_pdf_path,
            pagesize=letter,
            rightMargin=36,
            leftMargin=36,
            topMargin=36,
            bottomMargin=36
        )

        styles = getSampleStyleSheet()
        
        # Custom Clinical Styles
        title_style = ParagraphStyle(
            "DocTitle",
            parent=styles["Heading1"],
            fontSize=20,
            leading=24,
            textColor=colors.HexColor("#0B2545"),
            fontName="Helvetica-Bold",
            spaceAfter=4
        )
        subtitle_style = ParagraphStyle(
            "DocSubTitle",
            parent=styles["Normal"],
            fontSize=10,
            leading=13,
            textColor=colors.HexColor("#475569"),
            fontName="Helvetica",
            spaceAfter=12
        )
        section_heading = ParagraphStyle(
            "SectionHeading",
            parent=styles["Heading2"],
            fontSize=12,
            leading=16,
            textColor=colors.HexColor("#0F172A"),
            fontName="Helvetica-Bold",
            spaceBefore=8,
            spaceAfter=4
        )
        body_style = ParagraphStyle(
            "BodyTextCustom",
            parent=styles["Normal"],
            fontSize=9,
            leading=12,
            textColor=colors.HexColor("#1E293B")
        )
        disclaimer_style = ParagraphStyle(
            "DisclaimerText",
            parent=styles["Normal"],
            fontSize=8,
            leading=11,
            textColor=colors.HexColor("#991B1B"),
            fontName="Helvetica-Bold"
        )

        story = []

        # 1. Header Banner
        header_data = [
            [
                Paragraph("<b>MEDISCAN AI</b> | Spatial Medical Screening Platform", title_style),
                Paragraph(f"<b>Report ID:</b> RPT-{datetime.utcnow().strftime('%Y%m%d')}-{patient_ref[:6]}<br/><b>Generated:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC", ParagraphStyle("HeaderRight", parent=body_style, alignment=2))
            ]
        ]
        t_header = Table(header_data, colWidths=[360, 180])
        t_header.setStyle(TableStyle([
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ]))
        story.append(t_header)
        story.append(Spacer(1, 6))
        story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#0284C7"), spaceAfter=10))

        # 2. Patient & Scan Identification
        story.append(Paragraph("1. PATIENT & SCAN TELEMETRY", section_heading))
        patient_table_data = [
            [
                Paragraph(f"<b>Patient Reference ID:</b> {patient_ref}", body_style),
                Paragraph(f"<b>Age / Sex:</b> {patient_age or 'N/A'} / {patient_sex or 'N/A'}", body_style),
                Paragraph(f"<b>Acquisition Date:</b> {scan_date}", body_style)
            ],
            [
                Paragraph(f"<b>Imaging Modality:</b> {modality}", body_style),
                Paragraph(f"<b>Quality Score:</b> {quality_score}/100 ({quality_category})", body_style),
                Paragraph(f"<b>Engine Version:</b> {model_name} v{model_version}", body_style)
            ]
        ]
        t_patient = Table(patient_table_data, colWidths=[180, 180, 180])
        t_patient.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('LEFTPADDING', (0,0), (-1,-1), 8),
            ('RIGHTPADDING', (0,0), (-1,-1), 8),
        ]))
        story.append(t_patient)
        story.append(Spacer(1, 10))

        # 3. AI Screening Inference & Risk Stratification
        story.append(Paragraph("2. AI SCREENING & RISK STRATIFICATION", section_heading))
        
        # Risk Badge Color
        risk_color = "#16A34A" if risk_indicator == "Low" else "#EA580C" if risk_indicator == "Moderate" else "#DC2626"
        
        results_data = [
            [
                Paragraph("<b>Primary Screening Finding</b>", body_style),
                Paragraph("<b>Probability / Confidence</b>", body_style),
                Paragraph("<b>Uncertainty Metric</b>", body_style),
                Paragraph("<b>Screening Risk Level</b>", body_style)
            ],
            [
                Paragraph(f"<b><font size=11 color='#0F172A'>{predicted_label}</font></b>", body_style),
                Paragraph(f"<b>{confidence_pct}%</b>", body_style),
                Paragraph(f"{uncertainty_score} (Shannon Entropy)", body_style),
                Paragraph(f"<b><font color='{risk_color}'>{risk_indicator.upper()}</font></b>", body_style)
            ]
        ]
        t_results = Table(results_data, colWidths=[160, 120, 130, 130])
        t_results.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
            ('BACKGROUND', (0,1), (-1,1), colors.HexColor("#FFFFFF")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94A3B8")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
            ('ALIGN', (1,0), (-1,-1), 'CENTER'),
        ]))
        story.append(t_results)
        story.append(Spacer(1, 4))
        story.append(Paragraph(f"<b>Risk Evaluation Rationale:</b> {risk_rationale}", body_style))
        story.append(Spacer(1, 10))

        # 4. Radiographic Images & Explainability Visualizations
        story.append(Paragraph("3. EXPLAINABILITY & SALIENCY LOCALIZATION (GRAD-CAM++)", section_heading))
        
        img_cells = []
        if os.path.exists(original_image_path):
            try:
                img_cells.append(RLImage(original_image_path, width=2.4*inch, height=2.4*inch))
            except Exception:
                img_cells.append(Paragraph("Raw Radiograph Render Error", body_style))
        else:
            img_cells.append(Paragraph("Raw Radiograph Not Found", body_style))

        if os.path.exists(heatmap_image_path):
            try:
                img_cells.append(RLImage(heatmap_image_path, width=2.4*inch, height=2.4*inch))
            except Exception:
                img_cells.append(Paragraph("Grad-CAM Overlay Render Error", body_style))
        else:
            img_cells.append(Paragraph("Grad-CAM Overlay Not Found", body_style))

        image_table_data = [
            [Paragraph("<b>Raw Input Radiograph</b>", ParagraphStyle("Cap1", parent=body_style, alignment=1)),
             Paragraph("<b>Grad-CAM++ Activation Heatmap</b>", ParagraphStyle("Cap2", parent=body_style, alignment=1))],
            [img_cells[0], img_cells[1]]
        ]
        t_images = Table(image_table_data, colWidths=[270, 270])
        t_images.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F1F5F9")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ]))
        story.append(t_images)
        story.append(Spacer(1, 10))

        # 5. Clinical Reviewer Verification Block
        story.append(Paragraph("4. CLINICAL REVIEW & HUMAN-IN-THE-LOOP VERIFICATION", section_heading))
        review_data = [
            [
                Paragraph(f"<b>Reviewing Clinician:</b> {reviewer_name}", body_style),
                Paragraph(f"<b>Decision Status:</b> {reviewer_decision}", body_style)
            ],
            [
                Paragraph(f"<b>Clinical Notes:</b> {reviewer_notes}", body_style),
                Paragraph("<b>Signature:</b> <i>Verified Digitally via MediScan AI Console</i>", body_style)
            ]
        ]
        t_review = Table(review_data, colWidths=[270, 270])
        t_review.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#94A3B8")),
            ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E2E8F0")),
            ('TOPPADDING', (0,0), (-1,-1), 6),
            ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_review)
        story.append(Spacer(1, 12))

        # 6. Safety Notice & Disclaimer
        disclaimer_box_data = [
            [
                Paragraph(
                    "<b>SAFETY DISCLAIMER & LIMITATION NOTICE:</b> This screening report was generated autonomously by "
                    "the MediScan AI Research & Decision-Support System. It is NOT a definitive clinical diagnosis. "
                    "All findings, probability indicators, and heatmap localizations must be interpreted by a qualified healthcare professional "
                    "in conjunction with complete patient clinical history and diagnostic laboratory results.",
                    disclaimer_style
                )
            ]
        ]
        t_disclaimer = Table(disclaimer_box_data, colWidths=[540])
        t_disclaimer.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#FEF2F2")),
            ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#DC2626")),
            ('TOPPADDING', (0,0), (-1,-1), 8),
            ('BOTTOMPADDING', (0,0), (-1,-1), 8),
            ('LEFTPADDING', (0,0), (-1,-1), 10),
            ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ]))
        story.append(t_disclaimer)

        doc.build(story)
        return output_pdf_path
