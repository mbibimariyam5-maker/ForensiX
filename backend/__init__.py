"""ForensiX backend package.

Applies a presentation layer to the existing ReportLab canvas used by the
legacy report endpoint, without changing its API or report data flow.
"""

from reportlab.lib import colors
from reportlab.pdfgen import canvas as _canvas
from reportlab.pdfbase.pdfmetrics import stringWidth


_OriginalCanvas = _canvas.Canvas


class ProfessionalCanvas(_OriginalCanvas):
    """Keep the existing PDF endpoint compatible while improving its layout."""

    def _draw_header_footer(self):
        width, height = self._pagesize
        self.saveState()
        self.setFillColor(colors.HexColor("#0B1220"))
        self.rect(0, height - 34, width, 34, stroke=0, fill=1)
        self.setFillColor(colors.white)
        self.setFont("Helvetica-Bold", 9)
        super().drawString(36, height - 22, "FORENSIX")
        self.setFont("Helvetica", 7)
        self.drawRightString(width - 36, height - 22, "DIGITAL FORENSICS INVESTIGATION REPORT")
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.line(36, 34, width - 36, 34)
        self.setFillColor(colors.HexColor("#64748B"))
        self.setFont("Helvetica", 7)
        super().drawString(36, 21, "Confidential • AI-Assisted Cyber Forensic Triage Platform")
        self.drawRightString(width - 36, 21, f"Page {self.getPageNumber()}")
        self.restoreState()

    def drawString(self, x, y, text, *args, **kwargs):
        text = str(text)
        width, height = self._pagesize

        if "FORENSIX - DIGITAL FORENSICS INVESTIGATION REPORT" in text:
            self.saveState()
            self.setFillColor(colors.HexColor("#0B1220"))
            self.roundRect(36, height - 105, width - 72, 55, 8, stroke=0, fill=1)
            self.setFillColor(colors.white)
            self.setFont("Helvetica-Bold", 16)
            self.drawCentredString(width / 2, height - 72, "FORENSIX")
            self.setFont("Helvetica", 8)
            self.drawCentredString(width / 2, height - 88, "DIGITAL FORENSICS INVESTIGATION REPORT")
            self.restoreState()
            return

        upper = text.strip().upper()
        section_words = (
            "CASE DESCRIPTION", "EVIDENCE", "FINDINGS", "TIMELINE",
            "VERIFICATION", "INTEGRITY", "REPORT", "SUMMARY"
        )

        if len(text) <= 55 and any(word in upper for word in section_words):
            self.saveState()
            band_y = max(42, y - 5)
            self.setFillColor(colors.HexColor("#E2E8F0"))
            self.roundRect(42, band_y, width - 84, 19, 4, stroke=0, fill=1)
            self.setFillColor(colors.HexColor("#0F172A"))
            self.setFont("Helvetica-Bold", 9)
            super().drawString(50, band_y + 6, text[:90])
            self.restoreState()
            return

        if upper.startswith(("CASE ID:", "CASE NAME:", "STATUS:", "GENERATED:")):
            self.saveState()
            self.setFillColor(colors.HexColor("#F8FAFC"))
            self.roundRect(42, y - 5, width - 84, 18, 3, stroke=0, fill=1)
            self.setFillColor(colors.HexColor("#334155"))
            self.setFont("Helvetica-Bold", 9)
            super().drawString(50, y + 2, text[:110])
            self.restoreState()
            return

        self.saveState()
        font_name = self._fontname if hasattr(self, "_fontname") else "Helvetica"
        font_size = self._fontsize if hasattr(self, "_fontsize") else 10
        max_width = width - 100
        if stringWidth(text, font_name, font_size) > max_width:
            while len(text) > 1 and stringWidth(text + "…", font_name, font_size) > max_width:
                text = text[:-1]
            text = text.rstrip() + "…"
        self.setFillColor(colors.HexColor("#1E293B"))
        super().drawString(50, y, text, *args, **kwargs)
        self.restoreState()

    def showPage(self):
        self._draw_header_footer()
        super().showPage()

    def save(self):
        self._draw_header_footer()
        super().save()


_canvas.Canvas = ProfessionalCanvas
