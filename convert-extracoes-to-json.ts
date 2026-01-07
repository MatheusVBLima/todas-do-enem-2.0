import fs from 'fs';
import path from 'path';

interface Question {
  id: string;
  number: number;
  examYear: number;
  examDay: number;
  examColor: string;
  area: string;
  subject: string;
  languageOption?: string;
  supportingMaterials: SupportingMaterial[];
  statement: string;
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  correctAnswer: string;
  hasMultipleTexts: boolean;
  hasImages: boolean;
}

interface SupportingMaterial {
  id: string;
  blocks?: Block[];
  order: number;
}

interface Block {
  id: string;
  type: string;
  content?: string;
  url?: string;
  alt?: string;
  caption?: string;
  metadata?: {
    source?: string;
  };
}

interface ExamData {
  exam: {
    id: string;
    year: number;
    day: number;
    color: string;
    area: string;
  };
  questions: Question[];
}

// Função para extrair informações do nome do arquivo
function parseFileName(fileName: string): { year: number; day: number; color: string } | null {
  // Formato esperado: prova_enem_YYYY_DX_CDY.md
  const match = fileName.match(/prova_enem_(\d{4})(?:_D(\d)_CD(\d+))?\.md/);

  if (!match) return null;

  const year = parseInt(match[1]);
  const day = match[2] ? parseInt(match[2]) : 1;
  const colorCode = match[3] ? parseInt(match[3]) : 1;

  // Mapeamento de códigos de cor (baseado na nomenclatura comum do ENEM)
  const colorMap: { [key: number]: string } = {
    1: 'AZUL',
    2: 'AMARELO',
    3: 'BRANCO',
    4: 'ROSA',
    5: 'CINZA',
    6: 'VERDE',
    7: 'CINZA', // D2 geralmente usa cores diferentes
  };

  return {
    year,
    day,
    color: colorMap[colorCode] || 'AZUL',
  };
}

// Função para determinar a área com base no dia
function getArea(day: number): string {
  return day === 1 ? 'LINGUAGENS' : 'CIENCIAS_HUMANAS';
}

// Função para processar um arquivo markdown
function processMarkdownFile(filePath: string, imageFolder: string): ExamData | null {
  const fileName = path.basename(filePath);
  const examInfo = parseFileName(fileName);

  if (!examInfo) {
    console.log(`⚠️  Não foi possível extrair informações de: ${fileName}`);
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const area = getArea(examInfo.day);

  // Criar estrutura básica
  const examData: ExamData = {
    exam: {
      id: `ENEM_${examInfo.year}_D${examInfo.day}_${examInfo.color}`,
      year: examInfo.year,
      day: examInfo.day,
      color: examInfo.color,
      area,
    },
    questions: [],
  };

  // TODO: Implementar parser do markdown para extrair questões
  // Por enquanto, retornar estrutura básica
  console.log(`✓ Processando: ${fileName} (${examInfo.year} - Dia ${examInfo.day})`);

  return examData;
}

// Função principal
async function main() {
  const extracoesDir = path.join(process.cwd(), 'extracoes-enem', 'extracoes');
  const imagesDir = path.join(process.cwd(), 'extracoes-enem', 'images');
  const outputDir = path.join(process.cwd(), 'src', 'data');

  // Criar diretório de saída se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Ler todos os anos disponíveis
  const years = fs.readdirSync(extracoesDir).filter(item => {
    const itemPath = path.join(extracoesDir, item);
    return fs.statSync(itemPath).isDirectory();
  });

  console.log(`📚 Encontrados ${years.length} anos de provas`);
  console.log('');

  let totalFiles = 0;

  for (const year of years.sort()) {
    const yearPath = path.join(extracoesDir, year);
    const mdFiles = fs.readdirSync(yearPath).filter(f => f.endsWith('.md'));

    if (mdFiles.length === 0) continue;

    console.log(`\n📖 Processando ano ${year} (${mdFiles.length} arquivos)`);

    for (const mdFile of mdFiles) {
      const filePath = path.join(yearPath, mdFile);
      const imageFolder = path.join(imagesDir, `prova-${year}`);

      const examData = processMarkdownFile(filePath, imageFolder);

      if (examData) {
        // Gerar nome do arquivo de saída
        const outputFileName = `enem-${examData.exam.year}-d${examData.exam.day}-${examData.exam.color.toLowerCase()}.json`;
        const outputPath = path.join(outputDir, outputFileName);

        // Salvar JSON
        fs.writeFileSync(outputPath, JSON.stringify(examData, null, 2), 'utf-8');
        console.log(`  ✓ Gerado: ${outputFileName}`);
        totalFiles++;
      }
    }
  }

  console.log(`\n✅ Processo concluído! ${totalFiles} arquivos JSON gerados em ${outputDir}`);
}

main().catch(console.error);
