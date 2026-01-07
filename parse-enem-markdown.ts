import fs from 'fs';
import path from 'path';
import { cleanText, cleanEncoding } from './clean-encoding';

interface ParsedQuestion {
  number: number;
  text: string;
  images: string[];
  statement: string;
  alternatives: {
    A: string;
    B: string;
    C: string;
    D: string;
    E: string;
  };
  languageOption?: 'INGLES' | 'ESPANHOL';
}

interface ParsedExam {
  year: number;
  day: number;
  color: string;
  questions: ParsedQuestion[];
}

/**
 * Detecta se uma imagem é logo/código de barras (antes das questões começarem)
 */
function isHeaderImage(imageIndex: number, content: string, imagePath: string): boolean {
  // Pega o trecho do conteúdo até essa imagem
  const imageMarker = `![](${imagePath})`;
  const indexInContent = content.indexOf(imageMarker);

  if (indexInContent === -1) return true;

  const beforeImage = content.substring(0, indexInContent);

  // Se não tem "QUESTÃO" ou "Questão" antes, é imagem de header
  if (!beforeImage.match(/QUESTÃO|Questão|QUESTION/i)) {
    return true;
  }

  // Se é uma das primeiras 10 imagens e não tem questão antes, é header
  if (imageIndex < 10 && !beforeImage.match(/QUESTÃO\s+\d+|Questão\s+\d+/i)) {
    return true;
  }

  return false;
}

/**
 * Extrai número da questão de um texto
 */
