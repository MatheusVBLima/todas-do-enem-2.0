# 🔧 Guia de Instalação: Tesseract OCR com Português

## 🧪 Teste Rápido (Depois de Instalar)

**IMPORTANTE:** Depois de seguir os passos de instalação abaixo, execute este comando para verificar se tudo está funcionando:

```bash
python test-tesseract.py
```

Este script vai:
- ✅ Verificar se Tesseract está instalado
- ✅ Verificar se o idioma português está disponível
- ✅ Testar OCR em uma imagem de exemplo
- ✅ Mostrar mensagens claras caso algo esteja faltando

---

## 📋 Passo a Passo Completo

### 1️⃣ Baixar e Instalar Tesseract

**Windows:**

1. Baixe o instalador oficial:
   - Link: https://github.com/UB-Mannheim/tesseract/wiki
   - Ou direto: https://digi.bib.uni-mannheim.de/tesseract/tesseract-ocr-w64-setup-5.3.3.20231005.exe

2. Execute o instalador

3. **IMPORTANTE:** Durante a instalação:
   - ✅ Marque a opção **"Additional language data (download)"**
   - ✅ Selecione **Portuguese** na lista de idiomas
   - ✅ Ou baixe o pacote português manualmente (veja passo 2)

4. Instale no caminho padrão:
   ```
   C:\Program Files\Tesseract-OCR
   ```

### 2️⃣ Instalar Pacote de Idioma Português (Manualmente)

Se você já instalou o Tesseract mas **esqueceu** de marcar o português:

#### Opção A: Reinstalar (Mais Fácil)
1. Desinstale o Tesseract pelo Painel de Controle
2. Reinstale marcando a opção de idioma português

#### Opção B: Baixar arquivo manualmente (Mais Rápido)

1. **Baixe o arquivo de idioma português:**
   - Link: https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata
   - Ou: https://github.com/tesseract-ocr/tessdata_best/raw/main/por.traineddata (melhor qualidade)

2. **Copie o arquivo baixado** (`por.traineddata`) para a pasta:
   ```
   C:\Program Files\Tesseract-OCR\tessdata\
   ```

3. **Verifique se o arquivo está lá:**
   - Abra a pasta `C:\Program Files\Tesseract-OCR\tessdata\`
   - Deve ter o arquivo `por.traineddata` (tamanho ~11 MB)

### 3️⃣ Verificar Instalação

Abra o **Prompt de Comando** (cmd) e teste:

```bash
# 1. Verificar se Tesseract está instalado
tesseract --version

# Saída esperada:
# tesseract 5.3.3
# ...

# 2. Verificar idiomas instalados
tesseract --list-langs

# Saída esperada deve incluir:
# List of available languages (3):
# eng
# osd
# por  <--- PORTUGUÊS DEVE ESTAR AQUI
```

**Se `por` aparecer na lista:** ✅ Instalação OK!

**Se `por` NÃO aparecer:** ❌ O arquivo não está no lugar certo

### 4️⃣ Adicionar Tesseract ao PATH (Opcional, mas Recomendado)

Para usar `tesseract` de qualquer pasta:

1. Clique com botão direito em **"Este Computador"** → **Propriedades**
2. **Configurações avançadas do sistema**
3. **Variáveis de Ambiente**
4. Em **Variáveis do Sistema**, encontre **Path** e clique em **Editar**
5. Clique em **Novo** e adicione:
   ```
   C:\Program Files\Tesseract-OCR
   ```
6. Clique **OK** em tudo
7. **Feche e abra novamente** o terminal

### 5️⃣ Instalar Dependências Python

```bash
pip install pytesseract pillow pdf2image
```

**Nota para Windows:** `pdf2image` precisa do **poppler**

#### Instalar Poppler (Windows):

**Opção 1: Chocolatey (Recomendado)**
```bash
choco install poppler
```

**Opção 2: Manual**
1. Baixe: http://blog.alivate.com.au/poppler-windows/
2. Extraia para `C:\poppler`
3. Adicione ao PATH:
   ```
   C:\poppler\Library\bin
   ```

### 6️⃣ Testar OCR com Python

Crie um arquivo `test-ocr.py`:

```python
import pytesseract
from PIL import Image

