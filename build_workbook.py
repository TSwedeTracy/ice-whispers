import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_CELL_VERTICAL_ALIGNMENT, WD_TABLE_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Inches, Pt, RGBColor


SOURCE = Path(r"C:\Users\trasa\Elgiganten Cloud\TSwede Biz\TSwedeBiz Test Session Tllda.odt")
OUTPUT = Path(r"C:\Users\trasa\Elgiganten Cloud\Affärsideer och projekt\Kortlekar\Magic Runes\ICE Whispers APP\TSwedeBiz - Arbetsmaterial för gruppen.docx")

NAVY = "203047"
TEAL = "2A7F7F"
LAVENDER = "EEEAF7"
PALE_TEAL = "E8F4F3"
PALE_GOLD = "FFF4D6"
PALE_BLUE = "EAF1F8"
INK = "263238"
MUTED = "5E6B73"
WHITE = "FFFFFF"
LINE = "D9E1E8"


def read_paragraphs(path):
    with zipfile.ZipFile(path) as zf:
        root = ET.fromstring(zf.read("content.xml"))
    return ["".join(e.itertext()) for e in root.iter() if e.tag.endswith("}p") or e.tag.endswith("}h")]


def extract_json(paragraphs, heading, next_heading):
    start = paragraphs.index(heading) + 1
    end = paragraphs.index(next_heading) if next_heading else len(paragraphs)
    raw = "\n".join(paragraphs[start:end]).strip()
    return json.loads(raw)


def font(run, name="Aptos", size=10.5, color=INK, bold=False, italic=False):
    run.font.name = name
    run._element.get_or_add_rPr().rFonts.set(qn("w:ascii"), name)
    run._element.get_or_add_rPr().rFonts.set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = RGBColor.from_string(color)
    run.bold = bold
    run.italic = italic


def shade(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=100, start=140, bottom=100, end=140):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_borders(table, color=LINE, size=5):
    tbl_pr = table._tbl.tblPr
    borders = tbl_pr.first_child_found_in("w:tblBorders")
    if borders is None:
        borders = OxmlElement("w:tblBorders")
        tbl_pr.append(borders)
    for edge in ("top", "left", "bottom", "right", "insideH", "insideV"):
        tag = borders.find(qn(f"w:{edge}"))
        if tag is None:
            tag = OxmlElement(f"w:{edge}")
            borders.append(tag)
        tag.set(qn("w:val"), "single")
        tag.set(qn("w:sz"), str(size))
        tag.set(qn("w:color"), color)


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    header = OxmlElement("w:tblHeader")
    header.set(qn("w:val"), "true")
    tr_pr.append(header)


def keep_with_next(p):
    p.paragraph_format.keep_with_next = True


def add_title(doc, text, subtitle=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    font(r, size=27, color=NAVY, bold=True)
    if subtitle:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(16)
        r = p.add_run(subtitle)
        font(r, size=12.5, color=MUTED)


def add_heading(doc, text, level=1):
    p = doc.add_paragraph(style=f"Heading {level}")
    p.add_run(text)
    keep_with_next(p)
    return p


def add_body(doc, text, bold_label=None, color=INK, italic=False, after=6):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    if bold_label:
        r = p.add_run(bold_label)
        font(r, bold=True, color=color)
    r = p.add_run(text)
    font(r, color=color, italic=italic)
    return p


def add_bullet(doc, text, level=0):
    p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
    p.paragraph_format.left_indent = Inches(0.5 if level == 0 else 0.75)
    p.paragraph_format.first_line_indent = Inches(-0.25)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run(text)
    font(r)
    return p


def add_callout(doc, label, text, fill=PALE_TEAL):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    shade(cell, fill)
    set_cell_margins(cell, top=150, bottom=150, start=190, end=190)
    set_table_borders(table, color=fill, size=2)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(label.upper())
    font(r, size=9, color=TEAL, bold=True)
    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    r = p.add_run(text)
    font(r, size=10.5)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def add_labeled_card(doc, title, fields, fill=PALE_BLUE):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    cell = table.cell(0, 0)
    shade(cell, fill)
    set_cell_margins(cell, top=140, bottom=140, start=180, end=180)
    set_table_borders(table, color=LINE, size=4)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run(title)
    font(r, size=12, color=NAVY, bold=True)
    for label, value in fields:
        p = cell.add_paragraph()
        p.paragraph_format.space_after = Pt(3)
        r = p.add_run(label + ": ")
        font(r, size=10, color=TEAL, bold=True)
        r = p.add_run(str(value))
        font(r, size=10)
    doc.add_paragraph().paragraph_format.space_after = Pt(1)


def add_section_page(doc, kicker, title, intro):
    doc.add_page_break()
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(90)
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(kicker.upper())
    font(r, size=10, color=TEAL, bold=True)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(12)
    r = p.add_run(title)
    font(r, size=25, color=NAVY, bold=True)
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(20)
    r = p.add_run(intro)
    font(r, size=12, color=MUTED)


def add_priority(doc, number, item):
    add_labeled_card(doc, f"{number}. {item['what']}", [
        ("Why", item["why"]),
        ("First step", item["firstStep"]),
    ], PALE_TEAL if number % 2 else PALE_BLUE)


paragraphs = read_paragraphs(SOURCE)
free_report = extract_json(paragraphs, "=== FREE REPORT ===", "=== DEEP DIVE CHAT TRANSCRIPT ===")
deep_report = extract_json(paragraphs, "=== DEEP DIVE REPORT ===", "=== MY BUSINESS BLUEPRINT ===")
blueprint = extract_json(paragraphs, "=== MY BUSINESS BLUEPRINT ===", None)

chat_start = paragraphs.index("=== DEEP DIVE CHAT TRANSCRIPT ===") + 1
chat_end = paragraphs.index("=== DEEP DIVE REPORT ===")
chat = []
for line in paragraphs[chat_start:chat_end]:
    if line.startswith("AI: "):
        chat.append(("Question", line[4:]))
    elif line.startswith("Owner: "):
        chat.append(("Answer", line[7:]))
    elif line:
        chat.append(("Note", line))

doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.75)
section.bottom_margin = Inches(0.75)
section.left_margin = Inches(1)
section.right_margin = Inches(1)
section.header_distance = Inches(0.35)
section.footer_distance = Inches(0.35)

