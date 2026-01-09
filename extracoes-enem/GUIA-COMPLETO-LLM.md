# 🤖 Guia Completo para LLM - Processamento ENEM 2024-1998

**Documento Mestre de Referência** | Última atualização: 09/01/2026

Este documento serve como guia principal para qualquer LLM (Claude, GPT, etc.) continuar o trabalho de processamento das questões do ENEM.

---

## 📚 Documentos de Referência

### Documento Principal (VOCÊ ESTÁ AQUI)
- **`extracoes-enem/GUIA-COMPLETO-LLM.md`** - Este arquivo. Guia mestre com todos os processos.

### Documentos Complementares
- **`plans/geracao-json-enem-2015-2025.md`** - Plano detalhado com workflow completo
- **`extracoes-enem/README.md`** - Scripts disponíveis e exemplos de uso
- **`extracoes-enem/PROXIMOS-PASSOS.md`** - Status atual e próximas ações (desatualizado)

---

## 🎯 Status Atual (09/01/2026)

### ✅ Anos Completos (370/370 questões)
- **2025**: 185/185 ✅ (95 Dia 1 + 90 Dia 2)
  - Markdowns: ✅ Formato correto
  - JSONs: ✅ Validados e limpos
  - Imagens: ✅ 127 imagens (todas existem)

- **2024**: 185/185 ✅ (95 Dia 1 + 90 Dia 2)
  - Markdowns: ✅ Formatado com "QUESTÃO XX"
  - JSONs: ✅ Validados e limpos
  - Imagens: ✅ 127 imagens (todas existem)
  - **Processado em**: 09/01/2026 (reprocessamento completo)

### ⚠️ Anos Incompletos
- **2023**: 180/185 (97.3%)
  - Dia 1: 90/95 ⚠️ (PDF incompleto - só tem 90 questões, termina na Q90)
  - Dia 2: 90/90 ✅
  - Imagens: ✅ Extraídas
  - **Nota**: O PDF de 2023 D1 está incompleto (32 páginas, termina na Q90)
  - Não é possível completar sem um PDF melhor

### ⏸️ Anos Pendentes
- **2022-2015**: Não processados (precisa iniciar)
- **2014-2009**: Não processados
- **2008-2006**: OCR concluído, precisa revisão manual
- **2005-1998**: Não processados

---

## 🔧 Ferramentas Disponíveis

### 1️⃣ Script de Extração de Questões Específicas

**Nome**: `extract-missing-questions.py`
**Localização**: `extracoes-enem/extract-missing-questions.py`

**Uso**:
```bash
cd "c:\Web Workspace\todas-do-enem-2.0\extracoes-enem"

python extract-missing-questions.py \
    "provas/{ano}/{ano}_PV_impresso_D{dia}_CD{cod}.pdf" \
    "114,165,185" \
    "temp-missing-{ano}.md"
```

**Parâmetros**:
- `pdf`: Caminho para o PDF da prova
- `questoes`: Números das questões separados por vírgula (ex: "96,107,185")
- `output`: Nome do arquivo markdown de saída

**Exemplo Real (extrair Q114 de 2024)**:
```bash
python extract-missing-questions.py \
    "provas/2024/2024_PV_impresso_D2_CD7.pdf" \
    114 \
    "temp-q114-2024.md"
```

### 2️⃣ Script de Merge de Questões

**Nome**: `merge-missing-questions.py`
**Localização**: `extracoes-enem/merge-missing-questions.py`

**Uso**:
```bash
python merge-missing-questions.py \
    "extracoes/{ano}/prova_enem_{ano}_D{dia}_CD{cod}.md" \
    "temp-missing-{ano}.md" \
    "extracoes/{ano}/prova_enem_{ano}_D{dia}_CD{cod}.md"
```

**O que faz**: Adiciona/atualiza questões extraídas no markdown base existente.

### 3️⃣ Script de Conversão Markdown → JSON

**Nome**: `parse-enem-md.ts`
**Localização**: `scripts/parse-enem-md.ts`

