import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors


def generate_analysis_pdf(analysis) -> io.BytesIO:
    """
    Generates a clean, professional PDF summary report of the ATS analysis using ReportLab.
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "ReportTitle",
        parent=styles["Heading1"],
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1e293b"),
        spaceAfter=4,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=styles["Normal"],
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#64748b"),
        spaceAfter=12,
    )
    heading2_style = ParagraphStyle(
        "ReportHeading2",
        parent=styles["Heading2"],
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#0f172a"),
        spaceBefore=10,
        spaceAfter=6,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=styles["Normal"],
        fontSize=9,
        leading=13,
        textColor=colors.HexColor("#334155"),
    )
    small_style = ParagraphStyle(
        "ReportSmall",
        parent=styles["Normal"],
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#64748b"),
    )

    story = []

    # Title Banner
    story.append(Paragraph("<b>CareerAI — Resume ATS Evaluation Report</b>", title_style))
    story.append(Paragraph("Confidential Diagnostic Summary & Career Optimization Insights", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#3b82f6"), spaceAfter=14))

    # Candidate & File Info Table
    extracted = analysis.extracted_data or {}
    contact = extracted.get("contact_info", {})
    candidate_name = extracted.get("candidate_name") or "Candidate"
    email = contact.get("email") or "Not detected"
    phone = contact.get("phone") or "Not detected"
    target_role = analysis.target_role or "General Profile Evaluation"

    info_data = [
        [
            Paragraph(f"<b>Candidate:</b> {candidate_name}", body_style),
            Paragraph(f"<b>Overall ATS Score:</b> <font size=14 color='#2563eb'><b>{analysis.overall_score} / 100</b></font>", body_style)
        ],
        [
            Paragraph(f"<b>Email:</b> {email}", body_style),
            Paragraph(f"<b>Target Role:</b> {target_role}", body_style)
        ],
        [
            Paragraph(f"<b>Phone:</b> {phone}", body_style),
            Paragraph(f"<b>Analyzed File:</b> {analysis.filename}", body_style)
        ]
    ]
    info_table = Table(info_data, colWidths=[270, 270])
    info_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#f8fafc")),
        ("PADDING", (0, 0), (-1, -1), 6),
        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    story.append(info_table)
    story.append(Spacer(1, 14))

    # Score Breakdown Section
    story.append(Paragraph("<b>Component-Level ATS Score Breakdown</b>", heading2_style))
    breakdown = analysis.score_breakdown or {}

    breakdown_data = [
        ["Evaluation Pillar", "Score", "Max", "Status", "Evaluation Details"]
    ]

    pillar_labels = {
        "skills": "Skills Match",
        "experience": "Relevant Experience",
        "education": "Education Alignment",
        "projects": "Projects Relevance",
        "formatting_and_completeness": "Completeness & Formatting"
    }

    for key, label in pillar_labels.items():
        pillar = breakdown.get(key, {})
        sc = pillar.get("score", 0)
        mx = pillar.get("max", 0)
        expl = pillar.get("explanation", "")
        status = "Pass" if sc >= (mx * 0.7) else "Needs Attention"
        status_color = "#16a34a" if status == "Pass" else "#ca8a04"

        breakdown_data.append([
            Paragraph(f"<b>{label}</b>", body_style),
            f"{sc}",
            f"{mx}",
            Paragraph(f"<font color='{status_color}'><b>{status}</b></font>", body_style),
            Paragraph(expl, body_style)
        ])

    breakdown_table = Table(breakdown_data, colWidths=[130, 40, 35, 80, 255])
    breakdown_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e2e8f0")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#1e293b")),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#cbd5e1")),
        ("PADDING", (0, 0), (-1, -1), 5),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("ALIGN", (1, 0), (2, -1), "CENTER"),
    ]))
    story.append(breakdown_table)
    story.append(Spacer(1, 14))

    # Skills Section
    story.append(Paragraph("<b>Skills Analysis</b>", heading2_style))
    matched = analysis.matched_skills or []
    missing = analysis.missing_skills or []

    skills_text = f"<b>Identified / Matched Skills ({len(matched)}):</b> " + (", ".join(matched) if matched else "None identified")
    story.append(Paragraph(skills_text, body_style))
    story.append(Spacer(1, 4))

    if missing:
        missing_text = f"<b><font color='#dc2626'>Key Missing Keywords ({len(missing)}):</font></b> " + ", ".join(missing)
        story.append(Paragraph(missing_text, body_style))
        story.append(Spacer(1, 6))

    # Actionable Suggestions Section
    suggestions = analysis.improvement_suggestions or []
    if suggestions:
        story.append(Spacer(1, 8))
        story.append(Paragraph("<b>Actionable Optimization Suggestions</b>", heading2_style))
        for idx, sugg in enumerate(suggestions, 1):
            story.append(Paragraph(f"<b>{idx}.</b> {sugg}", body_style))
            story.append(Spacer(1, 3))

    # Legal Disclaimer
    story.append(Spacer(1, 14))
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#94a3b8"), spaceAfter=6))
    story.append(Paragraph(
        "<b>DISCLAIMER:</b> This report is generated algorithmically for educational and preparation purposes. "
        "CareerAI does not guarantee hiring outcomes, employer callbacks, or exact alignment with proprietary ATS filters.",
        small_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer
