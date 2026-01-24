import fs from 'fs'
import path from 'path'

export interface LocalExam {
  id: string
  year: number
  day: number
  color: string
  area: string
}

export interface LocalQuestion {
  id: string
  number: number
  examYear: number
  examDay: number
  examColor: string
  area: string
  subject?: string
  languageOption?: string
  supportingMaterials: Array<{
    id: string
    blocks: Array<{
      id: string
      type: string
      content?: string
      url?: string
      alt?: string
      caption?: string
      metadata?: {
        source?: string
      }
    }>
    order: number
  }>
  statement: string
  alternatives: {
    A: string
    B: string
    C: string
    D: string
    E: string
  }
  correctAnswer: string
  hasMultipleTexts: boolean
  hasImages: boolean
}

export interface LocalQuestionsData {
  exam: LocalExam
  questions: LocalQuestion[]
}

// Interface for the new JSON format (2022-2025)
interface RawNewFormatQuestion {
  questionNumber: number
  statement: string
  context: string | null
  reference: string | null
  knowledgeArea: string
  subject: string
  correctAnswer: string | null
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  optionE: string
  imageUrl: string | null
  languageOption: string | null
}

// Mapping from Portuguese knowledge area names to codes
const KNOWLEDGE_AREA_MAP: Record<string, string> = {
  'Linguagens, Códigos e suas Tecnologias': 'LINGUAGENS',
  'Linguagens, Codigos e suas Tecnologias': 'LINGUAGENS',
  'Ciências Humanas e suas Tecnologias': 'CIENCIAS_HUMANAS',
  'Ciencias Humanas e suas Tecnologias': 'CIENCIAS_HUMANAS',
  'Ciências da Natureza e suas Tecnologias': 'CIENCIAS_NATUREZA',
  'Ciencias da Natureza e suas Tecnologias': 'CIENCIAS_NATUREZA',
  'Matemática e suas Tecnologias': 'MATEMATICA',
  'Matematica e suas Tecnologias': 'MATEMATICA',
}

