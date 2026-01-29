const fs = require('fs');
const path = require('path');

// Função para remover o padrão ENEM2024... repetido do final das opções
function fixOptionE(text) {
  if (!text) return text;
  // Remove o padrão repetido "ENEM2024ENEM2024ENEM2024..." que aparece no final
  const regex = /\sENEM2024ENEM2024ENEM2024[ENEM20E4]*$/g;
  return text.replace(regex, '');
}

// Função para processar um arquivo JSON
function processJsonFile(filePath) {
  console.log(`\nProcessando ${path.basename(filePath)}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(content);
  
  let fixedCount = 0;
  let totalQuestions = 0;
  
  for (const question of questions) {
    totalQuestions++;
    
    // Verifica todas as opções (A, B, C, D, E)
    ['optionA', 'optionB', 'optionC', 'optionD', 'optionE'].forEach(optionKey => {
      const optionValue = question[optionKey];
      if (optionValue && optionValue.includes('ENEM2024ENEM2024ENEM2024')) {
        const originalOption = optionValue;
        const fixedOption = fixOptionE(originalOption);
        
        if (originalOption !== fixedOption) {
          question[optionKey] = fixedOption;
          fixedCount++;
          const qNum = question.questionNumber || '?';
          console.log(`  ✓ Questão ${qNum} - ${optionKey} corrigida`);
        }
      }
    });
  }
  
  if (fixedCount > 0) {
    // Backup do arquivo original
    const backupPath = filePath.replace('.json', '.json.backup');
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`  → Backup criado: ${path.basename(backupPath)}`);
    
    // Salva o arquivo corrigido
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`  → Arquivo atualizado: ${path.basename(filePath)}`);
  }
  
  return { fixedCount, totalQuestions };
}

// Processa os arquivos
const dataDir = path.join(__dirname, 'src', 'data', '2024');
const files = ['2024_D1_CD1_questoes.json', '2024_D2_CD7_questoes.json'];

let totalFixed = 0;
let totalQuestions = 0;
for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    const result = processJsonFile(filePath);
    totalFixed += result.fixedCount;
    totalQuestions += result.totalQuestions;
  }
}

console.log(`\n========================================`);
console.log(`Total de questões processadas: ${totalQuestions}`);
console.log(`Total de opções corrigidas: ${totalFixed}`);
console.log(`========================================`);
