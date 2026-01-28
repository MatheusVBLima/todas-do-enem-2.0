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

// Anos do ENEM (1998 - 2025)
export const ENEM_YEARS = Array.from({ length: 2025 - 1998 + 1 }, (_, i) => 1998 + i)

// Anos disponíveis em modo limitado (2022-2025 para testes com questões locais)
export const AVAILABLE_YEARS_LIMITED = [2025, 2024, 2023, 2022]

// Helper para obter anos disponíveis baseado na feature flag
export function getAvailableYears(): number[] {
  const isCompleteMode = process.env.NEXT_PUBLIC_FEATURE_FLAG_COMPLETE === 'true'
  return isCompleteMode ? ENEM_YEARS : AVAILABLE_YEARS_LIMITED
}

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
      'Tudo do plano Tentando a Sorte',
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

// Temas de Redação do ENEM (1998-2024)
export const ENEM_ESSAY_THEMES = [
  { year: 1998, theme: "Viver e Aprender" },
  { year: 1999, theme: "Cidadania e participação social" },
  { year: 2000, theme: "Direitos da criança e do adolescente: como enfrentar esse desafio nacional" },
  { year: 2001, theme: "Desenvolvimento e preservação ambiental: como conciliar interesses em conflito?" },
  { year: 2002, theme: "O direito de votar: como fazer dessa conquista um meio para promover as transformações sociais de que o Brasil necessita?" },
  { year: 2003, theme: "A violência na sociedade brasileira: como mudar as regras desse jogo?" },
  { year: 2004, theme: "Como garantir a liberdade de informação e evitar abusos nos meios de comunicação" },
  { year: 2005, theme: "O trabalho infantil na realidade brasileira" },
  { year: 2006, theme: "O poder de transformação da leitura" },
  { year: 2007, theme: "O desafio de se conviver com a diferença" },
  { year: 2008, theme: "Como preservar a floresta Amazônica" },
  { year: 2009, theme: "O indivíduo frente à ética nacional" },
  { year: 2010, theme: "O trabalho na construção da dignidade humana" },
  { year: 2011, theme: "Viver em rede no século XXI: os limites entre o público e o privado" },
  { year: 2012, theme: "O movimento imigratório para o Brasil no século XXI" },
  { year: 2013, theme: "Os efeitos da implantação da Lei Seca no Brasil" },
  { year: 2014, theme: "Publicidade infantil em questão no Brasil" },
  { year: 2015, theme: "A Persistência da Violência contra a Mulher na Sociedade Brasileira" },
  { year: 2016, theme: "Caminhos para combater a intolerância religiosa no Brasil" },
  { year: 2017, theme: "Desafios para formação educacional de surdos no Brasil" },
  { year: 2018, theme: "Manipulação do comportamento do usuário pelo controle de dados na internet" },
  { year: 2019, theme: "Democratização do acesso ao cinema no Brasil" },
  { year: 2020, theme: "O estigma associado às doenças mentais na sociedade brasileira" },
  { year: 2021, theme: "Invisibilidade e registro civil: garantia de acesso à cidadania no Brasil" },
  { year: 2022, theme: "Desafios para a valorização de comunidades e povos tradicionais no Brasil" },
  { year: 2023, theme: "Invisibilidade do trabalho de cuidados realizados pela mulher no Brasil" },
  { year: 2024, theme: "Desafios para a valorização da herança africana no Brasil" },
] as const

// Status da Plataforma
export const PLATFORM_STATUS = {
  goal: {
    startYear: 1998,
    endYear: 2025,
    totalYears: 28,
  },
  available: [2025, 2024, 2023, 2022] as number[],
  inProgress: [] as number[],
}

export type PlatformYear = {
  year: number
  status: 'available' | 'in-progress' | 'planned'
  examCount?: number
}

export function getPlatformYears(): PlatformYear[] {
  const years: PlatformYear[] = []
  // Iterate from most recent to oldest (2025 → 1998)
  for (let year = PLATFORM_STATUS.goal.endYear; year >= PLATFORM_STATUS.goal.startYear; year--) {
    if (PLATFORM_STATUS.available.includes(year)) {
      years.push({ year, status: 'available', examCount: 2 })
    } else if (PLATFORM_STATUS.inProgress.includes(year)) {
      years.push({ year, status: 'in-progress' })
    } else {
      years.push({ year, status: 'planned' })
    }
  }
  return years
}

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
