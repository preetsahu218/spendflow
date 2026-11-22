import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import re
import os

def set_cell_border(cell, **kwargs):
    """
    Set cell's border
    Usage:
    set_cell_border(
        cell,
        top={"sz": 4, "val": "single", "color": "D3D3D3"},
        bottom={"sz": 4, "val": "single", "color": "D3D3D3"},
        left={"sz": 4, "val": "single", "color": "D3D3D3"},
        right={"sz": 4, "val": "single", "color": "D3D3D3"},
    )
    """
    tcPr = cell._tc.get_or_add_tcPr()
    tcBorders = tcPr.first_child_found_in("w:tcBorders")
    if tcBorders is None:
        tcBorders = OxmlElement('w:tcBorders')
        tcPr.append(tcBorders)

    for edge in ('top', 'left', 'bottom', 'right', 'insideH', 'insideV'):
        edge_data = kwargs.get(edge)
        if edge_data:
            tag = 'w:{}'.format(edge)
            element = tcBorders.find(qn(tag))
            if element is None:
                element = OxmlElement(tag)
                tcBorders.append(element)
            for key in ["sz", "val", "color", "space", "shadow"]:
                if key in edge_data:
                    element.set(qn('w:{}'.format(key)), str(edge_data[key]))

def set_cell_shading(cell, color_hex):
    shading_elm = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{color_hex}"/>')
    cell._tc.get_or_add_tcPr().append(shading_elm)

