import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { readFileSync } from 'fs'
import { join } from 'path'

const adapter = new PrismaLibSql({
  url: process.env.DATABASE_URL || 'file:./dev.db',
})

const prisma = new PrismaClient({
  adapter,
  log: ['error', 'warn'],
})

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

  // Ler arquivo JSON com questões do ENEM 2025
  const jsonPath = join(process.cwd(), 'src', 'data', 'enem-2025-d1-azul-q01-20.json')
  const jsonContent = readFileSync(jsonPath, 'utf-8')
  const enemData = JSON.parse(jsonContent)

  // Criar exame do ENEM 2025
  const exam = await prisma.exam.create({
    data: { year: enemData.exam.year }
  })
  console.log(`Exame ${enemData.exam.year} criado`)

  // Criar questões do JSON
  let createdCount = 0
  for (const q of enemData.questions) {
    // Processar supporting materials - extrair conteúdo dos blocos
    const processedMaterials: any[] = []
    let imageUrl = null

    if (q.supportingMaterials && q.supportingMaterials.length > 0) {
      for (const material of q.supportingMaterials) {
        // Se o material tem blocos, processar cada bloco
        if (material.blocks && material.blocks.length > 0) {
          for (const block of material.blocks) {
            if (block.type === 'paragraph' || block.type === 'verse') {
              processedMaterials.push({
                type: 'text',
                content: block.content,
                metadata: block.metadata
              })
            } else if (block.type === 'image' || block.type === 'photo' || block.type === 'chart' || block.type === 'artwork' || block.type === 'map') {
              // Qualquer tipo de imagem/visual
              processedMaterials.push({
                type: 'image',
                url: block.url,
                alt: block.alt,
                caption: block.caption,
                imageType: block.type
              })
              // Extrair primeira imagem para imageUrl
              if (!imageUrl) {
                imageUrl = block.url
              }
            }
          }
        } else if (material.type === 'image') {
          // Material direto de imagem (sem blocos)
          processedMaterials.push({
            type: 'image',
            url: material.url,
            alt: material.alt,
            caption: material.caption,
            imageType: material.imageType
          })
          if (!imageUrl) {
            imageUrl = material.url
          }
        }
      }
    }

    const supportingMaterials = processedMaterials.length > 0
      ? JSON.stringify(processedMaterials)
      : null

    await prisma.question.create({
      data: {
        examId: exam.id,
        questionNumber: q.number,
        knowledgeArea: q.area,
        subject: q.subject,
        // Armazena em lowercase para busca case-insensitive no SQLite
        statement: q.statement.toLowerCase(),
        context: null, // ENEM 2025 usa supportingMaterials ao invés de context
        optionA: q.alternatives.A.toLowerCase(),
        optionB: q.alternatives.B.toLowerCase(),
        optionC: q.alternatives.C.toLowerCase(),
        optionD: q.alternatives.D.toLowerCase(),
        optionE: q.alternatives.E.toLowerCase(),
        correctAnswer: q.correctAnswer,
        imageUrl,
        supportingMaterials,
        languageOption: q.languageOption || null,
      }
    })
    createdCount++
  }

  console.log(`  ${createdCount} questões criadas para ${enemData.exam.year}`)

  console.log("\nSeed concluído com sucesso!")
  console.log(`Total de questões: ${createdCount}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
