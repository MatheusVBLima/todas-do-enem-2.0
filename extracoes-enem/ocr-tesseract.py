#!/usr/bin/env python3
"""
Script para aplicar OCR em PDFs escaneados usando Tesseract
Requer: pip install pytesseract pillow pdf2image
        E tesseract instalado no sistema
"""

import pytesseract
from pdf2image import convert_from_path
from pathlib import Path
import sys

def pdf_to_text_with_ocr(pdf_path: str, output_md: str):
    """
    Converte PDF escaneado para texto usando OCR

    Args:
        pdf_path: Caminho do PDF de entrada
        output_md: Caminho do arquivo Markdown de saída
    """

    print(f"📄 Processando: {pdf_path}")

    # Converte PDF para imagens (uma por página)
    print("🖼️  Convertendo PDF para imagens...")
    images = convert_from_path(pdf_path, dpi=300)
    print(f"   ✓ {len(images)} páginas convertidas")

    # Aplica OCR em cada página
    full_text = []

    for i, image in enumerate(images, 1):
        print(f"📖 OCR na página {i}/{len(images)}...", end=" ")

        # Aplica OCR com configuração para português
        text = pytesseract.image_to_string(
            image,
            lang='por',  # Idioma: português
            config='--psm 1'  # Page segmentation mode: Automatic with OSD
        )

        full_text.append(f"\n\n--- PÁGINA {i} ---\n\n")
        full_text.append(text)
        print("✓")

    # Salva resultado em Markdown
    output_path = Path(output_md)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(''.join(full_text))

    print(f"\n✅ Texto extraído salvo em: {output_md}")
    print(f"📊 Total de caracteres: {len(''.join(full_text))}")

def main():
    if len(sys.argv) < 3:
        print("Uso: python ocr-tesseract.py <PDF_PATH> <OUTPUT_MD>")
        print("\nExemplo:")
        print("  python ocr-tesseract.py provas/2008/2008_PV_impresso.pdf extracoes/2008/prova_enem_2008_ocr.md")
        sys.exit(1)

    pdf_path = sys.argv[1]
    output_md = sys.argv[2]

    if not Path(pdf_path).exists():
        print(f"❌ Erro: Arquivo não encontrado: {pdf_path}")
        sys.exit(1)

    pdf_to_text_with_ocr(pdf_path, output_md)

if __name__ == "__main__":
    main()
