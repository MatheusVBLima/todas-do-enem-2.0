#!/usr/bin/env python3
"""
Quick test script to verify Tesseract installation with Portuguese support
Run this BEFORE running the full OCR extraction scripts
"""

import sys
import pytesseract
from pathlib import Path

# Force UTF-8 encoding for output
if sys.platform == 'win32':
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

# Tesseract path
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH

def test_tesseract():
    """Test Tesseract installation and Portuguese support"""

    print("=" * 70)
    print("🔍 TESTE DE INSTALAÇÃO DO TESSERACT")
    print("=" * 70)
    print()

    # Test 1: Check if Tesseract is accessible
    print("📋 Teste 1: Verificando se Tesseract está acessível...")
    try:
        version = pytesseract.get_tesseract_version()
        print(f"   ✅ Tesseract encontrado! Versão: {version}")
    except Exception as e:
        print(f"   ❌ ERRO: Tesseract não encontrado!")
        print(f"   Mensagem: {e}")
        print()
        print("💡 Solução:")
        print("   1. Verifique se Tesseract está instalado em:")
        print(f"      {TESSERACT_PATH}")
        print("   2. Se não estiver, baixe e instale de:")
        print("      https://github.com/UB-Mannheim/tesseract/wiki")
        return False

    print()

    # Test 2: Check available languages
    print("📋 Teste 2: Verificando idiomas disponíveis...")
    try:
        languages = pytesseract.get_languages()
        print(f"   ✅ Idiomas instalados: {', '.join(languages)}")

        # Check specifically for Portuguese
        if 'por' in languages:
            print(f"   ✅ PORTUGUÊS (por) está instalado! 🎉")
            portuguese_ok = True
        else:
            print(f"   ❌ PORTUGUÊS (por) NÃO está instalado!")
            print()
            print("💡 Solução:")
            print("   1. Baixe o arquivo de idioma português:")
            print("      https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata")
            print()
            print("   2. Copie o arquivo baixado para:")
            print("      C:\\Program Files\\Tesseract-OCR\\tessdata\\")
            print()
            print("   3. Verifique se o arquivo por.traineddata está na pasta tessdata")
            print()
            print("   Veja o guia completo em: INSTALL-TESSERACT.md")
            portuguese_ok = False

    except Exception as e:
        print(f"   ❌ ERRO ao listar idiomas!")
        print(f"   Mensagem: {e}")
        return False

    print()

    # Test 3: Try OCR on a sample image (if Portuguese is available)
    if portuguese_ok:
        print("📋 Teste 3: Testando OCR em uma imagem de exemplo...")

        # Try to find a sample image from 2006
        sample_images = [
            Path(__file__).parent / "images" / "prova-2006",
            Path(__file__).parent / "images" / "prova-2007",
            Path(__file__).parent / "images" / "prova-2008",
        ]

        test_image = None
        for folder in sample_images:
            if folder.exists():
                pngs = list(folder.glob("*.png"))
                if pngs:
                    test_image = pngs[0]
                    break

        if test_image:
            try:
                from PIL import Image
                img = Image.open(test_image)
                text = pytesseract.image_to_string(img, lang='por')

                print(f"   ✅ OCR executado com sucesso em: {test_image.name}")
                print(f"   📝 Primeiros 200 caracteres extraídos:")
                print()
                print("   " + "-" * 66)
                preview = text[:200].replace('\n', '\n   ')
                print(f"   {preview}...")
                print("   " + "-" * 66)

            except Exception as e:
                print(f"   ⚠️  Erro ao processar imagem de teste:")
                print(f"   Mensagem: {e}")
        else:
            print(f"   ℹ️  Nenhuma imagem de teste encontrada (isso é OK)")

    print()
    print("=" * 70)

    if portuguese_ok:
        print("✅ TUDO OK! Você está pronto para executar os scripts de OCR!")
        print()
        print("📝 Próximos passos:")
        print("   1. Para processar anos 2006-2008 (PDFs escaneados):")
        print("      python ocr_extraction.py")
        print()
        print("   2. Para processar um PDF específico:")
        print("      python ocr-tesseract.py <PDF_PATH> <OUTPUT_MD>")
        return True
    else:
        print("❌ Instale o pacote de idioma PORTUGUÊS antes de continuar!")
        print("   Veja as instruções acima ou consulte: INSTALL-TESSERACT.md")
        return False

    print("=" * 70)

if __name__ == "__main__":
    success = test_tesseract()
    sys.exit(0 if success else 1)
