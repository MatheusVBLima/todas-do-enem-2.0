# Scripts de Extração ENEM

Scripts para processar provas do ENEM (PDF → Markdown → JSON).

## 📁 Estrutura

```
extracoes-enem/
├── scripts/                    # Scripts TypeScript
│   ├── parse-enem-md.ts       # Markdown → JSON
│   └── validate-json.ts       # Validação (copiar da raiz)
├── extracoes/                  # Markdowns extraídos
│   ├── 2025/
│   │   ├── prova_enem_2025.md             (Dia 1)
│   │   └── prova_enem_2025_D2_CD7.md      (Dia 2)
│   └── 2024/...
├── provas/                     # PDFs originais
│   ├── 2025/
│   └── 2024/...
└── *.py                        # Scripts Python
```

## 🚀 Uso Rápido

### Processar ano completo

```bash
# 1. Ir para raiz do projeto
cd "c:\Web Workspace\todas-do-enem-2.0"

# 2. Processar
bun run extracoes-enem/scripts/parse-enem-md.ts --year 2025

# 3. Validar
bun run scripts/validate-json.ts --year 2025
```

### Extrair questões faltando

```bash
# 1. Ir para extracoes-enem
cd "c:\Web Workspace\todas-do-enem-2.0\extracoes-enem"

# 2. Extrair (ex: Q96 e Q107)
python extract-missing-questions.py \
    "provas/2025/2025_PV_impresso_D2_CD7.pdf" \
    "96,107" \
    "temp-missing.md"

# 3. Merge
python merge-missing-questions.py \
    "extracoes/2025/prova_enem_2025_D2_CD7.md" \
    "temp-missing.md" \
    "extracoes/2025/prova_enem_2025_D2_CD7.md"

# 4. Reprocessar
cd ..
bun run extracoes-enem/scripts/parse-enem-md.ts --year 2025 --day 2
```

## 📜 Scripts Disponíveis

### TypeScript (rodar da raiz)

- **`parse-enem-md.ts`** - Converte markdown para JSON
  ```bash
  bun run extracoes-enem/scripts/parse-enem-md.ts --year 2025 [--day 1]
  ```

### Python (rodar de extracoes-enem/)

- **`extract-missing-questions.py`** - Extrai questões específicas do PDF
  ```bash
  python extract-missing-questions.py <pdf> <questoes> <output>
  # Exemplo: python extract-missing-questions.py "provas/2025/2025_PV_impresso_D2_CD7.pdf" "96,107" "temp.md"
  ```

- **`merge-missing-questions.py`** - Adiciona questões ao markdown existente
  ```bash
  python merge-missing-questions.py <markdown_base> <questoes_extraidas> <output>
  ```

- **`extract.py`** - Extração completa (range de páginas)
- **`extract-simple.py`** - Extração simples sem emojis
- **`ocr_extraction.py`** - OCR com Tesseract

## ✅ Estrutura Esperada

- **Dia 1**: 95 registros (Q1-90, sendo Q1-5 duplicadas para Inglês/Espanhol)
- **Dia 2**: 90 registros (Q91-180)
- **Total**: 185 registros por ano

## 📝 Documentação Completa

### Para LLMs (Claude, GPT, etc.) Continuarem o Trabalho:
📖 **[GUIA-COMPLETO-LLM.md](GUIA-COMPLETO-LLM.md)** - Documento mestre com workflow completo, troubleshooting e referências

### Documentos Complementares:
- `plans/geracao-json-enem-2015-2025.md` - Plano detalhado com checklist por ano
- `PROXIMOS-PASSOS.md` - Status e próximas ações (ver GUIA-COMPLETO-LLM.md para versão atualizada)
