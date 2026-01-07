"""
OCR Extraction Script for ENEM exams (2008, 2007, 2006)
This script performs OCR on scanned PDFs to extract text.
"""

import pytesseract
from PIL import Image
import pathlib
import re
import sys

# Force UTF-8 encoding for output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# ============================================
# CONFIGURATION - UPDATE THIS PATH
# ============================================
# Point to your Tesseract executable
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

# Set Tesseract path
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()


def extract_text_from_images(year):
    """Extract text from all images in the prova-{year} folder"""
    image_folder = SCRIPT_DIR / "images" / f"prova-{year}"

    if not image_folder.exists():
        print(f"[X] Pasta nao encontrada: {image_folder}")
        return []

    # Get all PNG files sorted by name (numerically, not alphabetically)
    # Extract page numbers from filenames like "2007_amarela.pdf-10-0.png"
    def extract_page_number(path):
        import re
        match = re.search(r'-(\d+)-\d+\.png$', path.name)
        return int(match.group(1)) if match else 0

    image_files = sorted(image_folder.glob("*.png"), key=extract_page_number)

    if not image_files:
        print(f"[X] Nenhuma imagem encontrada em {image_folder}")
        return []

    print(f"[+] Encontradas {len(image_files)} imagens em {image_folder}")

    all_text = []

    for i, img_path in enumerate(image_files):
        print(f"  Processando imagem {i+1}/{len(image_files)}: {img_path.name}")

        try:
            img = Image.open(img_path)
            text = pytesseract.image_to_string(img, lang="por")  # Portuguese
            all_text.append(text)
        except Exception as e:
            print(f"  [!] Erro ao processar {img_path.name}: {e}")
            all_text.append("")

    return all_text


def clean_text(text_list):
    """Clean and organize the extracted text"""
    full_text = "\n\n".join(text_list)

    # Remove excessive newlines
    full_text = re.sub(r'\n{4,}', '\n\n', full_text)

    # Clean up whitespace
    full_text = re.sub(r'[ \t]+', ' ', full_text)
    full_text = re.sub(r'^\s+', '', full_text, flags=re.MULTILINE)
    full_text = re.sub(r'\s+$', '', full_text, flags=re.MULTILINE)

    return full_text


def create_markdown_with_ocr(year, text):
    """Create markdown file with extracted text"""
    output_folder = SCRIPT_DIR / "extracoes" / str(year)
    output_folder.mkdir(parents=True, exist_ok=True)

    output_path = output_folder / f"prova_enem_{year}.md"

    # Create markdown content
    md_content = f"""# Prova do ENEM {year}

**Nota:** Este arquivo foi gerado via OCR (reconhecimento otico de caracteres) a partir de imagens escaneadas.

---

{text}

---

*Gerado automaticamente via OCR*
"""

    pathlib.Path(output_path).write_text(md_content, encoding="utf-8")
    print(f"[OK] Markdown salvo em: {output_path}")

    return output_path


def process_year(year):
    """Process a single year"""
    print(f"\n{'='*50}")
    print(f"[BOOK] Processando ano: {year}")
    print(f"{'='*50}")

    # Extract text from images
    text_list = extract_text_from_images(year)

    if not text_list:
        print(f"[X] Nenhuma imagem encontrada para {year}")
        return

    # Clean text
    cleaned_text = clean_text(text_list)

    # Create markdown
    output_path = create_markdown_with_ocr(year, cleaned_text)

    # Statistics
    word_count = len(cleaned_text.split())
    char_count = len(cleaned_text)
    print(f"[STATS] Estatisticas:")
    print(f"   - Caracteres: {char_count:,}")
    print(f"   - Palavras: {word_count:,}")


# ============================================
# MAIN EXECUTION
# ============================================
if __name__ == "__main__":
    # Years with scanned PDFs (no text layer)
    years_to_process = [2008, 2007, 2006]

    print("="*60)
    print("[ABC] OCR EXTRACTION SCRIPT FOR ENEM")
    print("="*60)
    print(f"\nTesseract path: {TESSERACT_PATH}")
    print(f"Script directory: {SCRIPT_DIR}")
    print(f"\nAnos a processar: {years_to_process}")

    for year in years_to_process:
        process_year(year)

    print("\n" + "="*60)
    print("[OK] TODAS AS EXTRACOES OCR FORAM CONCLUIDAS!")
    print("="*60)
