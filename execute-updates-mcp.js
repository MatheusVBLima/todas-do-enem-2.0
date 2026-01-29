const fs = require('fs');
const path = require('path');

// Função para escapar strings SQL
function escapeSqlString(str) {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''").replace(/\\/g, '\\\\') + "'";
}

// Lê o arquivo de updates
const updatesFile = path.join(__dirname, 'fix-enem2024-all-updates.json');
const updates = JSON.parse(fs.readFileSync(updatesFile, 'utf8'));

// ExamId para 2024 D2
const examId = 'ENEM_2024_D2';

// Gera os SQL UPDATEs com valores reais
const sqlUpdates = [];

for (const question of updates.fixedQuestions) {
  const questionNumber = question.questionNumber;
  const updateObj = question.updates;
  
  // Monta o SET clause
  const setClauses = [];
  
  if (updateObj.optionA !== undefined) {
    setClauses.push(`"optionA" = ${escapeSqlString(updateObj.optionA)}`);
  }
  if (updateObj.optionB !== undefined) {
    setClauses.push(`"optionB" = ${escapeSqlString(updateObj.optionB)}`);
  }
  if (updateObj.optionC !== undefined) {
    setClauses.push(`"optionC" = ${escapeSqlString(updateObj.optionC)}`);
  }
  if (updateObj.optionD !== undefined) {
    setClauses.push(`"optionD" = ${escapeSqlString(updateObj.optionD)}`);
  }
  if (updateObj.optionE !== undefined) {
    setClauses.push(`"optionE" = ${escapeSqlString(updateObj.optionE)}`);
  }
  if (updateObj.statement !== undefined) {
    setClauses.push(`"statement" = ${escapeSqlString(updateObj.statement)}`);
  }
  if (updateObj.context !== undefined) {
    setClauses.push(`"context" = ${escapeSqlString(updateObj.context)}`);
  }
  
  if (setClauses.length > 0) {
    const sql = `UPDATE "Question" SET ${setClauses.join(', ')} WHERE "examId" = '${examId}' AND "questionNumber" = ${questionNumber};`;
    sqlUpdates.push({ sql, questionNumber });
  }
}

// Salva os SQLs em um arquivo
const sqlFile = path.join(__dirname, 'update-enem2024-final.sql');
const sqlContent = sqlUpdates.map(({ sql, questionNumber }) => `-- Questão ${questionNumber}\n${sql}`).join('\n\n');
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
