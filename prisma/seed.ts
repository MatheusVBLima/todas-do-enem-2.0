import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

const KNOWLEDGE_AREAS = ["LINGUAGENS", "CIENCIAS_HUMANAS", "CIENCIAS_NATUREZA", "MATEMATICA"] as const

const SUBJECTS_BY_AREA: Record<string, string[]> = {
  LINGUAGENS: ["PORTUGUES", "LITERATURA", "INGLES", "ARTES"],
  CIENCIAS_HUMANAS: ["HISTORIA", "GEOGRAFIA", "FILOSOFIA", "SOCIOLOGIA"],
  CIENCIAS_NATUREZA: ["BIOLOGIA", "FISICA", "QUIMICA"],
  MATEMATICA: ["MATEMATICA"],
}

const SAMPLE_CONTEXTS = [
  "A Revolução Industrial transformou profundamente as relações de trabalho e produção na Europa do século XVIII.",
  "O aquecimento global é um dos maiores desafios ambientais da atualidade, afetando ecossistemas em todo o planeta.",
  "A literatura brasileira do século XIX reflete as transformações sociais e culturais do período imperial.",
  "Os avanços tecnológicos têm modificado significativamente a forma como nos comunicamos e interagimos.",
  "A biodiversidade brasileira é uma das mais ricas do mundo, abrigando espécies únicas em seus diversos biomas.",
]

const SAMPLE_STATEMENTS = [
  "Com base no texto, é correto afirmar que:",
  "A partir da análise do contexto apresentado, pode-se concluir que:",
  "Considerando as informações do texto, qual alternativa melhor representa:",
  "De acordo com o texto, a principal característica do fenômeno descrito é:",
  "Analisando o contexto histórico apresentado, é possível inferir que:",
]

function generateOption(index: number): string {
  const options = [
    "Representa uma mudança significativa no paradigma estabelecido.",
    "Mantém as estruturas tradicionais sem alterações relevantes.",
    "Promove a integração entre diferentes áreas do conhecimento.",
    "Evidencia a necessidade de revisão dos conceitos atuais.",
    "Demonstra a importância da preservação dos valores culturais.",
  ]
  return options[index]
}

async function main() {
  console.log("Iniciando seed do banco de dados...")

  // Limpar dados existentes
  await prisma.questionsOnGroups.deleteMany()
  await prisma.question.deleteMany()
  await prisma.exam.deleteMany()
  await prisma.user.deleteMany()
  console.log("Dados antigos removidos")

  // Criar usuário de desenvolvimento
  const devUser = await prisma.user.create({
    data: {
      id: "dev-user-001",
      email: "dev@todasdoenem.com.br",
      name: "Desenvolvedor",
      plan: "RUMO_A_APROVACAO",
    }
  })
  console.log(`Usuário criado: ${devUser.email}`)

  // Criar exames de 2015 a 2024 (10 anos mais recentes para teste)
  const years = [2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024]

  for (const year of years) {
    const exam = await prisma.exam.create({ data: { year } })
    console.log(`Exame ${year} criado`)

    // Criar 20 questões por ano (5 por área)
    let questionNumber = 1
    for (const area of KNOWLEDGE_AREAS) {
      const subjects = SUBJECTS_BY_AREA[area]

      for (let i = 0; i < 5; i++) {
        const subject = subjects[i % subjects.length]
        const contextIndex = Math.floor(Math.random() * SAMPLE_CONTEXTS.length)
        const statementIndex = Math.floor(Math.random() * SAMPLE_STATEMENTS.length)
        const correctAnswer = ["A", "B", "C", "D", "E"][Math.floor(Math.random() * 5)]

        await prisma.question.create({
          data: {
            examId: exam.id,
            questionNumber,
            knowledgeArea: area,
            subject,
            // Armazena em lowercase para busca case-insensitive no SQLite
            context: SAMPLE_CONTEXTS[contextIndex].toLowerCase(),
            statement: SAMPLE_STATEMENTS[statementIndex].toLowerCase(),
            optionA: generateOption(0).toLowerCase(),
            optionB: generateOption(1).toLowerCase(),
            optionC: generateOption(2).toLowerCase(),
            optionD: generateOption(3).toLowerCase(),
            optionE: generateOption(4).toLowerCase(),
            correctAnswer,
          }
        })
        questionNumber++
      }
    }
    console.log(`  ${questionNumber - 1} questões criadas para ${year}`)
  }

  console.log("\nSeed concluído com sucesso!")
  console.log(`Total de anos: ${years.length}`)
  console.log(`Total de questões: ${years.length * 20}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
