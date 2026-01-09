#!/usr/bin/env python3
"""
Script para adicionar questões extraídas ao markdown existente.

Uso:
    python merge-missing-questions.py <markdown_base> <questoes_extraidas> <output>

Exemplo:
    python merge-missing-questions.py \
        "extracoes/2025/prova_enem_2025_D2_CD7.md" \
        "temp-missing-2025.md" \
        "extracoes/2025/prova_enem_2025_D2_CD7.md"
"""

import sys
import re

def parse_extracted_questions(extracted_file):
    """
    Parse arquivo de questões extraídas e retorna dict {numero: conteudo}
    """
    with open(extracted_file, 'r', encoding='utf-8') as f:
        content = f.read()

    questions = {}

    # Split por separadores
    sections = re.split(r'={60,}', content)

    current_num = None
    current_content = []

    for section in sections:
        section = section.strip()
        if not section:
            continue

        # Procurar por marcador de questão
        match = re.match(r'\*\*Questão (\d+)\*\*', section)
        if match:
            # Salvar questão anterior se existir
            if current_num and current_content:
                questions[current_num] = '\n'.join(current_content).strip()

            # Iniciar nova questão
            current_num = int(match.group(1))
            current_content = []
        elif current_num:
            # Continuar coletando conteúdo da questão atual
            if section:
                current_content.append(section)

    # Salvar última questão
    if current_num and current_content:
        questions[current_num] = '\n'.join(current_content).strip()

    return questions

def insert_questions_in_markdown(base_md, extracted_questions):
    """
    Insere questões extraídas no markdown base, ordenando por número.
    """
    with open(base_md, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Parse questões existentes no markdown
    existing_questions = []
    current_q = None
    current_lines = []

    for i, line in enumerate(lines):
        match = re.match(r'\*\*Questão (\d+)\*\*', line.strip())
        if match:
            # Salvar questão anterior
            if current_q:
                existing_questions.append((current_q, current_lines))

            # Iniciar nova questão
            current_q = int(match.group(1))
            current_lines = [line]
        elif current_q:
            current_lines.append(line)

    # Salvar última questão
    if current_q:
        existing_questions.append((current_q, current_lines))

    # Adicionar questões extraídas
    all_questions = {}

    # Adicionar existentes
    for q_num, q_lines in existing_questions:
        all_questions[q_num] = ''.join(q_lines)

    # Adicionar/substituir com extraídas
    for q_num, q_content in extracted_questions.items():
        formatted = f"**Questão {q_num}**\n\n{q_content}\n\n"
        all_questions[q_num] = formatted
        print(f"[OK] Q{q_num} adicionada/atualizada")

    # Ordenar por número
    sorted_questions = sorted(all_questions.items())

    # Montar conteúdo final
    result = []

    # Adicionar header se houver
    header_lines = []
    for line in lines:
        if re.match(r'\*\*Questão \d+\*\*', line.strip()):
            break
        header_lines.append(line)

    if header_lines:
        result.extend(header_lines)

    # Adicionar questões ordenadas
    for q_num, q_content in sorted_questions:
        result.append(q_content)

    return ''.join(result)

def main():
    if len(sys.argv) < 4:
        print("Uso: python merge-missing-questions.py <markdown_base> <questoes_extraidas> <output>")
        print("\nExemplo:")
        print('  python merge-missing-questions.py \\')
        print('      "extracoes/2025/prova_enem_2025_D2_CD7.md" \\')
        print('      "temp-missing-2025.md" \\')
        print('      "extracoes/2025/prova_enem_2025_D2_CD7_updated.md"')
        sys.exit(1)

    base_md = sys.argv[1]
    extracted_file = sys.argv[2]
    output_file = sys.argv[3]

    print(f"\n{'='*60}")
    print("MERGE DE QUESTÕES FALTANDO")
    print(f"{'='*60}\n")
    print(f"Markdown base: {base_md}")
    print(f"Questões extraídas: {extracted_file}")
    print(f"Output: {output_file}\n")

    # Parse questões extraídas
    print("[INFO] Parseando questões extraídas...")
    extracted_questions = parse_extracted_questions(extracted_file)
    print(f"[OK] {len(extracted_questions)} questões encontradas: {sorted(extracted_questions.keys())}\n")

    # Inserir no markdown
    print("[INFO] Inserindo questões no markdown...")
    merged_content = insert_questions_in_markdown(base_md, extracted_questions)

    # Salvar
    print(f"\n[INFO] Salvando em: {output_file}")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(merged_content)

    # Contar questões finais
    final_count = len(re.findall(r'\*\*Questão \d+\*\*', merged_content))
    print(f"[OK] Total de questões no arquivo final: {final_count}")

    print(f"\n{'='*60}")
    print("[SUCCESS] Merge concluído!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