**Uso**:
```bash
cd "c:\Web Workspace\todas-do-enem-2.0"

# Processar ano completo (ambos os dias)
bun run scripts/parse-enem-md.ts --year {ano}

# Processar apenas um dia
bun run scripts/parse-enem-md.ts --year {ano} --day {dia}
```

### 4️⃣ Script de Validação

**Nome**: `validate-json.ts`
**Localização**: `scripts/validate-json.ts`

**Uso**:
```bash
cd "c:\Web Workspace\todas-do-enem-2.0"
bun run scripts/validate-json.ts --year {ano}
```

**O que valida**:
- ✅ Contagem de questões (95 Dia 1, 90 Dia 2)
- ✅ Questões duplicadas (Inglês/Espanhol Q1-5)
- ✅ Questões faltando (mostra quais números)
- ✅ Enunciados vazios
- ✅ Alternativas vazias

---

## 📖 Workflow Padrão para Processar um Ano

### Passo 1: Verificar Markdowns Existentes

```bash
cd "c:\Web Workspace\todas-do-enem-2.0\extracoes-enem\extracoes\{ano}"
ls -la
```

Deve ter:
- `prova_enem_{ano}.md` (Dia 1)
- `prova_enem_{ano}_D2_CD7.md` (Dia 2)

**Verificar formato**:
```bash
grep -c "^### Q" prova_enem_{ano}.md
```
- Se retornar `0`: Markdown está em formato incorreto (problema!)
- Se retornar `90-95`: Markdown está correto ✅

### Passo 2: Processar JSONs

```bash
cd "c:\Web Workspace\todas-do-enem-2.0"
bun run scripts/parse-enem-md.ts --year {ano}
```

### Passo 3: Validar

```bash
bun run scripts/validate-json.ts --year {ano}
```

**Resultado esperado**:
```
✅ Dia 1: 95/95 registros
✅ Dia 2: 90/90 registros
✅ Total: 185/185 registros (100%)
```

### Passo 4: Se houver questões faltando

O validador mostrará algo como:
```
❌ Questões faltando (2): 114, 165
```

**A) Extrair questões específicas**:
```bash
cd extracoes-enem
python extract-missing-questions.py \
    "provas/{ano}/{ano}_PV_impresso_D2_CD7.pdf" \
    "114,165" \
    "temp-missing-{ano}.md"
```

**B) Fazer merge no markdown**:
```bash
python merge-missing-questions.py \
    "extracoes/{ano}/prova_enem_{ano}_D2_CD7.md" \
    "temp-missing-{ano}.md" \
    "extracoes/{ano}/prova_enem_{ano}_D2_CD7.md"
```

**C) Reprocessar JSON**:
```bash
cd ..
bun run scripts/parse-enem-md.ts --year {ano} --day 2
```

**D) Validar novamente**:
```bash
bun run scripts/validate-json.ts --year {ano}
```

### Passo 5: Cleanup (IMPORTANTE!)

Após validar 185/185 questões, limpar arquivos temporários:

```bash
cd "c:\Web Workspace\todas-do-enem-2.0\extracoes-enem"

# Deletar arquivos temporários
rm temp-*.md

# Deletar scripts one-off (se criados)
rm debug-*.py insert-*.py fix-*.py
```

**Referência completa de cleanup**: `plans/geracao-json-enem-2015-2025.md:249`

### Passo 6: Verificar Imagens

**Verificar se imagens existem**:
```bash
cd "c:\Web Workspace\todas-do-enem-2.0"

# Contar imagens referenciadas no JSON
cat src/data/{ano}/*.json | grep -o '"/images/enem/{ano}/[^"]*"' | sort -u | wc -l

# Contar imagens reais no disco
ls public/images/enem/{ano}/*.png | wc -l
```

**Entendendo os números**:
- É **normal** ter **mais imagens no disco do que referências nos JSONs**
- A extração captura todas as imagens do PDF (logos, códigos de barras, cabeçalhos, etc.)
- O parser filtra e usa apenas imagens relevantes dentro das questões
- Exemplo real: 2024 tem 127 imagens extraídas, mas apenas ~96 são referenciadas nos JSONs
- **Isso não é problema** ✅

