#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para convertir markdown a PDF usando reportlab.
Soporta markdown básico y genera un PDF profesional.
"""

import re
from pathlib import Path
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

def read_markdown(filepath):
    """Leer archivo markdown."""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def parse_markdown_to_elements(content):
    """Convertir markdown a elementos de reportlab."""
    from reportlab.platypus import Paragraph, Spacer, PageBreak

    styles = getSampleStyleSheet()

    # Estilos personalizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#1f4788'),
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )

    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading1'],
        fontSize=18,
        textColor=colors.HexColor('#1f4788'),
        spaceAfter=12,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderColor=colors.HexColor('#1f4788'),
        borderWidth=2,
        borderPadding=10
    )

    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#2d5aa8'),
        spaceAfter=10,
        spaceBefore=10,
        fontName='Helvetica-Bold'
    )

    heading3_style = ParagraphStyle(
        'CustomHeading3',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=colors.HexColor('#3d6ab8'),
        spaceAfter=8,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )

    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        alignment=TA_JUSTIFY,
        spaceAfter=10,
        leading=12
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['BodyText'],
        fontSize=8,
        fontName='Courier',
        textColor=colors.HexColor('#444444'),
        backColor=colors.HexColor('#f5f5f5'),
        spaceAfter=10,
        leftIndent=20
    )

    elements = []
    lines = content.split('\n')
    i = 0
    in_code_block = False
    code_content = []

    while i < len(lines):
        line = lines[i]

        # Bloques de código
        if line.startswith('```'):
            in_code_block = not in_code_block
            if not in_code_block and code_content:
                code_text = '\n'.join(code_content)
                elements.append(Paragraph(code_text.replace('<', '&lt;').replace('>', '&gt;'), code_style))
                elements.append(Spacer(1, 0.2 * inch))
                code_content = []
            i += 1
            continue

        if in_code_block:
            code_content.append(line)
            i += 1
            continue

        # Títulos
        if line.startswith('# '):
            title = line[2:].strip()
            elements.append(Paragraph(title, title_style))
            elements.append(Spacer(1, 0.3 * inch))
        elif line.startswith('## '):
            heading = line[3:].strip()
            elements.append(Paragraph(heading, heading1_style))
            elements.append(Spacer(1, 0.2 * inch))
        elif line.startswith('### '):
            heading = line[4:].strip()
            elements.append(Paragraph(heading, heading2_style))
            elements.append(Spacer(1, 0.15 * inch))
        elif line.startswith('#### '):
            heading = line[5:].strip()
            elements.append(Paragraph(heading, heading3_style))
            elements.append(Spacer(1, 0.1 * inch))
        elif line.startswith('---'):
            elements.append(Spacer(1, 0.2 * inch))
            elements.append(PageBreak())
            elements.append(Spacer(1, 0.2 * inch))
        elif line.strip() == '':
            elements.append(Spacer(1, 0.1 * inch))
        else:
            # Párrafos normales
            if line.strip():
                # Procesar formato de texto
                text = line.strip()
                # Reemplazar **bold** con <b>
                text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', text)
                # Reemplazar *italic* con <i>
                text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', text)
                # Reemplazar `código` con formato monoespaciado
                text = re.sub(r'`(.*?)`', r'<font face="Courier" size="9">\1</font>', text)

                elements.append(Paragraph(text, body_style))

        i += 1

    return elements

def markdown_to_pdf(md_file, pdf_file):
    """Convertir markdown a PDF."""
    # Leer contenido
    content = read_markdown(md_file)

    # Crear PDF
    doc = SimpleDocTemplate(
        pdf_file,
        pagesize=letter,
        rightMargin=0.75 * inch,
        leftMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    # Parsear markdown
    elements = parse_markdown_to_elements(content)

    # Construir PDF
    doc.build(elements)
    print(f"✓ PDF generado exitosamente: {pdf_file}")

if __name__ == '__main__':
    import sys

    if len(sys.argv) < 3:
        print("Uso: python md_to_pdf.py <input.md> <output.pdf>")
        sys.exit(1)

    md_input = sys.argv[1]
    pdf_output = sys.argv[2]

    try:
        markdown_to_pdf(md_input, pdf_output)
    except Exception as e:
        print(f"✗ Error: {e}")
        sys.exit(1)