// Mapping from Portuguese subject names to codes
const SUBJECT_MAP: Record<string, string> = {
  // Linguagens
  'Português': 'PORTUGUES',
  'Portugues': 'PORTUGUES',
  'Literatura': 'LITERATURA',
  'Inglês': 'INGLES',
  'Ingles': 'INGLES',
  'Espanhol': 'ESPANHOL',
  'Artes': 'ARTES',
  'Educação Física': 'EDUCACAO_FISICA',
  'Educacao Fisica': 'EDUCACAO_FISICA',
  // Ciências Humanas
  'História': 'HISTORIA',
  'Historia': 'HISTORIA',
  'Geografia': 'GEOGRAFIA',
  'Filosofia': 'FILOSOFIA',
  'Sociologia': 'SOCIOLOGIA',
  // Ciências da Natureza
  'Biologia': 'BIOLOGIA',
  'Física': 'FISICA',
  'Fisica': 'FISICA',
  'Química': 'QUIMICA',
  'Quimica': 'QUIMICA',
  // Matemática
  'Matemática': 'MATEMATICA',
  'Matematica': 'MATEMATICA',
  // Generic
  'Ciências da Natureza': 'CIENCIAS_NATUREZA',
  'Ciencias da Natureza': 'CIENCIAS_NATUREZA',
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data')

// Check if data is in the new format (array of questions)
function isNewFormat(data: unknown): data is RawNewFormatQuestion[] {
  return Array.isArray(data) && data.length > 0 && 'questionNumber' in data[0]
}

// Normalize knowledge area from Portuguese to code
function normalizeKnowledgeArea(area: string): string {
  return KNOWLEDGE_AREA_MAP[area] || area.toUpperCase().replace(/\s+/g, '_')
}

// Normalize subject from Portuguese to code
function normalizeSubject(subject: string): string {
  return SUBJECT_MAP[subject] || subject.toUpperCase().replace(/\s+/g, '_')
}

// Convert image URL from imagens/ to /images/
function normalizeImageUrl(imageUrl: string): string {
  return '/' + imageUrl.replace('imagens/', 'images/')
}

// Clean junk text from statements and options
function cleanText(text: string): string {
  if (!text) return text

  let cleaned = text

  // Remove patterns like "LC - 1° dia | Caderno 1 - AZUL - 1ª Aplicação"
  cleaned = cleaned.replace(/LC - \d+° dia \| Caderno \d+ - [A-Z]+ - \d+ª Aplicação/g, '')

  // Remove long sequences of "ENEM YYYY" junk at end of text
  // Use a simple global replace that removes all "ENEM YYYY " patterns when they appear 3+ times consecutively
  cleaned = cleaned.replace(/(ENEM \d{4} ){3,}/g, '')

  // Trim whitespace
  cleaned = cleaned.trim()

  return cleaned
}

// Build supporting materials from context and reference
function buildSupportingMaterials(
  raw: RawNewFormatQuestion,
  questionIndex: number
): LocalQuestion['supportingMaterials'] {
  const materials: LocalQuestion['supportingMaterials'] = []
  let order = 0

  // Add image if present
  if (raw.imageUrl) {
    const normalizedUrl = normalizeImageUrl(raw.imageUrl)
    materials.push({
      id: `img_q${questionIndex}_${order}`,
      blocks: [{
        id: `img_block_q${questionIndex}_${order}`,
        type: 'image',
        url: normalizedUrl,
        alt: 'Imagem da questão',
      }],
      order: order++,
    })
  }

  // Add context as text block
  if (raw.context) {
    const cleanedContext = cleanText(raw.context)
    if (cleanedContext) {
      materials.push({
        id: `text_q${questionIndex}_${order}`,
        blocks: [{
          id: `text_block_q${questionIndex}_${order}`,
          type: 'paragraph',
          content: cleanedContext,
          metadata: raw.reference ? { source: cleanText(raw.reference) } : undefined,
        }],
        order: order++,
      })
    }
  } else if (raw.reference) {
    // Reference without context
    materials.push({
      id: `ref_q${questionIndex}_${order}`,
      blocks: [{
        id: `ref_block_q${questionIndex}_${order}`,
        type: 'paragraph',
        content: '',
        metadata: { source: cleanText(raw.reference) },
      }],
      order: order++,
    })
  }

  return materials
}

// Convert a raw question to LocalQuestion format
function convertRawQuestionToLocalQuestion(
  raw: RawNewFormatQuestion,
  exam: LocalExam,
  index: number
): LocalQuestion {
  const normalizedArea = normalizeKnowledgeArea(raw.knowledgeArea)
  const normalizedSubject = normalizeSubject(raw.subject)

  // Generate unique question ID
  const areaSuffix = normalizedArea.substring(0, 2)
  const langSuffix = raw.languageOption
    ? `_${raw.languageOption.substring(0, 2)}`
    : ''
  const questionId = `ENEM_${exam.year}_D${exam.day}_${areaSuffix}_Q${String(raw.questionNumber).padStart(2, '0')}${langSuffix}`

  // Build supporting materials
  const supportingMaterials = buildSupportingMaterials(raw, index)

  return {
    id: questionId,
    number: raw.questionNumber,
    examYear: exam.year,
    examDay: exam.day,
    examColor: exam.color,
    area: normalizedArea,
    subject: normalizedSubject,
    languageOption: raw.languageOption || undefined,
    supportingMaterials,
    statement: cleanText(raw.statement),
    alternatives: {
      A: cleanText(raw.optionA),
      B: cleanText(raw.optionB),
      C: cleanText(raw.optionC),
      D: cleanText(raw.optionD),
      E: cleanText(raw.optionE),
    },
    correctAnswer: raw.correctAnswer || 'X', // Use 'X' as placeholder for null
    hasMultipleTexts: false,
    hasImages: raw.imageUrl !== null,
  }
}

// Convert new format array to LocalQuestionsData
function convertNewFormatToLocalFormat(
  rawQuestions: RawNewFormatQuestion[],
  year: number,
  day: number,
  color: string = 'AZUL'
): LocalQuestionsData {
  // Determine exam area from first question
  const firstQuestion = rawQuestions[0]
  const examArea = normalizeKnowledgeArea(firstQuestion.knowledgeArea)

  const exam: LocalExam = {
    id: `ENEM_${year}_D${day}_${color.toUpperCase()}`,
    year,
    day,
    color: color.toUpperCase(),
    area: examArea,
  }

  const questions: LocalQuestion[] = rawQuestions.map((raw, index) =>
    convertRawQuestionToLocalQuestion(raw, exam, index)
  )

  return { exam, questions }
}

// Get the file path for local questions, checking both formats
export function getLocalQuestionsFilePath(
  year: number,
  day: number,
  color: string = 'AZUL'
): string | null {
  // Try new format first: 2022_D1_CD1_questoes.json
  const caderno = day === 1 ? 'CD1' : 'CD7'
  const newFormatFileName = `${year}_D${day}_${caderno}_questoes.json`
  const newFormatPath = path.join(DATA_DIR, String(year), newFormatFileName)

  if (fs.existsSync(newFormatPath)) {
    return newFormatPath
  }

  // Try old format: enem-2022-d1-azul.json
  const normalizedColor = color.toUpperCase()
  const oldFormatFileName = `enem-${year}-d${day}-${normalizedColor.toLowerCase()}.json`
  const oldFormatPath = path.join(DATA_DIR, String(year), oldFormatFileName)

  if (fs.existsSync(oldFormatPath)) {
    return oldFormatPath
  }

  return null
}

export function loadLocalQuestions(
  year: number,
  day: number,
  color: string = 'AZUL'
): LocalQuestionsData | null {
  try {
    const filePath = getLocalQuestionsFilePath(year, day, color)

    if (!filePath) {
      console.log(`[LocalQuestions] File not found for ${year} D${day} ${color}`)
      return null
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8')
    const data = JSON.parse(fileContent)

    // Check if it's the new format (array) or old format (object with exam/questions)
    if (isNewFormat(data)) {
      console.log(`[LocalQuestions] Converting new format: ${filePath}`)
      const converted = convertNewFormatToLocalFormat(data, year, day, color)
      console.log(`[LocalQuestions] Converted ${converted.questions.length} questions from ${filePath}`)
      return converted
    }

    // Old format - use as-is
    const oldFormatData = data as LocalQuestionsData
    console.log(`[LocalQuestions] Loaded ${oldFormatData.questions.length} questions from ${filePath}`)
    return oldFormatData
  } catch (error) {
    console.error(`[LocalQuestions] Error loading questions for year ${year}, day ${day}, color ${color}:`, error)
    return null
  }
}

export function getLocalQuestion(
  year: number,
  day: number,
  questionNumber: number,
  color: string = 'AZUL'
): LocalQuestion | null {
  const data = loadLocalQuestions(year, day, color)
  if (!data) return null

  return data.questions.find(q => q.number === questionNumber) || null
}

export function getAvailableLocalYears(): number[] {
  try {
    const years: number[] = []
    const entries = fs.readdirSync(DATA_DIR, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory() && /^\d{4}$/.test(entry.name)) {
        const year = parseInt(entry.name, 10)
        if (!isNaN(year)) {
          years.push(year)
        }
      }
    }

    return years.sort((a, b) => b - a)
  } catch (error) {
    console.error('[LocalQuestions] Error getting available years:', error)
    return []
  }
}

export function getAvailableLocalExamsForYear(year: number): Array<{ day: number; color: string }> {
  try {
    const yearDir = path.join(DATA_DIR, String(year))
    if (!fs.existsSync(yearDir)) {
      return []
    }

    const exams: Array<{ day: number; color: string }> = []
    const files = fs.readdirSync(yearDir)

    for (const file of files) {
      // Check new format: 2022_D1_CD1_questoes.json
      const newFormatMatch = file.match(/(\d{4})_D(\d)_CD\d_questoes\.json/i)
      if (newFormatMatch) {
        const day = parseInt(newFormatMatch[2], 10)
        // New format doesn't have color, default to Azul
        if (!exams.some(e => e.day === day)) {
          exams.push({ day, color: 'Azul' })
        }
        continue
      }

      // Check old format: enem-2022-d1-azul.json
      if (file.startsWith('enem-') && file.endsWith('.json')) {
        const oldFormatMatch = file.match(/enem-(\d{4})-d(\d)-(azul|amarelo|rosa|branco|cinza)\.json/i)
        if (oldFormatMatch) {
          const day = parseInt(oldFormatMatch[2], 10)
          const color = oldFormatMatch[3].toUpperCase()
          const normalizedColor = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase()

          if (!exams.some(e => e.day === day && e.color === normalizedColor)) {
            exams.push({ day, color: normalizedColor })
          }
        }
      }
    }

    return exams
  } catch (error) {
    console.error(`[LocalQuestions] Error getting exams for year ${year}:`, error)
    return []
  }
}
