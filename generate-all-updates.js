const fs = require('fs');
const path = require('path');

// Questões que foram corrigidas (baseado na execução anterior)
const correctedQuestions = [
  93, 97, 100, 104, 109, 112, 114, 121, 124, 127, 138, 141, 145, 149, 153, 156, 160, 161, 164, 167, 168, 170, 172, 174, 175, 176, 180
];

// Lê o arquivo JSON corrigido
const jsonFile = path.join(__dirname, 'src', 'data', '2024', '2024_D2_CD7_questoes.json');
const questions = JSON.parse(fs.readFileSync(jsonFile, 'utf8'));

// ExamId para 2024 D2
const examId = 'ENEM_2024_D2';

// Gera os SQL UPDATEs
const sqlUpdates = [];
const updates = [];

for (const question of questions) {
  if (correctedQuestions.includes(question.questionNumber)) {
    const questionNumber = question.questionNumber;
    
    // Monta o SET clause
    const setClauses = [];
    const params = [];
    let paramIndex = 1;
    const updateObj = {};
    
    // Sempre atualiza todas as opções e statement para garantir consistência
    setClauses.push(`"optionA" = $${paramIndex}`);
    params.push(question.optionA || '');
    updateObj.optionA = question.optionA || '';
    paramIndex++;
    
    setClauses.push(`"optionB" = $${paramIndex}`);
    params.push(question.optionB || '');
    updateObj.optionB = question.optionB || '';
    paramIndex++;
    
    setClauses.push(`"optionC" = $${paramIndex}`);
    params.push(question.optionC || '');
    updateObj.optionC = question.optionC || '';
    paramIndex++;
    
    setClauses.push(`"optionD" = $${paramIndex}`);
    params.push(question.optionD || '');
    updateObj.optionD = question.optionD || '';
    paramIndex++;
    
    setClauses.push(`"optionE" = $${paramIndex}`);
    params.push(question.optionE || '');
    updateObj.optionE = question.optionE || '';
    paramIndex++;
    
    setClauses.push(`"statement" = $${paramIndex}`);
    params.push(question.statement || '');
    updateObj.statement = question.statement || '';
    paramIndex++;
    
    if (question.context) {
      setClauses.push(`"context" = $${paramIndex}`);
      params.push(question.context);
      updateObj.context = question.context;
      paramIndex++;
    }
    
    const sql = `UPDATE "Question" SET ${setClauses.join(', ')} WHERE "examId" = '${examId}' AND "questionNumber" = ${questionNumber};`;
    sqlUpdates.push({ sql, params, questionNumber, updateObj });
    updates.push({ questionNumber, updates: updateObj });
  }
}

// Salva os SQLs em um arquivo
const sqlFile = path.join(__dirname, 'update-enem2024-all.sql');
const sqlContent = sqlUpdates.map(({ sql, questionNumber }) => `-- Questão ${questionNumber}\n${sql}`).join('\n\n');
fs.writeFileSync(sqlFile, sqlContent, 'utf8');

// Salva também um arquivo JSON com os updates
const updatesFile = path.join(__dirname, 'fix-enem2024-all-updates.json');
fs.writeFileSync(updatesFile, JSON.stringify({ fixedCount: sqlUpdates.length, fixedQuestions: updates }, null, 2), 'utf8');

console.log(`\nGerados ${sqlUpdates.length} SQL UPDATEs`);
console.log(`Arquivo SQL salvo em: ${sqlFile}`);
console.log(`Arquivo de updates salvo em: ${updatesFile}`);
console.log(`\nPrimeiros 3 SQLs:`);
sqlUpdates.slice(0, 3).forEach(({ sql, questionNumber }) => {
  console.log(`\n-- Questão ${questionNumber}`);
  console.log(sql.substring(0, 300) + '...');
});
