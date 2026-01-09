"""
Script para extrair questões do PDF do ENEM 2021
Extrai texto do PDF e formata como markdown
"""
import pymupdf
import re

def extract_enem_2021():
    doc = pymupdf.open('provas/2021/2021_PV_impresso_D1_CD1.pdf')
    
    all_text = []
    
    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        
        # Clean up the text
        lines = text.split('\\n')
        cleaned_lines = []
        
        for line in lines:
            # Remove extra whitespace
            line = line.strip()
            if line:
                cleaned_lines.append(line)
        
        all_text.extend(cleaned_lines)
        all_text.append('')  # Empty line between pages
    
    # Write to file
    with open('extracoes/2021/prova_enem_2021_D1_CD1_new.md', 'w', encoding='utf-8') as f:
        f.write('\\n'.join(all_text))
    
    print(f'Extracted {len(all_text)} lines from {len(doc)} pages')
    
    # Find question markers
    content = '\\n'.join(all_text)
    matches = re.findall(r'QUEST[AÃO]+\\s*(\\d+)', content, re.IGNORECASE)
    print(f'Found {len(matches)} question markers')
    print(f'First 10: {matches[:10]}')

if __name__ == '__main__':
    extract_enem_2021()
