/**
 * Módulo para limpar problemas de encoding em textos extraídos do ENEM
 */

// Mapeamento de caracteres mal codificados comuns
const ENCODING_FIXES: Record<string, string> = {
  // UTF-8 mal interpretado como Windows-1252
  'Ã§': 'ç',
  'Ã£': 'ã',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ãº': 'ú',
  'Ã¢': 'â',
  'Ãª': 'ê',
  'Ã´': 'ô',
  'Ã': 'à',
  'Ãµ': 'õ',
  'Ã¼': 'ü',
  'Ã§Ã£o': 'ção',
  'Ã§Ãµes': 'ções',

  // Padrões comuns encontrados (anos antigos)
  'îäå': 'ENEM',
  'GH': 'de',
  'QmR': 'não',
  // NÃO substituir 'p' por 'é' - causa mais problemas do que resolve

  // Marcações markdown
  '~~': '',
  // NÃO remover **, pois precisamos dele para identificar questões

  // Caracteres especiais
  '###': '',
  '##': '',
};

// Padrões regex para limpeza
const PATTERNS = {
  // Remove múltiplos espaços
  multipleSpaces: /\s+/g,

  // Remove espaços antes de pontuação
  spaceBeforePunctuation: /\s+([.,;:!?)])/g,

  // Remove linhas vazias múltiplas
  multipleNewlines: /\n{3,}/g,

  // Detecta sequências de caracteres estranhos
  strangeChars: /[^\w\s\p{L}\p{N}\p{P}\p{S}\p{M}\n\r\t]/gu,
};

/**
 * Escapa caracteres especiais para uso em regex
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Limpa problemas de encoding em um texto
 */
export function cleanEncoding(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // 1. Aplicar mapeamentos de correção de encoding (escapando caracteres especiais)
  for (const [wrong, correct] of Object.entries(ENCODING_FIXES)) {
    // Usa split/join em vez de regex para evitar problemas
    cleaned = cleaned.split(wrong).join(correct);
  }

  // 2. Normalizar espaços
  cleaned = cleaned.replace(PATTERNS.multipleSpaces, ' ');
  cleaned = cleaned.replace(PATTERNS.spaceBeforePunctuation, '$1');

  // 3. Normalizar quebras de linha
  cleaned = cleaned.replace(PATTERNS.multipleNewlines, '\n\n');

  // 4. Trim de cada linha
  cleaned = cleaned
    .split('\n')
    .map(line => line.trim())
    .join('\n');

  return cleaned.trim();
}

/**
 * Detecta se o texto tem problemas sérios de encoding
 */
export function hasEncodingIssues(text: string): boolean {
  if (!text) return false;

  // Procura por sequências suspeitas
  const suspiciousPatterns = [
    /[Ã][^\s]/g, // Ã seguido de outro caractere (UTF-8 mal interpretado)
    /#{3,}/g, // Múltiplos # seguidos
    /[\x00-\x1F\x7F-\x9F]/g, // Caracteres de controle
  ];

  return suspiciousPatterns.some(pattern => pattern.test(text));
}

/**
 * Tenta recuperar texto com encoding correto
 */
export function tryFixEncoding(text: string): string {
  if (!hasEncodingIssues(text)) {
    return text;
  }

  try {
    // Tenta reinterpretar como UTF-8
    const encoder = new TextEncoder();
    const decoder = new TextDecoder('utf-8', { fatal: false });

    // Converte para bytes assumindo latin1 (Windows-1252)
    const bytes = new Uint8Array(
      text.split('').map(char => char.charCodeAt(0) & 0xFF)
    );

    // Decodifica como UTF-8
    const fixed = decoder.decode(bytes);

    // Se o resultado parece melhor (menos caracteres estranhos), usa ele
    if (!hasEncodingIssues(fixed)) {
      return fixed;
    }
  } catch (e) {
    // Se falhar, retorna o original
  }

  return text;
}

/**
 * Pipeline completo de limpeza de texto
 */
export function cleanText(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // 1. Tentar corrigir encoding
  cleaned = tryFixEncoding(cleaned);

  // 2. Aplicar limpezas específicas
  cleaned = cleanEncoding(cleaned);

  // 3. Remover marcações markdown restantes
  cleaned = cleaned
    .replace(/\*\*/g, '') // Bold
    .replace(/\*/g, '')   // Itálico
    .replace(/`/g, '')    // Code
    .replace(/~~(.+?)~~/g, '$1'); // Strikethrough

  return cleaned;
}

/**
 * Limpa apenas para exibição (mantém formatação importante)
 */
export function cleanForDisplay(text: string): string {
  if (!text) return text;

  let cleaned = text;

  // Corrige encoding mas mantém formatação básica
  cleaned = tryFixEncoding(cleaned);
  cleaned = cleanEncoding(cleaned);

  return cleaned;
}

/**
 * Verifica qualidade do texto após limpeza
 */
export function getTextQuality(originalText: string, cleanedText: string): {
  score: number;
  issues: string[];
} {
  const issues: string[] = [];
  let score = 100;

  // Verifica perda de conteúdo
  if (cleanedText.length < originalText.length * 0.5) {
    issues.push('Perda significativa de conteúdo na limpeza');
    score -= 30;
  }

  // Verifica se ainda tem caracteres estranhos
  if (hasEncodingIssues(cleanedText)) {
    issues.push('Ainda contém problemas de encoding');
    score -= 20;
  }

  // Verifica se o texto faz sentido (tem vogais e consoantes)
  const hasVowels = /[aeiouáéíóúâêôãõ]/i.test(cleanedText);
  const hasConsonants = /[bcdfghjklmnpqrstvwxyz]/i.test(cleanedText);

  if (!hasVowels || !hasConsonants) {
    issues.push('Texto não parece ter estrutura de linguagem natural');
    score -= 40;
  }

  return { score: Math.max(0, score), issues };
}

// Exemplo de uso
if (import.meta.url === `file://${process.argv[1]}`) {
  const testText = `
    (1(0îäå

    ## **REDAÇÃO**

    ###H#QmR#WHU#D#YHUJRQKD#GH#VHU#IHOL]

    Redija um texto dissertativo, sobre o tema " **Viver e Aprender** "
  `;

  console.log('Original:');
  console.log(testText);
  console.log('\nLimpo:');
  console.log(cleanText(testText));
  console.log('\nQualidade:', getTextQuality(testText, cleanText(testText)));
}
