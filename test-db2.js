import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'

const adapter = new PrismaLibSql({
  url: 'file:./dev.db',
})

const db = new PrismaClient({ adapter })

// Test 1: Search with lowercase
const q1 = await db.question.findFirst({
  where: {
    context: {
      contains: 'revolução'
    }
  }
})

console.log('Test 1 - Search "revolução" (lowercase):',q1 ? 'FOUND' : 'NOT FOUND')
if (q1) {
  console.log('  Context:', q1.context.substring(0, 60))
}

// Test 2: Check if data is actually lowercase
const q2 = await db.question.findFirst({
  where: {
    context: {
      not: null
    }
  }
})

console.log('\nTest 2 - First question context:')
console.log('  First 60 chars:', q2?.context.substring(0, 60))
console.log('  Is lowercase?', q2?.context === q2?.context.toLowerCase())

await db.$disconnect()
