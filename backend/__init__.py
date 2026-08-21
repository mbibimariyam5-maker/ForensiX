"""ForensiX PDF presentation layer.

Keeps the existing report endpoint/data flow intact while turning the
canvas-based report into a structured forensic-style document.
"""

from reportlab.lib import colors
from reportlab.pdfgen import canvas as _canvas
from reportlab.pdfbase.pdfmetrics import stringWidth


_OriginalCanvas = _canvas.Canvas


class ProfessionalCanvas(_OriginalCanvas):
    """Style the existing canvas report without changing its API."""

    DARK = colors.HexColor("#0F172A")
    ACCENT = colors.HexColor("#2563EB")
    TEXT = colors.HexColor("#1E293B")
    MUTED = colors.HexColor("#64748B")
    BORDER = colors.HexColor("#CBD5E1")
    PANEL = colors.HexColor("#F8FAFC")
    PANEL_BLUE = colors.HexColor("#EFF6FF")

    def _line(self, x1, y1, x2, y2, color=None, width=0.8):
        self.saveState()
        self.setStrokeColor(color or self.BORDER)
        self.setLineWidth(width)
        self.line(x1, y1, x2, y2)
        self.restoreState()

    def _draw_header_footer(self):
        width, height = self._pagesize
        page = self.getPageNumber()

        self.saveState()
        if page > 1:
            self.setFillColor(self.DARK)
            self.rect(0, height - 32, width, 32, stroke=0, fill=1)
            self.setFillColor(colors.white)
            self.setFont("Helvetica-Bold", 9)
            super().drawString(36, height - 21, "FORENSIX")
            self.setFont("Helvetica", 7)
            self.drawRightString(
                width - 36,
                height - 21,
                "DIGITAL FORENSICS INVESTIGATION REPORT",
            )

        self._line(36, 34, width - 36, 34, self.BORDER, 0.7)
        self.setFillColor(self.MUTED)
        self.setFont("Helvetica", 7)
        super().drawString(
            36,
            21,
            "CONFIDENTIAL  •  AI-ASSISTED CYBER FORENSIC TRIAGE PLATFORM",
        )
        self.drawRightString(width - 36, 21, f"PAGE {page}")
        self.restoreState()

    def _section_band(self, x, y, width, text):
        band_y = max(48, y - 6)
        self.saveState()
        self.setFillColor(self.DARK)
        self.roundRect(x, band_y, width, 22, 4, stroke=0, fill=1)
        self.setFillColor(colors.white)
        self.setFont("Helvetica-Bold", 9)
        super().drawString(x + 10, band_y + 7, text.upper())
        self.restoreState()

    def _panel(self, x, y, width, height, fill=None):
        self.saveState()
        self.setFillColor(fill or self.PANEL)
        self.setStrokeColor(self.BORDER)
        self.setLineWidth(0.6)
        self.roundRect(x, y, width, height, 5, stroke=1, fill=1)
        self.restoreState()

    def drawString(self, x, y, text, *args, **kwargs):
        text = str(text)
        upper = text.strip().upper()
        width, _ = self._pagesize

        if upper.startswith("FORENSIX - DIGITAL FORENSICS INVESTIGATION REPORT"):
            self.saveState()
            self.setFillColor(self.DARK)
            self.roundRect(42, y - 4, width - 84, 30, 6, stroke=0, fill=1)
            self.setFillColor(colors.white)
            self.setFont("Helvetica-Bold", 14)
            self.drawCentredString(width / 2, y + 8, "FORENSIX")
            self.setFont("Helvetica", 7.5)
            self.drawCentredString(
                width / 2, y - 1, "DIGITAL FORENSICS INVESTIGATION REPORT"
            )
            self.restoreState()
            return

        section_words = (
            "CASE DESCRIPTION", "EVIDENCE", "FINDINGS", "INVESTIGATION TIMELINE",
            "VERIFICATION", "INTEGRITY", "REPORT", "SUMMARY",
            "CHAIN OF CUSTODY", "AI ANALYSIS",
        )
        if len(text) <= 60 and any(
            upper == word or upper.startswith(word + " ") for word in section_words
        ):
            self._section_band(42, y, width - 84, text)
            return

        if upper.startswith(("CASE ID:", "CASE NAME:", "STATUS:", "GENERATED:")):
            self.saveState()
            self.setFillColor(self.PANEL)
            self.setStrokeColor(self.BORDER)
            self.setLineWidth(0.45)
            self.roundRect(42, y - 5, width - 84, 18, 3, stroke=1, fill=1)
            self.setFillColor(self.MUTED)
            self.setFont("Helvetica-Bold", 8)
            label, _, value = text.partition(":")
            super().drawString(50, y + 1, label.upper() + ":")
            self.setFillColor(self.TEXT)
            self.setFont("Helvetica", 8.5)
            super().drawString(112, y + 1, value.strip()[:82])
            self.restoreState()
            return

        if upper.startswith("EVIDENCE #"):
            self._panel(42, y - 7, width - 84, 20, self.PANEL_BLUE)
            self.setFillColor(self.ACCENT)
            self.setFont("Helvetica-Bold", 9)
            super().drawString(52, y + 1, text[:100])
            return

        if upper.startswith(("TYPE:", "SHA-256:", "SIZE:")):
            self.saveState()
            self.setFillColor(self.TEXT)
            self.setFont("Helvetica", 8.5)
            super().drawString(58, y, text[:100])
            self._line(58, y - 5, width - 52, y - 5, colors.HexColor("#E2E8F0"), 0.45)
            self.restoreState()
            return

        if upper and " - " in text and (
            upper.startswith("FIND") or upper.startswith("F-") or "FINDING" in upper
        ):
            self._panel(42, y - 7, width - 84, 20, self.PANEL_BLUE)
            self.setFillColor(self.ACCENT)
            self.setFont("Helvetica-Bold", 9)
            super().drawString(52, y + 1, text[:100])
            return

        if upper.startswith(("SEVERITY:", "SCORE:", "ARTIFACT:")):
            self.saveState()
            self.setFillColor(self.TEXT)
            self.setFont("Helvetica", 8.5)
            super().drawString(58, y, text[:100])
            self._line(58, y - 5, width - 52, y - 5, colors.HexColor("#E2E8F0"), 0.45)
            self.restoreState()
            return

        if upper.startswith(("TOTAL EVIDENCE:", "TOTAL FINDINGS:", "TOTAL TIMELINE EVENTS:")):
            self.saveState()
            self.setFillColor(self.PANEL)
            self.setStrokeColor(self.BORDER)
            self.roundRect(42, y - 5, width - 84, 18, 3, stroke=1, fill=1)
            self.setFillColor(self.MUTED)
            self.setFont("Helvetica-Bold", 8.5)
            super().drawString(50, y + 1, text)
            self.restoreState()
            return

        if " - " in text and len(text) > 15:
            self.saveState()
            self.setFillColor(self.ACCENT)
            self.circle(49, y + 3, 2.2, stroke=0, fill=1)
            self.setFillColor(self.TEXT)
            self.setFont("Helvetica", 8.5)
            super().drawString(58, y, text[:100])
            self.restoreState()
            return

        self.saveState()
        font_name = getattr(self, "_fontname", "Helvetica")
        font_size = getattr(self, "_fontsize", 10)
        max_width = width - 100
        if stringWidth(text, font_name, font_size) > max_width:
            while len(text) > 1 and stringWidth(text + "…", font_name, font_size) > max_width:
                text = text[:-1]
            text = text.rstrip() + "…"
        self.setFillColor(self.TEXT)
        super().drawString(50, y, text, *args, **kwargs)
        self.restoreState()

    def showPage(self):
        self._draw_header_footer()
        super().showPage()

    def save(self):
        self._draw_header_footer()
        super().save()


_canvas.Canvas = ProfessionalCanvas