styles = doc.styles
normal = styles["Normal"]
normal.font.name = "Aptos"
normal._element.rPr.rFonts.set(qn("w:ascii"), "Aptos")
normal._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos")
normal.font.size = Pt(10.5)
normal.font.color.rgb = RGBColor.from_string(INK)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.14

for name, size, before, after, color in (
    ("Heading 1", 17, 16, 8, NAVY),
    ("Heading 2", 13.5, 12, 6, TEAL),
    ("Heading 3", 11.5, 9, 4, NAVY),
):
    style = styles[name]
    style.font.name = "Aptos Display"
    style._element.rPr.rFonts.set(qn("w:ascii"), "Aptos Display")
    style._element.rPr.rFonts.set(qn("w:hAnsi"), "Aptos Display")
    style.font.size = Pt(size)
    style.font.bold = True
    style.font.color.rgb = RGBColor.from_string(color)
    style.paragraph_format.space_before = Pt(before)
    style.paragraph_format.space_after = Pt(after)
    style.paragraph_format.keep_with_next = True

header = section.header
p = header.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
r = p.add_run("TSwedeBiz  |  Gruppens arbetsmaterial")
font(r, size=8.5, color=MUTED, bold=True)

footer = section.footer
p = footer.paragraphs[0]
p.alignment = WD_ALIGN_PARAGRAPH.CENTER
r = p.add_run("Mystery book box - test session 2026-08-29")
font(r, size=8, color=MUTED)

add_title(doc, "Mystery Book Box", "Frågor, rapport och business blueprint - i en tydlig arbetsbok för gruppen")
add_callout(doc, "Så använder ni materialet", "Läs en del i taget. Stanna efter varje avsnitt och prata om vad ni håller med om, vad ni vill ändra och vem som gör nästa steg. Originalfrågorna, svaren och rapportinnehållet är bevarade på engelska.", PALE_GOLD)
add_heading(doc, "Snabb överblick", 1)
add_labeled_card(doc, "Utgångsläge", [
    ("Business", "dont have one"),
    ("Goal", "12 customers"),
    ("Current", "0 customers"),
    ("Blocker", "i havent started yet"),
    ("Idea discovered in the session", "Reselling old books in mystery boxes"),
], LAVENDER)
add_heading(doc, "Förslag på gemensam genomgång", 2)
for item in (
    "Börja med frågorna och kontrollera att svaren fortfarande stämmer.",
    "Jämför den korta rapporten med den djupare rapporten.",
    "Välj högst tre saker från blueprinten att arbeta vidare med först.",
    "Skriv namn och datum bredvid de uppgifter ni bestämmer er för.",
):
    add_bullet(doc, item)

add_section_page(doc, "Del 1", "Frågor och svar", "Den ursprungliga deep-dive-dialogen, uppdelad så att det blir lätt att läsa högt och diskutera tillsammans.")
qno = 0
for role, text in chat:
    if role == "Question":
        qno += 1
        add_heading(doc, f"Fråga {qno}", 2)
        add_body(doc, text, color=NAVY)
    elif role == "Answer":
        add_callout(doc, "Svar i testsessionen", text, LAVENDER)
    else:
        add_body(doc, text, bold_label="AI note: ", color=MUTED, italic=True)

add_section_page(doc, "Del 2", "Free report", "Den första rapporten från testsessionen, presenterad som korta beslutspunkter i stället för rå JSON.")
for goal in free_report["goals"]:
    add_labeled_card(doc, goal["label"], [
        ("Target", goal["target"]), ("Current", goal["current"]),
        ("Progress", f"{goal['gapPercentage']}%"), ("Summary", goal["gapSummary"])
    ], LAVENDER)
add_heading(doc, "Top priorities", 1)
for i, item in enumerate(free_report["topPriorities"], 1):
    add_priority(doc, i, item)