function extractQuestionNumber(text: string): number | null {
  const match = text.match(/(?:QUESTÃO|Questão|QUESTION)\s+(\d+)/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Detecta opção de língua estrangeira (inglês ou espanhol)
 */
function detectLanguageOption(text: string, questionNumber: number): 'INGLES' | 'ESPANHOL' | undefined {
  if (questionNumber > 5) return undefined;

  // Procura por indicadores de língua nas proximidades
  const languageMarkers = text.match(/opção:\s*(inglês|espanhol|english|spanish)/i);
  if (languageMarkers) {
    const lang = languageMarkers[1].toLowerCase();
    if (lang.includes('inglês') || lang.includes('english')) return 'INGLES';
    if (lang.includes('espanhol') || lang.includes('spanish')) return 'ESPANHOL';
  }

  return undefined;
}

/**
 * Extrai alternativas de uma questão
 */
function extractAlternatives(questionText: string): {
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
} | null {
  const alternatives: any = {};

  // Regex para capturar alternativas (mais flexível)
  const altPattern = /\*\*([A-E])\*\*\s+([^\*]+?)(?=\*\*[A-E]\*\*|$)/gs;

  let match;
  while ((match = altPattern.exec(questionText)) !== null) {
    const letter = match[1];
    const text = cleanText(match[2].trim());
    alternatives[letter] = text;
  }

  // Verifica se tem todas as alternativas
  if (Object.keys(alternatives).length === 5) {
    return alternatives;
  }

  // Tenta padrão simples: linha começando com letra
  const lines = questionText.split('\n');
  const alts2: any = {};

  for (const line of lines) {
    const simpleMatch = line.match(/^([A-E])\s+(.+)$/);
    if (simpleMatch) {
      const letter = simpleMatch[1];
      const text = cleanText(simpleMatch[2].trim());
      if (text.length > 0) {
        alts2[letter] = text;
      }
    }
  }

  if (Object.keys(alts2).length === 5) {
    return alts2;
  }

  return null;
}

/**
 * Extrai o enunciado da questão (texto após fonte/disponível e antes das alternativas)
 */
function extractStatement(questionText: string): string {
  try {
    // Remove textos de fonte
    let text = questionText.replace(/Disponível em:.*?Acesso em:.*?\./gs, '');
    text = text.replace(/\w+,\s+\w+\.\s+\*\*.*?\*\*.*?\d{4}.*?\./g, '');

    // Pega o texto após última fonte até primeira alternativa
    const parts = text.split(/\*\*[A-E]\*\*/);
    if (parts.length > 0) {
      return cleanText(parts[0].trim());
    }

    return cleanText(text.trim());
  } catch (error) {
    console.error('Erro em extractStatement:', error);
    return '';
  }
}

/**
 * Extrai questões do markdown
 */
export function parseMarkdown(content: string, year: number): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];

  try {
    // Divide por questões ANTES de limpar encoding (precisa dos **)
    // Padrão: **QUESTÃO 01** ou **QUESTÃO 1** ou **Questão 01**
    const questionBlocks = content.split(/\*\*(?:QUESTÃO|Questão|QUESTION)\s+\d+\*\*/i);

    console.log(`   DEBUG: ${questionBlocks.length - 1} blocos de questão encontrados`);

  // Primeiro bloco é header, ignorar
  questionBlocks.shift();

  let currentLanguage: 'INGLES' | 'ESPANHOL' | undefined = undefined;
  let questionsInLanguageSection = 0;

  for (let i = 0; i < questionBlocks.length; i++) {
    let block = questionBlocks[i];
    const questionNumber = i + 1;

    // Agora sim, limpa encoding do bloco individual
    block = cleanEncoding(block);

    // Detecta mudança de seção de língua
    if (block.match(/opção:\s*espanhol/i)) {
      currentLanguage = 'ESPANHOL';
      questionsInLanguageSection = 0;
    } else if (block.match(/opção:\s*inglês/i)) {
      currentLanguage = 'INGLES';
      questionsInLanguageSection = 0;
    }

    // Se estamos em seção de língua estrangeira e já passamos da Q05
    if (currentLanguage && questionsInLanguageSection >= 5) {
      currentLanguage = undefined;
    }

    // Extrai imagens da questão (não do header)
    const images: string[] = [];
    const imageMatches = block.matchAll(/!\[\]\((.*?)\)/g);

    for (const match of imageMatches) {
      let imgPath = match[1];

      // Normaliza o path da imagem para formato web
      // De: C:/Web Workspace/todas-do-enem-2.0/extracoes-enem/images/prova-2022/2022_PV_impresso_D1_CD1.pdf-1-0.png
      // Para: /images/enem/2022/2022_PV_impresso_D1_CD1.pdf-1-0.png (mantém nome original)

      imgPath = imgPath
        .replace(/\\/g, '/') // Normaliza barras
        .replace(/^.*?extracoes-enem\/images\/prova-(\d{4})\//, '/images/enem/$1/') // Remove caminho absoluto
        .replace(/^.*?\/images\/prova-(\d{4})\//, '/images/enem/$1/'); // Outro formato possível
        // Mantém o nome original do arquivo (não renomeia)

      images.push(imgPath);
    }

    // Extrai alternativas
    const alternatives = extractAlternatives(block);

    if (!alternatives) {
      console.warn(`⚠️  Questão ${questionNumber} (${year}): não foi possível extrair alternativas`);
      continue;
    }

    // Extrai enunciado
    const statement = extractStatement(block);

    if (!statement) {
      console.warn(`⚠️  Questão ${questionNumber} (${year}): enunciado vazio`);
      continue;
    }

    // Extrai texto completo (antes do enunciado)
    const textBeforeStatement = block.substring(0, block.indexOf(statement)).trim();

    const question: ParsedQuestion = {
      number: questionNumber,
      text: cleanText(textBeforeStatement),
      images: images.length > 0 ? images : [],
      statement: statement,
      alternatives,
      languageOption: currentLanguage,
    };

    questions.push(question);

    if (currentLanguage) {
      questionsInLanguageSection++;
    }
  }

  return questions;

  } catch (error: any) {
    console.error('Erro no parseMarkdown:', error.message);
    throw error;
  }
}

/**
 * Converte questões parseadas para o formato JSON do projeto
 */
export function convertToProjectFormat(
  parsed: ParsedQuestion[],
  examInfo: { year: number; day: number; color: string; area: string }
) {
  const questions = parsed.map((q) => {
    const subject = getSubject(q, examInfo.day);

    const question: any = {
      id: `ENEM_${examInfo.year}_D${examInfo.day}_LC_Q${String(q.number).padStart(2, '0')}`,
      number: q.number,
      examYear: examInfo.year,
      examDay: examInfo.day,
      examColor: examInfo.color,
      area: examInfo.area,
      subject: subject,
      supportingMaterials: [],
      statement: q.statement,
      alternatives: q.alternatives,
      correctAnswer: 'A', // TODO: extrair gabarito
      hasMultipleTexts: false,
      hasImages: q.images.length > 0,
    };

    if (q.languageOption) {
      question.languageOption = q.languageOption;
      question.id += q.languageOption === 'INGLES' ? '_IN' : '_ES';
    }

    // Adiciona texto de apoio se existir
    if (q.text) {
      question.supportingMaterials.push({
        id: `text_q${String(q.number).padStart(2, '0')}`,
        blocks: [
          {
            id: `text_q${String(q.number).padStart(2, '0')}_1`,
            type: 'paragraph',
            content: q.text,
          },
        ],
        order: 1,
      });
    }

    // Adiciona imagens
    if (q.images.length > 0) {
      question.supportingMaterials.push({
        id: `img_q${String(q.number).padStart(2, '0')}`,
        blocks: q.images.map((img, idx) => ({
          id: `img_q${String(q.number).padStart(2, '0')}_${idx + 1}`,
          type: 'image',
          url: img,
          alt: `Imagem da questão ${q.number}`,
        })),
        order: q.text ? 2 : 1,
      });
    }

    return question;
  });

  return {
    exam: {
      id: `ENEM_${examInfo.year}_D${examInfo.day}_${examInfo.color}`,
      year: examInfo.year,
      day: examInfo.day,
      color: examInfo.color,
      area: examInfo.area,
    },
    questions,
  };
}

/**
 * Determina a matéria com base na questão e dia
 */
function getSubject(question: ParsedQuestion, day: number): string {
  if (day === 1) {
    if (question.number <= 5) {
      return question.languageOption || 'PORTUGUES';
    }
    if (question.number <= 45) return 'PORTUGUES'; // Simplificado
    return 'REDACAO';
  } else {
    // Dia 2
    if (question.number <= 45) return 'HISTORIA'; // Simplificado
    return 'GEOGRAFIA';
  }
}

/**
 * Processa um arquivo markdown completo
 */
export async function processExamFile(filePath: string): Promise<any> {
  const content = fs.readFileSync(filePath, 'utf-8');
  const fileName = path.basename(filePath);

  // Extrai informações do nome do arquivo
  const match = fileName.match(/prova_enem_(\d{4})(?:_D(\d)_CD(\d+))?\.md/);
  if (!match) {
    throw new Error(`Nome de arquivo inválido: ${fileName}`);
  }

  const year = parseInt(match[1]);
  const day = match[2] ? parseInt(match[2]) : 1;
  const colorCode = match[3] ? parseInt(match[3]) : 1;

  const colorMap: Record<number, string> = {
    1: 'AZUL',
    2: 'AMARELO',
    3: 'BRANCO',
    4: 'ROSA',
  };

  const color = colorMap[colorCode] || 'AZUL';
  const area = day === 1 ? 'LINGUAGENS' : 'CIENCIAS_HUMANAS';

  console.log(`📖 Processando: ${year} - Dia ${day} - ${color}`);

  // Parse do markdown
  const questions = parseMarkdown(content, year);
  console.log(`   ✓ ${questions.length} questões extraídas`);

  // Converte para formato do projeto
  const examData = convertToProjectFormat(questions, { year, day, color, area });

  return examData;
}

// Script principal para processar todos os anos
if (import.meta.url === `file://${process.argv[1]}`) {
  const years = process.argv.slice(2);

  if (years.length === 0) {
    console.log('Uso: bun parse-enem-markdown.ts 2022 2023 2024 2025');
    console.log('Ou: bun parse-enem-markdown.ts 2000-2025');
    process.exit(1);
  }

  console.log('🚀 Iniciando conversão de provas ENEM para JSON\n');

  // TODO: implementar loop pelos anos especificados
}