**Verificar imagens faltando** (este comando NÃO deve retornar nada):
```bash
cat src/data/{ano}/*.json | grep -o '"/images/enem/{ano}/[^"]*"' | tr -d '"' | sort -u > /tmp/refs.txt

for img in $(cat /tmp/refs.txt); do
  if [ ! -f "public$img" ]; then
    echo "FALTANDO: $img"
  fi
done
```

Se houver imagens faltando, elas precisam ser copiadas de `extracoes-enem/images/`.

---

## 🚨 Problemas Conhecidos e Soluções

### Problema 1: Markdown em Formato Incorreto (ex: 2024)

**Sintomas**:
- `grep -c "^### Q" markdown.md` retorna `0`
- Parser extrai 0 ou poucas questões
- Arquivo cheio de imagens mas sem marcadores "### Q{número}"

**Solução**:
1. **Opção A (Recomendada)**: Reextrair do PDF usando `extract.py` (script principal)
2. **Opção B (Manual)**: Adicionar questões manualmente ao JSON
3. **Opção C (Pular)**: Documentar e processar outros anos primeiro

### Problema 2: Questões Faltando

**Sintomas**:
- Validador mostra "Questões faltando: X, Y, Z"

**Solução**:
- Usar `extract-missing-questions.py` + `merge-missing-questions.py` (ver Passo 4)

### Problema 3: Imagens Não Aparecem no Site

**Verificar**:
1. Caminho correto no JSON: `"/images/enem/{ano}/{arquivo}.png"`
2. Arquivo existe em: `public/images/enem/{ano}/{arquivo}.png`
3. Componente `QuestionCard` renderiza corretamente (já verificado ✅)

**Solução**:
- Copiar imagens de `extracoes-enem/images/` para `public/images/enem/`

**Nota sobre imagens extras**:
- É normal ter **mais imagens no diretório do que referências nos JSONs**
- A extração captura **todas** as imagens do PDF (logos ENEM, códigos de barras, cabeçalhos, etc.)
- O parser filtra e usa apenas imagens dentro dos blocos de questões
- Exemplo: 2024 tem 127 imagens extraídas, mas apenas ~96 são referenciadas nos JSONs
- **Isso não é um problema** - as imagens extras ficam no disco mas não afetam o site

### Problema 4: Encoding/Caracteres Estranhos

**Sintomas**:
- Textos com `Ã§`, `Ã©`, `Â¡`, etc.

**Solução**:
- Já existe script `clean-encoding.ts` (se necessário)
- Adicionar novos mapeamentos em `ENCODING_FIXES` se aparecerem novos casos

---

## 🎯 Caso de Uso Específico: Completar 2024

**Status**: 184/185 (falta Q114)
**Problema**: Markdown em formato incorreto

### Opção Recomendada: Reprocessamento Completo

**Por quê?**
- Garante qualidade uniforme
- Formato padronizado com 2025
- Fácil manutenção futura

**Como fazer**:
1. Reextrair Dia 1 e Dia 2 do PDF usando `extract.py`
2. Garantir formato com "### Q{número}"
3. Reprocessar JSONs
4. Validar 185/185
5. Cleanup

### Opção Rápida: Adicionar Q114 Manualmente

**Por quê?**
- Rápido (falta apenas 1 questão)
- Mantém o resto como está

**Como fazer**:
1. Extrair Q114: `python extract-missing-questions.py "provas/2024/2024_PV_impresso_D2_CD7.pdf" 114 "temp-q114.md"`
2. Adicionar manualmente ao JSON `src/data/2024/enem-2024-d2-amarelo.json`
3. Validar

---

## 📊 Estrutura de Dados

### Estrutura de Questão no JSON