def create_docx(md_path, docx_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    doc = docx.Document()

    # Set 1-inch margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(1)
        section.bottom_margin = Inches(1)
        section.left_margin = Inches(1)
        section.right_margin = Inches(1)

    # Style defaults
    normal_style = doc.styles['Normal']
    normal_style.font.name = 'Calibri'
    normal_style.font.size = Pt(11)
    normal_style.font.color.rgb = RGBColor(0x33, 0x33, 0x33)

    in_table = False
    table_lines = []

    def flush_table(tbl_lines):
        if not tbl_lines:
            return
        rows_data = []
        for l in tbl_lines:
            # Check if separator row (| :--- | :---: |)
            if re.match(r'^\s*\|?\s*[-:]+\s*\|', l):
                continue
            cols = [c.strip() for c in l.strip().strip('|').split('|')]
            if cols:
                rows_data.append(cols)

        if not rows_data:
            return

        col_count = max(len(r) for r in rows_data)
        # normalize
        for r in rows_data:
            while len(r) < col_count:
                r.append("")

        table = doc.add_table(rows=len(rows_data), cols=col_count)
        table.alignment = WD_TABLE_ALIGNMENT.CENTER

        for row_idx, row in enumerate(rows_data):
            for col_idx, cell_text in enumerate(row):
                cell = table.cell(row_idx, col_idx)
                cell.text = ""
                p = cell.paragraphs[0]
                p.paragraph_format.space_before = Pt(4)
                p.paragraph_format.space_after = Pt(4)

                # Process bold in table cells
                parts = re.split(r'(\*\*.*?\*\*)', cell_text)
                for part in parts:
                    if part.startswith('**') and part.endswith('**'):
                        run = p.add_run(part[2:-2])
                        run.bold = True
                    else:
                        p.add_run(part)

                # Format header row
                if row_idx == 0:
                    set_cell_shading(cell, "4F46E5") # Indigo
                    for r in p.runs:
                        r.font.bold = True
                        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)
                else:
                    if row_idx % 2 == 1:
                        set_cell_shading(cell, "F8FAFC")
                    set_cell_border(
                        cell,
                        top={"sz": 4, "val": "single", "color": "E2E8F0"},
                        bottom={"sz": 4, "val": "single", "color": "E2E8F0"},
                        left={"sz": 4, "val": "single", "color": "E2E8F0"},
                        right={"sz": 4, "val": "single", "color": "E2E8F0"}
                    )

        doc.add_paragraph() # space after table

    i = 0
    in_code_block = False
    code_lines = []

    while i < len(lines):
        line = lines[i].rstrip('\r\n')

        # Check code blocks
        if line.strip().startswith('```'):
            if in_code_block:
                in_code_block = False
                code_text = "\n".join(code_lines)
                tbl = doc.add_table(rows=1, cols=1)
                tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
                cell = tbl.cell(0, 0)
                set_cell_shading(cell, "F1F5F9")
                set_cell_border(
                    cell,
                    top={"sz": 4, "val": "single", "color": "CBD5E1"},
                    bottom={"sz": 4, "val": "single", "color": "CBD5E1"},
                    left={"sz": 12, "val": "single", "color": "4F46E5"},
                    right={"sz": 4, "val": "single", "color": "CBD5E1"},
                )
                cell.text = ""
                p = cell.paragraphs[0]
                run = p.add_run(code_text)
                run.font.name = 'Consolas'
                run.font.size = Pt(9)
                run.font.color.rgb = RGBColor(0x1E, 0x29, 0x3B)
                doc.add_paragraph()
                code_lines = []
            else:
                in_code_block = True
                code_lines = []
            i += 1
            continue

        if in_code_block:
            code_lines.append(line)
            i += 1
            continue

        # Check table lines
        if '|' in line and (line.strip().startswith('|') or line.strip().endswith('|')):
            in_table = True
            table_lines.append(line)
            i += 1
            continue
        else:
            if in_table:
                flush_table(table_lines)
                table_lines = []
                in_table = False

        stripped = line.strip()

        # Page breaks / Dividers
        if stripped == '---':
            p = doc.add_paragraph()
            p.paragraph_format.space_after = Pt(12)
            i += 1
            continue

        if not stripped:
            i += 1
            continue

        # Headings
        if stripped.startswith('# '):
            text = stripped[2:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(18)
            p.paragraph_format.space_after = Pt(6)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text)
            run.font.size = Pt(22)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x1E, 0x1B, 0x4B) # Dark Indigo
        elif stripped.startswith('## '):
            text = stripped[3:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(14)
            p.paragraph_format.space_after = Pt(4)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text)
            run.font.size = Pt(16)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x31, 0x2E, 0x81)
        elif stripped.startswith('### '):
            text = stripped[4:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(10)
            p.paragraph_format.space_after = Pt(3)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text)
            run.font.size = Pt(13)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x43, 0x38, 0xCA)
        elif stripped.startswith('#### '):
            text = stripped[5:].strip()
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(8)
            p.paragraph_format.space_after = Pt(2)
            p.paragraph_format.keep_with_next = True
            run = p.add_run(text)
            run.font.size = Pt(11)
            run.font.bold = True
            run.font.color.rgb = RGBColor(0x4F, 0x46, 0xE5)
        # Bullet list items
        elif stripped.startswith('- ') or stripped.startswith('* '):
            p = doc.add_paragraph(style='List Bullet')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            content = stripped[2:].strip()
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', content)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    run = p.add_run(part[1:-1])
                    run.italic = True
                elif part.startswith('`') and part.endswith('`'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(0x63, 0x66, 0xF1)
                else:
                    p.add_run(part)
        # Numbered list items
        elif re.match(r'^\d+\.\s+', stripped):
            prefix_match = re.match(r'^\d+\.\s+', stripped)
            content = stripped[prefix_match.end():].strip()
            p = doc.add_paragraph(style='List Number')
            p.paragraph_format.space_before = Pt(1)
            p.paragraph_format.space_after = Pt(2)
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', content)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    run = p.add_run(part[1:-1])
                    run.italic = True
                elif part.startswith('`') and part.endswith('`'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(0x63, 0x66, 0xF1)
                else:
                    p.add_run(part)
        else:
            # Regular paragraph
            p = doc.add_paragraph()
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(4)
            parts = re.split(r'(\*\*.*?\*\*|\*.*?\*|`.*?`)', stripped)
            for part in parts:
                if part.startswith('**') and part.endswith('**'):
                    run = p.add_run(part[2:-2])
                    run.bold = True
                elif part.startswith('*') and part.endswith('*'):
                    run = p.add_run(part[1:-1])
                    run.italic = True
                elif part.startswith('`') and part.endswith('`'):
                    run = p.add_run(part[1:-1])
                    run.font.name = 'Consolas'
                    run.font.size = Pt(9.5)
                    run.font.color.rgb = RGBColor(0x63, 0x66, 0xF1)
                else:
                    p.add_run(part)

        i += 1

    if in_table:
        flush_table(table_lines)

    doc.save(docx_path)
    print(f"Successfully generated DOCX at {docx_path}")

if __name__ == '__main__':
    md = r"C:\Users\sahup\.gemini\antigravity\scratch\expense-tracker\PROJECT_REPORT.md"
    out = r"C:\Users\sahup\.gemini\antigravity\scratch\expense-tracker\PROJECT_REPORT.docx"
    create_docx(md, out)
