import pymupdf4llm
import pathlib

# Obtém o diretório onde o script está localizado
SCRIPT_DIR = pathlib.Path(__file__).parent.resolve()


def convert_to_markdown_with_images(pdf_path, output_path):
    # =============================================================================
    # CONFIGURACOES POR ANO - ALTERE CONFORME NECESSARIO
    # =============================================================================
    # ANO_DA_PROVA = 2025    # <-- MUDE O ANO AQUI (1998 ate 2025)
    # PDF_INPUT = "provas/2025/2025_PV_impresso_D1_CD1.pdf"  # <-- MUDE O CAMINHO DO PDF
    # PDF_NAME = "D1_CD1"     # <-- MUDE O NOME (D1_CD1, D1_CD2, D2_CD1, D2_CD2, etc.)
    # =============================================================================
    
    # Converte o caminho do PDF para absoluto (baseado na pasta do script)
    if not pathlib.Path(pdf_path).is_absolute():
        pdf_path = SCRIPT_DIR / pdf_path
    
    # Extrai o ano do caminho do PDF (ex: "provas/2025/..." -> "2025")
    year = pathlib.Path(pdf_path).parts[-2]
    
    # Cria o caminho para a pasta de imagens: images/prova-{ANO}
    images_base_folder = SCRIPT_DIR / "images"
    image_folder = images_base_folder / f"prova-{year}"
    
    # Cria a pasta para arquivos extraídos: extracoes/{ANO}/
    output_folder = SCRIPT_DIR / "extracoes" / year
    output_folder.mkdir(parents=True, exist_ok=True)
    
    # Cria o caminho completo para o arquivo de saída
    full_output_path = output_folder / output_path
    
    # Cria as pastas de imagens se não existirem
    images_base_folder.mkdir(exist_ok=True)
    image_folder.mkdir(exist_ok=True)
    
    print(f"Extraindo texto e imagens de: {pdf_path}...")

    # Converte o PDF
    md_text = pymupdf4llm.to_markdown(
        pdf_path,
        write_images=True,          # Habilita extração de imagens
        image_path=str(image_folder),  # Define a pasta onde elas serão salvas
        image_format="png"          # Formato das imagens (png ou jpg)
    )

    # Salva o arquivo Markdown
    pathlib.Path(full_output_path).write_bytes(md_text.encode("utf-8"))
    
    print(f"Markdown salvo em: {full_output_path}")
    print(f"Imagens extraídas para a pasta: {image_folder}")


# =============================================================================
# INSTRUCOES DE USO:
# =============================================================================
# Para cada ano (1998-2025), voce tem 2 PDFs. Siga os passos abaixo:
#
# 1. Coloque os PDFs na pasta: provas/{ANO}/
#    Ex: provas/2025/2025_PV_impresso_D1_CD1.pdf
#        provas/2025/2025_PV_impresso_D2_CD1.pdf
#
# 2. Para cada PDF, execute esta funcao com os parametros corretos:
#
#    # Para o PDF D1_CD1 do ano 2025:
#    convert_to_markdown_with_images("provas/2025/2025_PV_impresso_D1_CD1.pdf", "prova_enem_2025_D1_CD1.md")
#
#    # Para o PDF D2_CD1 do ano 2025:
#    convert_to_markdown_with_images("provas/2025/2025_PV_impresso_D2_CD1.pdf", "prova_enem_2025_D2_CD1.md")
#
# 3. Repita para todos os anos de 1998 ate 2025
#
# Estrutura de pastas gerada:
# extracoes/
# |-- 2025/
# |   |-- prova_enem_2025_D1_CD1.md
# |   |-- prova_enem_2025_D2_CD1.md
# |-- 2024/
# |   |-- ...
# images/
# |-- prova-2025/
# |   |-- *.png
# |-- prova-2024/
#     |-- *.png
# =============================================================================


# =============================================================================
# EXECUTAR PARA CADA PDF - DESCOMENTE E EXECUTE
# =============================================================================

# ANO 2025 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2025/2025_PV_impresso_D1_CD1.pdf", "prova_enem_2025_D1_CD1.md")
# convert_to_markdown_with_images("provas/2025/2025_PV_impresso_D2_CD7.pdf", "prova_enem_2025_D2_CD7.md")

# ANO 2024 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2024/2024_PV_impresso_D1_CD1.pdf", "prova_enem_2024_D1_CD1.md")
# convert_to_markdown_with_images("provas/2024/2024_PV_impresso_D2_CD7.pdf", "prova_enem_2024_D2_CD7.md")

# ANO 2023 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2023/2023_PV_impresso_D2_CD7.pdf", "prova_enem_2023_D2_CD7.md")
# convert_to_markdown_with_images("provas/2023/2023_PV_impresso_D1_CD1.pdf", "prova_enem_2023_D1_CD1.md")

# ANO 2022 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2022/2022_PV_impresso_D1_CD1.pdf", "prova_enem_2022_D1_CD1.md")
# convert_to_markdown_with_images("provas/2022/2022_PV_impresso_D2_CD7.pdf", "prova_enem_2022_D2_CD7.md")

# ANO 2021 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2021/2021_PV_impresso_D1_CD1.pdf", "prova_enem_2021_D1_CD1.md")
# convert_to_markdown_with_images("provas/2021/2021_PV_impresso_D2_CD7.pdf", "prova_enem_2021_D2_CD7.md")

# ANO 2020 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2020/2020_PV_impresso_D1_CD1.pdf", "prova_enem_2020_D1_CD1.md")
# convert_to_markdown_with_images("provas/2020/2020_PV_impresso_D2_CD7.pdf", "prova_enem_2020_D2_CD7.md")