```json
{
  "id": "ENEM_2024_D2_CI_Q114",
  "number": 114,
  "examYear": 2024,
  "examDay": 2,
  "examColor": "AMARELO",
  "area": "CIENCIAS_NATUREZA",
  "subject": "QUIMICA",
  "supportingMaterials": [
    {
      "id": "text_q114",
      "blocks": [
        {
          "id": "text_q114_1",
          "type": "paragraph",
          "content": "Texto de apoio aqui..."
        }
      ],
      "order": 1
    },
    {
      "id": "img_q114_1",
      "blocks": [
        {
          "id": "img_q114_1_block",
          "type": "image",
          "alt": "Imagem da questão 114",
          "url": "/images/enem/2024/2024_PV_impresso_D2_CD7.pdf-8-0.png"
        }
      ],
      "order": 2
    }
  ],
  "statement": "Enunciado da questão aqui...",
  "alternatives": {
    "A": "Alternativa A",
    "B": "Alternativa B",
    "C": "Alternativa C",
    "D": "Alternativa D",
    "E": "Alternativa E"
  },
  "correctAnswer": "A",
  "hasMultipleTexts": false,
  "hasImages": true
}
```

### Estrutura de Arquivos

```
todas-do-enem-2.0/
├── src/data/
│   ├── 2025/
│   │   ├── enem-2025-d1-azul.json (95 questões)
│   │   └── enem-2025-d2-amarelo.json (90 questões)
│   ├── 2024/
│   │   ├── enem-2024-d1-azul.json (95 questões)
│   │   └── enem-2024-d2-amarelo.json (89 questões) ⚠️
│   └── {ano}/...
├── public/images/enem/
│   ├── 2025/ (127 imagens)
│   ├── 2024/ (127 imagens)
│   └── {ano}/...
└── extracoes-enem/
    ├── extracoes/
    │   ├── 2025/
    │   │   ├── prova_enem_2025.md
    │   │   └── prova_enem_2025_D2_CD7.md
    │   ├── 2024/
    │   │   ├── prova_enem_2024.md ⚠️ (formato incorreto)
    │   │   └── prova_enem_2024_D2_CD7.md ⚠️ (formato incorreto)
    │   └── {ano}/...
    ├── provas/
    │   ├── 2025/
    │   │   ├── 2025_PV_impresso_D1_CD1.pdf
    │   │   └── 2025_PV_impresso_D2_CD7.pdf
    │   └── {ano}/...
    └── images/ (imagens extraídas dos PDFs)
```

---

## 🎓 Notas Importantes para LLMs

### ✅ Boas Práticas

1. **SEMPRE validar após processar**: Use `validate-json.ts` após cada conversão
2. **SEMPRE fazer cleanup**: Delete arquivos `temp-*.md` após merge bem-sucedido
3. **SEMPRE verificar imagens**: Confirme que todas as imagens referenciadas existem
4. **Processar um ano por vez**: Não tente processar múltiplos anos em paralelo
5. **Documentar problemas**: Se encontrar problemas, adicione ao `GUIA-COMPLETO-LLM.md`

### ❌ Armadilhas Comuns

1. **NÃO deletar scripts core**: `extract.py`, `extract-missing-questions.py`, `merge-missing-questions.py`, `ocr_*.py`
2. **NÃO confiar apenas no número de arquivos**: Use o validador para confirmar 185/185
3. **NÃO pular verificação de imagens**: Mesmo com JSON correto, imagens podem estar faltando
4. **NÃO usar caminhos relativos**: Sempre use caminhos absolutos a partir da raiz do projeto
5. **NÃO assumir que markdown está correto**: Sempre verifique formato com `grep -c "^### Q"`

### 📝 Quando Criar Scripts One-Off

Se você precisar criar scripts específicos para um ano (ex: `fix-2024-q114.py`), lembre-se de:

1. Nomear claramente: `{acao}-{ano}-{questao}.py`
2. Adicionar ao `.gitignore` se for temporário
3. **DELETAR após uso** (incluir no cleanup)
4. Documentar no commit message

---

## 📞 Troubleshooting

### Como Saber se um Markdown Está Correto?

