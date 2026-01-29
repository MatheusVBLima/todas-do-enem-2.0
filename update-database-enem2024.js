const fs = require('fs');
const path = require('path');

// Lê o arquivo de updates
const updatesFile = path.join(__dirname, 'fix-enem2024-updates.json');
const updates = JSON.parse(fs.readFileSync(updatesFile, 'utf8'));

// ExamId para 2024 D2
const examId = 'ENEM_2024_D2';

// Gera os SQL UPDATEs
const sqlUpdates = [];

for (const question of updates.fixedQuestions) {
  const questionNumber = question.questionNumber;
  const updatesObj = question.updates;
  
  // Monta o SET clause
  const setClauses = [];
  const params = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updatesObj)) {
    if (value !== undefined) {
      // Converte optionA, optionB, etc para optionA, optionB no banco
      const dbKey = key; // Já está no formato correto
      setClauses.push(`"${dbKey}" = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }
  
  if (setClauses.length > 0) {
    const sql = `UPDATE "Question" SET ${setClauses.join(', ')} WHERE "examId" = '${examId}' AND "questionNumber" = ${questionNumber};`;
    sqlUpdates.push({ sql, params, questionNumber });
  }
}

// Salva os SQLs em um arquivo
const sqlFile = path.join(__dirname, 'update-enem2024.sql');
const sqlContent = sqlUpdates.map(({ sql }) => sql).join('\n\n');
fs.writeFileSync(sqlFile, sqlContent, 'utf8');

console.log(`\nGerados ${sqlUpdates.length} SQL UPDATEs`);
console.log(`Arquivo SQL salvo em: ${sqlFile}`);
console.log(`\nPrimeiros 3 SQLs:`);
sqlUpdates.slice(0, 3).forEach(({ sql, questionNumber }) => {
  console.log(`\n-- Questão ${questionNumber}`);
  console.log(sql.substring(0, 200) + '...');
});

// Exporta para uso no MCP
module.exports = { sqlUpdates, examId };
