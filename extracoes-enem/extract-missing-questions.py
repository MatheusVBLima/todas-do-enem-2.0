#!/usr/bin/env python3
"""
Script para extrair questões específicas faltando de PDFs do ENEM.

Uso:
    python extract-missing-questions.py <pdf_path> <questoes_faltando> <output_md>

Exemplo:
    python extract-missing-questions.py "provas/2025/2025_PV_impresso_D2_CD7.pdf" "96,107" "temp-missing.md"
"""

import sys
import re
import pymupdf

def find_question_in_pdf(doc, question_num):
    """
    Encontra a página onde uma questão específica está localizada.
    Retorna (page_num, start_idx, end_idx) ou None se não encontrar.
    """
    pattern = rf'\*\*Questão {question_num}\*\*|QUESTÃO {question_num}'

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()

        # Procurar pela questão
        if re.search(pattern, text, re.IGNORECASE):
            print(f"[OK] Q{question_num} encontrada na página {page_num + 1}")
            return page_num

    print(f"[WARN] Q{question_num} não encontrada no PDF")
    return None

def extract_question_content(doc, question_num, start_page):
    """
    Extrai o conteúdo de uma questão específica.
    Extrai da questão até encontrar a próxima questão ou fim da página seguinte.
    """
    content = []
    current_page = start_page
    max_pages = min(start_page + 2, len(doc))  # Procurar até 2 páginas à frente

    for page_num in range(current_page, max_pages):
        page = doc[page_num]
        text = page.get_text()

        # Se é a primeira página, pegar do marcador da questão em diante
        if page_num == start_page:
            # Encontrar onde começa a questão
            match = re.search(rf'(\*\*Questão {question_num}\*\*|QUESTÃO {question_num})', text, re.IGNORECASE)
            if match:
                text = text[match.start():]

        # Verificar se tem próxima questão nesta página
        next_q_pattern = rf'\*\*Questão {question_num + 1}\*\*|QUESTÃO {question_num + 1}'
        next_match = re.search(next_q_pattern, text, re.IGNORECASE)

        if next_match:
            # Pegar só até a próxima questão
            text = text[:next_match.start()]
            content.append(text)
            break
        else:
            content.append(text)

        # Extrair imagens da página
        images = page.get_images()
        for img_idx, img in enumerate(images):
            xref = img[0]
            try:
                base_image = doc.extract_image(xref)
                image_data = base_image["image"]
                image_ext = base_image["ext"]

                # Salvar imagem
                img_filename = f"q{question_num}_p{page_num+1}_img{img_idx}.{image_ext}"
                img_path = f"images/temp-extraction/{img_filename}"

                # Adicionar referência no markdown
                content.append(f"\n![Imagem]({img_path})\n")

                # TODO: Salvar imagem de verdade se necessário
                # with open(img_path, 'wb') as f:
                #     f.write(image_data)

            except Exception as e:
                print(f"[WARN] Erro ao extrair imagem: {e}")

    return '\n'.join(content)

def extract_missing_questions(pdf_path, missing_questions, output_path):
    """
    Extrai questões específicas do PDF e salva em markdown.

    Args:
        pdf_path: Caminho do PDF
        missing_questions: Lista de números de questões (ex: [96, 107])
        output_path: Arquivo markdown de saída
    """
    print(f"[INFO] Abrindo PDF: {pdf_path}")
    doc = pymupdf.open(pdf_path)

    print(f"[INFO] Procurando questões: {missing_questions}")

    all_content = []

    for q_num in missing_questions:
        print(f"\n[INFO] Processando Q{q_num}...")

        # Encontrar a página da questão
        page_num = find_question_in_pdf(doc, q_num)

        if page_num is not None:
            # Extrair conteúdo da questão
            q_content = extract_question_content(doc, q_num, page_num)

            if q_content.strip():
                all_content.append(f"\n\n{'='*60}\n")
                all_content.append(f"**Questão {q_num}**\n")
                all_content.append(f"{'='*60}\n\n")
                all_content.append(q_content)
                print(f"[OK] Q{q_num} extraída com sucesso ({len(q_content)} caracteres)")
            else:
                print(f"[WARN] Q{q_num} encontrada mas sem conteúdo extraído")
        else:
            print(f"[ERROR] Q{q_num} não encontrada no PDF")

    # Salvar arquivo
    if all_content:
        print(f"\n[INFO] Salvando em: {output_path}")
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(''.join(all_content))

        print(f"[OK] {len(missing_questions)} questões extraídas")
        print(f"[OK] Arquivo salvo: {output_path}")
    else:
        print("[ERROR] Nenhuma questão foi extraída")

    doc.close()

def main():
    if len(sys.argv) < 4:
        print("Uso: python extract-missing-questions.py <pdf_path> <questoes> <output_md>")
        print("\nExemplo:")
        print('  python extract-missing-questions.py "provas/2025/2025_PV_impresso_D2_CD7.pdf" "96,107" "temp-missing.md"')
        sys.exit(1)

    pdf_path = sys.argv[1]
    questions_str = sys.argv[2]
    output_path = sys.argv[3]

    # Parse lista de questões
    try:
        missing_questions = [int(q.strip()) for q in questions_str.split(',')]
    except ValueError:
        print(f"[ERROR] Formato inválido para questões: {questions_str}")
        print("Use números separados por vírgula, ex: 96,107")
        sys.exit(1)

    print(f"\n{'='*60}")
    print("EXTRAÇÃO DE QUESTÕES FALTANDO - ENEM")
    print(f"{'='*60}\n")
    print(f"PDF: {pdf_path}")
    print(f"Questões: {missing_questions}")
    print(f"Output: {output_path}\n")

    extract_missing_questions(pdf_path, missing_questions, output_path)

    print(f"\n{'='*60}")
    print("[SUCCESS] Extração concluída!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