```bash
# Deve retornar 90-95
grep -c "^### Q" extracoes-enem/extracoes/{ano}/prova_enem_{ano}.md

# Ver primeiras questões
grep "^### Q" extracoes-enem/extracoes/{ano}/prova_enem_{ano}.md | head -10
```

Saída esperada:
```
### Q1 - Inglês
### Q2 - Inglês
### Q3 - Inglês
...
```

### Como Saber Quantas Questões Tem no JSON?

```bash
cat src/data/{ano}/enem-{ano}-d1-azul.json | grep -c '"number":'
cat src/data/{ano}/enem-{ano}-d2-amarelo.json | grep -c '"number":'
```

Deve retornar `95` e `90` respectivamente.

### Como Ver Quais Questões Estão no JSON?

```bash
cat src/data/{ano}/enem-{ano}-d2-amarelo.json | grep '"number":' | sort -t ':' -k2 -n
```

### Como Verificar se Todas as Imagens Existem?

```bash
# Listar imagens referenciadas
cat src/data/{ano}/*.json | grep -o '"/images/enem/{ano}/[^"]*"' | tr -d '"' | sort -u > /tmp/refs.txt

# Verificar se existem
for img in $(cat /tmp/refs.txt); do
  if [ ! -f "public$img" ]; then
    echo "FALTANDO: $img"
  fi
done
```

---

## 🏁 Checklist Final para um Ano Completo

Antes de marcar um ano como "completo", verifique:

- [ ] Validação: 185/185 registros (95 + 90)
- [ ] JSONs em `src/data/{ano}/` (2 arquivos)
- [ ] Markdowns em formato correto (com "### Q{número}")
- [ ] Todas imagens referenciadas existem em `public/images/enem/{ano}/`
- [ ] Sem arquivos `temp-*.md` em `extracoes-enem/`
- [ ] Sem scripts one-off (`debug-*.py`, `insert-*.py`, `fix-*.py`)
- [ ] Entrada atualizada em `plans/geracao-json-enem-2015-2025.md` (checklist)
- [ ] Teste visual no site (pelo menos 5 questões aleatórias)

---

## 📚 Ordem Recomendada de Processamento

1. **Primeiro**: Completar 2024 (falta apenas Q114)
2. **Depois**: Processar 2023, 2022, 2021... (ordem decrescente)
3. **Razão**: Anos mais recentes têm melhor qualidade de PDF
4. **Anos 2006-2008**: Deixar por último (requer OCR + revisão manual)

---

## 🔄 Atualizar Este Documento

Quando você (LLM) fizer progresso significativo:

1. Atualize a seção "Status Atual" com novos anos completos
2. Adicione problemas encontrados em "Problemas Conhecidos"
3. Atualize "Próxima Ação Recomendada"
4. Incremente data de "Última atualização"

---

## 🎯 Próxima Ação Recomendada

**Data**: 09/01/2026

**Ação**: Processar o ano de 2022

**Status do processamento atual**:
- **2025**: 185/185 ✅ Completo
- **2024**: 185/185 ✅ Completo
- **2023**: 180/185 ⚠️ Incompleto (PDF D1 só tem 90 questões)
  - D1: 90/95 (PDF incompleto)
  - D2: 90/90 ✅
  - Total: 180/185 (97.3%)

**Status do 2022**:
- PDFs existentes em `provas/2022/`
- Não processado ainda
- Esperado: 95 (D1) + 90 (D2) = 185 questões

**Como processar 2022**:
```bash
cd "c:\Web Workspace\todas-do-enem-2.0\extracoes-enem"

# Descomentar linhas do 2022 no extract.py
python extract.py

# Parsear para JSON
cd ..
bun run scripts/parse-enem-md.ts --year 2022

# Validar
bun run scripts/validate-json.ts --year 2022
```

**Nota sobre 2023**:
- O PDF de 2023 D1 está incompleto (só 90 questões disponíveis)
- Necesária: Encontrar PDF completo de 2023 D1 para completar
- Enquanto isso, 2023 tem 180/185 questões (97.3%)

---

**🤖 Este documento foi criado para você, LLM. Use-o como referência mestre. Boa sorte! 🚀**