add_callout(doc, "Biggest opportunity", free_report["biggestOpportunity"], PALE_TEAL)
add_callout(doc, "Biggest risk", free_report["biggestRisk"], PALE_GOLD)
add_callout(doc, "Why the next step matters", free_report["nextStepReason"], PALE_BLUE)

add_section_page(doc, "Del 3", "Deep dive report", "Den fullständiga rapporten: mål, prioriteringar, roadmap, risker, möjligheter och konkreta uppgifter.")
for goal in deep_report["goals"]:
    add_labeled_card(doc, goal["label"], [
        ("Target", goal["target"]), ("Current", goal["current"]),
        ("Progress", f"{goal['gapPercentage']}%"), ("Summary", goal["gapSummary"])
    ], LAVENDER)
add_heading(doc, "Top priorities", 1)
for i, item in enumerate(deep_report["topPriorities"], 1):
    add_priority(doc, i, item)

add_heading(doc, "Roadmap", 1)
table = doc.add_table(rows=1, cols=3)
table.alignment = WD_TABLE_ALIGNMENT.CENTER
table.autofit = False
widths = [Inches(1.15), Inches(1.6), Inches(3.75)]
for i, (cell, label) in enumerate(zip(table.rows[0].cells, ("Period", "Theme", "Focus"))):
    cell.width = widths[i]
    shade(cell, NAVY)
    set_cell_margins(cell)
    p = cell.paragraphs[0]
    r = p.add_run(label)
    font(r, size=9.5, color=WHITE, bold=True)
set_repeat_table_header(table.rows[0])
for row in deep_report["roadmap"]:
    cells = table.add_row().cells
    for i, key in enumerate(("period", "theme", "focus")):
        cells[i].width = widths[i]
        set_cell_margins(cells[i])
        cells[i].vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.TOP
        if len(table.rows) % 2 == 0:
            shade(cells[i], PALE_BLUE)
        r = cells[i].paragraphs[0].add_run(row[key])
        font(r, size=9.2, bold=(key != "focus"), color=NAVY if key != "focus" else INK)
set_table_borders(table)

add_heading(doc, "Month 1 focus areas", 1)
for item in deep_report["month1FocusAreas"]:
    add_labeled_card(doc, item["area"], [("Goal", item["goal"]), ("Why", item["why"])], PALE_TEAL)
add_heading(doc, "Risks", 1)
for item in deep_report["risks"]:
    add_bullet(doc, item)
add_heading(doc, "Opportunities", 1)
for item in deep_report["opportunities"]:
    add_bullet(doc, item)
add_heading(doc, "Identified tasks", 1)
for i, item in enumerate(deep_report["identifiedTasks"], 1):
    fields = [("Suggestion", item["suggestion"]), ("Reasoning", item["reasoning"])]
    if item.get("matchedService"):
        fields.append(("Matched service", item["matchedService"]))
    add_labeled_card(doc, f"{i}. {item['task']}", fields, PALE_BLUE if i % 2 else PALE_TEAL)
add_callout(doc, "Why the next step matters", deep_report["nextStepReason"], PALE_GOLD)

add_section_page(doc, "Del 4", "My Business Blueprint", "Blueprinten är ordnad efter Create, Protect, Communicate och Automate. Varje box innehåller nuläge, rekommendationer, vanliga misstag, bästa arbetssätt, exempel och verktyg.")
for category in blueprint["categories"]:
    add_heading(doc, category["cpca"], 1)
    for box in category["boxes"]:
        add_heading(doc, box["box"], 2)
        add_callout(doc, "What the session found", box["found"], LAVENDER)
        add_heading(doc, "Recommendations", 3)
        for item in box["recommendations"]:
            add_bullet(doc, item)
        more = box["learnMore"]
        add_heading(doc, "Common mistakes", 3)
        for item in more["commonMistakes"]:
            add_bullet(doc, item)
        add_heading(doc, "Best practices", 3)
        for item in more["bestPractices"]:
            add_bullet(doc, item)
        add_callout(doc, "Example", more["example"], PALE_GOLD)
        if more["tools"]:
            add_heading(doc, "Tools", 3)
            for item in more["tools"]:
                add_bullet(doc, item)

add_section_page(doc, "Avslutning", "Gruppens nästa steg", "Använd sidan som en enkel avslutning efter genomgången. Välj få saker och gör dem tydliga.")
for n in range(1, 4):
    add_labeled_card(doc, f"Prioritet {n}", [("Vad ska göras?", ""), ("Vem ansvarar?", ""), ("Klart senast", "")], PALE_TEAL if n % 2 else PALE_BLUE)
add_heading(doc, "Frågor att ta med till nästa möte", 2)
for _ in range(4):
    p = doc.add_paragraph("____________________________________________________________________")
    font(p.runs[0], color=LINE)
    p.paragraph_format.space_after = Pt(10)

doc.core_properties.title = "TSwedeBiz - Arbetsmaterial för gruppen"
doc.core_properties.subject = "Frågor, rapport och business blueprint"
doc.core_properties.author = "TSwedeBiz"
doc.save(OUTPUT)
print(OUTPUT)
