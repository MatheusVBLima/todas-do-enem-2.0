// Correções manuais de topics - Arquivo 2025_D1_CD1_questoes.json
// Análise manual questão por questão

export const CORRECTIONS_2025_D1_CD1: Record<number, Record<string, string>> = {
  // Questões que precisam de correção: questionNumber -> subject -> newTopic

  // Q2 de Espanhol - sobre "guagua" (empréstimo linguístico)
  2: {
    'Espanhol': 'Variação Linguística'
  },

  // Q4 de Espanhol - charge (gênero textual)
  4: {
    'Espanhol': 'Gênero Textual'
  },

  // Q9 de Português - "A autora conclui que" (interpretação, não gramática)
  9: {
    'Português': 'Interpretação Textual'
  },

  // Q6 de Português - questão sobre adjetivo em contexto literário (gramática, não literatura)
  6: {
    'Português': 'Gramática'
  },

  // Q11 de Português - questão sobre adjetivo (gramática, não literatura)
  11: {
    'Português': 'Gramática'
  }

  // Continuar adicionando correções conforme a análise manual continua...
};

// Topics válidos por subject para referência rápida
export const VALID_TOPICS_BY_SUBJECT = {
  'Inglês': ['Interpretação Textual', 'Gramática', 'Vocabulário', 'Funções de Linguagem', 'Variação Linguística', 'Gênero Textual'],
  'Espanhol': ['Interpretação Textual', 'Gramática', 'Vocabulário', 'Funções de Linguagem', 'Variação Linguística', 'Gênero Textual'],
  'Português': ['Interpretação Textual', 'Gramática', 'Vocabulário', 'Funções de Linguagem', 'Variação Linguística', 'Gênero Textual', 'Literatura'],
  'Literatura': ['Interpretação Textual', 'Literatura', 'Gênero Textual'],
  'Artes': ['Interpretação Textual', 'Literatura', 'Gênero Textual'],
  'Educação Física': ['Interpretação Textual', 'Gênero Textual'],
  'História': ['Interpretação Textual', 'Contextualização Histórica'],
  'Geografia': ['Interpretação Textual', 'Análise Geográfica'],
  'Filosofia': ['Interpretação Textual', 'Fundamentos Filosóficos'],
  'Sociologia': ['Interpretação Textual', 'Análise Sociológica']
};