# ANO 2019 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2019/2019_PV_impresso_D1_CD1.pdf", "prova_enem_2019_D1_CD1.md")
# convert_to_markdown_with_images("provas/2019/2019_PV_impresso_D2_CD7.pdf", "prova_enem_2019_D2_CD7.md")

# ANO 2018 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2018/2018_PV_impresso_D1_CD1.pdf", "prova_enem_2018_D1_CD1.md")
# convert_to_markdown_with_images("provas/2018/2018_PV_impresso_D2_CD7.pdf", "prova_enem_2018_D2_CD7.md")

# ANO 2017 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2017/2017_PV_impresso_D1_CD1.pdf", "prova_enem_2017_D1_CD1.md")
# convert_to_markdown_with_images("provas/2017/2017_PV_impresso_D2_CD7.pdf", "prova_enem_2017_D2_CD7.md")

# ANO 2016 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2016/2016_PV_impresso_D1_CD1.pdf", "prova_enem_2016_D1_CD1.md")
# convert_to_markdown_with_images("provas/2016/2016_PV_impresso_D2_CD7.pdf", "prova_enem_2016_D2_CD7.md")

# ANO 2015 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2015/2015_PV_impresso_D1_CD1.pdf", "prova_enem_2015_D1_CD1.md")
# convert_to_markdown_with_images("provas/2015/2015_PV_impresso_D2_CD7.pdf", "prova_enem_2015_D2_CD7.md")

# ANO 2014 - JA EXTRAIDO (D1 CD1 e D2 CD7)
# convert_to_markdown_with_images("provas/2014/2014_PV_impresso_D1_CD1.pdf", "prova_enem_2014_D1_CD1.md")
# convert_to_markdown_with_images("provas/2014/2014_PV_impresso_D2_CD7.pdf", "prova_enem_2014_D2_CD7.md")

# ANO 2013 - JA EXTRAIDO (D1 e D2)
# convert_to_markdown_with_images("provas/2013/dia1_caderno1_azul.pdf", "prova_enem_2013_D1_CD1.md")
# convert_to_markdown_with_images("provas/2013/dia2_caderno7_azul.pdf", "prova_enem_2013_D2_CD7.md")

# ANO 2012 - JA EXTRAIDO (D1 e D2)
# convert_to_markdown_with_images("provas/2012/dia1_caderno1_azul.pdf", "prova_enem_2012_D1_CD1.md")
# convert_to_markdown_with_images("provas/2012/dia2_caderno7_azul.pdf", "prova_enem_2012_D2_CD7.md")

# ANO 2011 - JA EXTRAIDO (D1 e D2)
# convert_to_markdown_with_images("provas/2011/dia1_caderno1_azul.pdf", "prova_enem_2011_D1_CD1.md")
# convert_to_markdown_with_images("provas/2011/dia2_caderno7_azul.pdf", "prova_enem_2011_D2_CD7.md")

# ANO 2010 - JA EXTRAIDO (D1 e D2)
# convert_to_markdown_with_images("provas/2010/dia1_caderno1_azul.pdf", "prova_enem_2010_D1_CD1.md")
# convert_to_markdown_with_images("provas/2010/dia2_caderno7_azul.pdf", "prova_enem_2010_D2_CD7.md")

# ANO 2009 - JA EXTRAIDO (D1 e D2)
# convert_to_markdown_with_images("provas/2009/dia1_caderno1_azul.pdf", "prova_enem_2009_D1_CD1.md")
# convert_to_markdown_with_images("provas/2009/dia2_caderno7_azul.pdf", "prova_enem_2009_D2_CD7.md")

# ANO 2008 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2008/2008_amarela.pdf", "prova_enem_2008.md")

# ANO 2007 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2007/2007_amarela.pdf", "prova_enem_2007.md")

# ANO 2006 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2006/2006_amarela.pdf", "prova_enem_2006.md")

# ANO 2005 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2005/2005_amarela.pdf", "prova_enem_2005.md")

# ANO 2004 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2004/2004_amarela.pdf", "prova_enem_2004.md")

# ANO 2003 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2003/2003_amarela.pdf", "prova_enem_2003.md")

# ANO 2002 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2002/2002_amarela.pdf", "prova_enem_2002.md")

# ANO 2001 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2001/2001_amarela.pdf", "prova_enem_2001.md")

# ANO 2000 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/2000/2000_amarela.pdf", "prova_enem_2000.md")

# ANO 1999 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/1999/1999_amarela.pdf", "prova_enem_1999.md")

# ANO 1998 - JA EXTRAIDO
# convert_to_markdown_with_images("provas/1998/1998_amarela.pdf", "prova_enem_1998.md")

print("✅ TODAS AS EXTRAÇÕES FORAM CONCLUÍDAS!")
print("📁 Markdowns: extracoes-enem/extracoes/")
print("📁 Imagens: extracoes-enem/images/")

# ANO 2024 - DESCOMENTE PARA EXECUTAR
# convert_to_markdown_with_images("provas/2024/2024_PV_impresso_D1_CD1.pdf", "prova_enem_2024_D1_CD1.md")
# convert_to_markdown_with_images("provas/2024/2024_PV_impresso_D2_CD1.pdf", "prova_enem_2024_D2_CD1.md")

# ANO 2023 - DESCOMENTE PARA EXECUTAR
# convert_to_markdown_with_images("provas/2023/2023_PV_impresso_D1_CD1.pdf", "prova_enem_2023_D1_CD1.md")
# convert_to_markdown_with_images("provas/2023/2023_PV_impresso_D2_CD1.pdf", "prova_enem_2023_D2_CD1.md")

# ... REPITA PARA TODOS OS ANOS DE 1998 ATE 2025 ...
