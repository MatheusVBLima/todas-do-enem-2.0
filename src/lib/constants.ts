// Áreas do Conhecimento - Divisão Oficial ENEM
export const KNOWLEDGE_AREAS = {
  LINGUAGENS: {
    id: 'LINGUAGENS',
    label: 'Linguagens, Códigos e suas Tecnologias',
    shortLabel: 'Linguagens',
    subjects: ['PORTUGUES', 'LITERATURA', 'INGLES', 'ESPANHOL', 'ARTES', 'EDUCACAO_FISICA'],
    color: '#3B82F6', // blue
  },
  CIENCIAS_HUMANAS: {
    id: 'CIENCIAS_HUMANAS',
    label: 'Ciências Humanas e suas Tecnologias',
    shortLabel: 'Humanas',
    subjects: ['HISTORIA', 'GEOGRAFIA', 'FILOSOFIA', 'SOCIOLOGIA'],
    color: '#F59E0B', // amber
  },
  CIENCIAS_NATUREZA: {
    id: 'CIENCIAS_NATUREZA',
    label: 'Ciências da Natureza e suas Tecnologias',
    shortLabel: 'Natureza',
    subjects: ['BIOLOGIA', 'FISICA', 'QUIMICA'],
    color: '#10B981', // green
  },
  MATEMATICA: {
    id: 'MATEMATICA',
    label: 'Matemática e suas Tecnologias',
    shortLabel: 'Matemática',
    subjects: ['MATEMATICA'],
    color: '#8B5CF6', // purple
  },
} as const

export type KnowledgeAreaKey = keyof typeof KNOWLEDGE_AREAS

// Disciplinas
export const SUBJECTS = {
  // Linguagens
  PORTUGUES: { id: 'PORTUGUES', label: 'Português', area: 'LINGUAGENS' },
  LITERATURA: { id: 'LITERATURA', label: 'Literatura', area: 'LINGUAGENS' },
  INGLES: { id: 'INGLES', label: 'Inglês', area: 'LINGUAGENS' },
  ESPANHOL: { id: 'ESPANHOL', label: 'Espanhol', area: 'LINGUAGENS' },
  ARTES: { id: 'ARTES', label: 'Artes', area: 'LINGUAGENS' },
  EDUCACAO_FISICA: { id: 'EDUCACAO_FISICA', label: 'Educação Física', area: 'LINGUAGENS' },

  // Ciências Humanas
  HISTORIA: { id: 'HISTORIA', label: 'História', area: 'CIENCIAS_HUMANAS' },
  GEOGRAFIA: { id: 'GEOGRAFIA', label: 'Geografia', area: 'CIENCIAS_HUMANAS' },
  FILOSOFIA: { id: 'FILOSOFIA', label: 'Filosofia', area: 'CIENCIAS_HUMANAS' },
  SOCIOLOGIA: { id: 'SOCIOLOGIA', label: 'Sociologia', area: 'CIENCIAS_HUMANAS' },

  // Ciências da Natureza
  BIOLOGIA: { id: 'BIOLOGIA', label: 'Biologia', area: 'CIENCIAS_NATUREZA' },
  FISICA: { id: 'FISICA', label: 'Física', area: 'CIENCIAS_NATUREZA' },
  QUIMICA: { id: 'QUIMICA', label: 'Química', area: 'CIENCIAS_NATUREZA' },

  // Matemática
  MATEMATICA: { id: 'MATEMATICA', label: 'Matemática', area: 'MATEMATICA' },
} as const

export type SubjectKey = keyof typeof SUBJECTS

// Anos do ENEM (1998 - 2024)
export const ENEM_YEARS = Array.from({ length: 2024 - 1998 + 1 }, (_, i) => 1998 + i)

// Planos de assinatura
export const SUBSCRIPTION_PLANS = {
  TENTANDO_A_SORTE: {
    id: 'TENTANDO_A_SORTE',
    name: 'Tentando a Sorte',
    price: 0,
    features: [
      'Acesso a todas as questões',
      'Filtros avançados',
      'Exportação para PDF',
      'Criar grupos de questões',
      'Ver gabarito',
    ],
  },
  RUMO_A_APROVACAO: {
    id: 'RUMO_A_APROVACAO',
    name: 'Rumo à Aprovação',
    price: 25,
    features: [
      'Tudo do plano gratuito',
      'Até 900 explicações por IA/mês',
      'Correção de até 20 redações por IA/mês',
      'Feedback detalhado por competências',
      'Sugestões personalizadas de melhoria',
    ],
  },
} as const

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS

// Competências da Redação ENEM
export const ESSAY_COMPETENCIAS = [
  {
    id: 1,
    name: 'Competência 1',
    description: 'Demonstrar domínio da modalidade escrita formal da língua portuguesa',
    maxScore: 200,
  },
  {
    id: 2,
    name: 'Competência 2',
    description: 'Compreender a proposta de redação e aplicar conceitos de áreas do conhecimento',
    maxScore: 200,
  },
  {
    id: 3,
    name: 'Competência 3',
    description: 'Selecionar, relacionar e interpretar informações para defender um ponto de vista',
    maxScore: 200,
  },
  {
    id: 4,
    name: 'Competência 4',
    description: 'Demonstrar conhecimento dos mecanismos linguísticos de construção da argumentação',
    maxScore: 200,
  },
  {
    id: 5,
    name: 'Competência 5',
    description: 'Elaborar proposta de intervenção para o problema abordado, respeitando os direitos humanos',
    maxScore: 200,
  },
] as const

// Opções de resposta
export const ANSWER_OPTIONS = ['A', 'B', 'C', 'D', 'E'] as const
export type AnswerOption = (typeof ANSWER_OPTIONS)[number]

// Cores para grupos de questões
export const GROUP_COLORS = [
  '#6366F1', // indigo
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#EF4444', // red
  '#F97316', // orange
  '#F59E0B', // amber
  '#84CC16', // lime
  '#22C55E', // green
  '#14B8A6', // teal
  '#06B6D4', // cyan
  '#3B82F6', // blue
] as const

// Paginação
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const