# Configure o caminho do Tesseract (se não estiver no PATH)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Teste com uma imagem simples
# Crie uma imagem de teste ou use uma existente
try:
    # Listar idiomas disponíveis
    print("Idiomas disponíveis:")
    print(pytesseract.get_languages())

    # Testar OCR em português
    # (substitua 'test.png' por uma imagem real)
    # text = pytesseract.image_to_string(Image.open('test.png'), lang='por')
    # print(text)

    print("\n✅ Tesseract funcionando!")

except Exception as e:
    print(f"❌ Erro: {e}")
```

Execute:
```bash
python test-ocr.py
```

Saída esperada:
```
Idiomas disponíveis:
['eng', 'osd', 'por']

✅ Tesseract funcionando!
```

---

## 🔍 Solução de Problemas Comuns

### Problema 1: "tesseract is not installed or it's not in your PATH"

**Solução:**
- Verifique se instalou o Tesseract
- Configure o caminho manualmente no Python:
  ```python
  pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
  ```

### Problema 2: "Error opening data file por.traineddata"

**Causa:** Arquivo de idioma português não está instalado

**Solução:**
1. Baixe `por.traineddata` (link acima)
2. Copie para `C:\Program Files\Tesseract-OCR\tessdata\`
3. Reinicie o terminal

### Problema 3: "Unable to load unicharset file"

**Solução:**
- Certifique-se de baixar o arquivo `por.traineddata` correto
- Tamanho esperado: ~11 MB
- Link correto: https://github.com/tesseract-ocr/tessdata/raw/main/por.traineddata

### Problema 4: OCR retorna texto vazio ou errado

**Possíveis causas:**
- Imagem com baixa resolução (use DPI 300+)
- Imagem muito escura ou clara
- Texto muito pequeno

**Solução:**
```python
# Aumentar DPI ao converter PDF
images = convert_from_path(pdf_path, dpi=300)  # ou 400, 600

# Pré-processar imagem (contraste, binarização)
from PIL import ImageEnhance
enhancer = ImageEnhance.Contrast(image)
image = enhancer.enhance(2)
```

### Problema 5: "pdf2image.exceptions.PDFInfoNotInstalledError"

**Causa:** Poppler não instalado

**Solução (Windows):**
1. Baixe poppler: http://blog.alivate.com.au/poppler-windows/
2. Extraia para `C:\poppler`
3. Adicione ao PATH: `C:\poppler\Library\bin`
4. Reinicie terminal

**Ou instale via Chocolatey:**
```bash
choco install poppler
```

---

## 📝 Script Atualizado com Caminho Correto

Atualize os scripts OCR com o caminho correto:

**`ocr_extraction.py`:**
```python
# Linha 21
TESSERACT_PATH = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
```

**`ocr-tesseract.py`:**
Adicione no início do arquivo:
```python
import pytesseract

# Configure o caminho do Tesseract
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
```

---

## ✅ Checklist Final

Antes de processar PDFs, verifique:

- [ ] Tesseract instalado (`tesseract --version` funciona)
- [ ] Português disponível (`tesseract --list-langs` mostra `por`)
- [ ] Python packages instalados (`pip list | grep pytesseract`)
- [ ] Poppler instalado (apenas Windows)
- [ ] Script de teste funciona sem erros

---

## 🚀 Uso dos Scripts

Após tudo configurado:

### OCR em PDF completo:
```bash
python ocr-tesseract.py provas/2008/2008_PV_impresso.pdf extracoes/2008/prova_enem_2008_ocr.md
```

### OCR em imagens já extraídas:
```bash
python ocr_extraction.py
```

---

## 📚 Links Úteis

- **Tesseract Download:** https://github.com/UB-Mannheim/tesseract/wiki
- **Idiomas (tessdata):** https://github.com/tesseract-ocr/tessdata
- **Idiomas Best Quality:** https://github.com/tesseract-ocr/tessdata_best
- **Poppler Windows:** http://blog.alivate.com.au/poppler-windows/
- **Documentação Tesseract:** https://tesseract-ocr.github.io/

---

**Última atualização:** 07/01/2026
