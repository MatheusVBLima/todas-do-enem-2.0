# Progresso de Extração de Questões do ENEM

## Status por Ano

### ✅ 2025 - COMPLETO
- **D1**: 95 questões (Q1-90 + Q1-5 inglês/espanhol)
- **D2**: 90 questões (Q91-180)
- **Total**: 185/185 ✅
- **Notas**: Extração completa com parser Python

### ⚠️ 2024 - COMPLETO (com pequeno gap)
- **D1**: 90 questões únicas (Q1-90)
- **D2**: 90 questões (Q91-180)
- **Total**: 180/180 ✅
- **Notas**: Parser funcionou corretamente

### ⚠️ 2023 - QUASE COMPLETO (falta Q01 inglês)
- **D1**: 89/90 questões únicas (Q1-90)
  - ✅ Q1-5 espanhol (01-05)
  - ❌ Q1 inglês FALTA (era imagem no PDF)
  - ✅ Q2-5 inglês+espanhol (duplicatas normais)
  - ✅ Q6-45 Linguagens
  - ✅ Q46-90 Ciências Humanas
- **D2**: 90 questões (Q91-180)
- **Total**: 179/185 (6 questões faltando: Q1-inglês + Q91-180 que precisam ser re-parsadas)
- **Notas**:
  - Arquivo `prova_enem_2023.md` (merged) está corrompido com duplicatas
  - Usar arquivos separados: `prova_enem_2023_D1_CD1.md` + `prova_enem_2023_D2_CD7.md`
  - Q01 de inglês existe no PDF (página 2) mas é imagem - precisa de OCR manual

### ✅ 2022 - COMPLETO
- **D1**: 95 questões (Q1-90 + Q1-5 inglês/espanhol)
- **D2**: 90 questões (Q91-180)
- **Total**: 180/180 ✅
- **Notas**:
  - Marcadores Q49 e Q65 estavam faltando - foram adicionados manualmente
  - Q1-5 aparecem duplicados (inglês + espanhol) - comportamento normal

### 🔄 2021 - PROBLEMA DE ENCODING/OCR
- **Status**: Arquivo markdown existente está corrompido (só imagens)
- **PDF**: Tem texto mas com encoding especial (caracteres não decodificam corretamente)
- **Solução**: Precisa de OCR com Tesseract ou recoleta do PDF original do INEP
- **Arquivo atual**: `prova_enem_2021_D1_CD1.md` (319KB, 1 linha, 29 referências a imagens, 0 texto extraível)
- **PDF original**: `2021_PV_impresso_D1_CD1.pdf` (32 páginas, ~122KB texto extraível com problemas de encoding)

### ⏳ 2004-2020 - PENDENTES
- Anos anteriores aguardando processamento

---

## Problemas Conhecidos

1. **Q01 de inglês (2023 D1)**: Existe no PDF mas é imagem - OCR falhou
2. **Arquivo merged (2023)**: `prova_enem_2023.md` tem duplicatas - não usar
3. **Encoding UTF-8**: Arquivos usam bytes `\xc3\x83O` para "ÃO"

---

## Comandos Úteis

```bash
# Verificar questões em arquivo markdown
python -c "
import re
from collections import Counter
with open('arquivo.md', 'r', encoding='utf-8') as f:
    content = f.read()
matches = re.findall(r'QUEST[AÃO]+\s*(\d+)', content, re.IGNORECASE)
print(f'Total: {len(matches)}')
print(f'Unique: {len(set(matches))}')
"
```
