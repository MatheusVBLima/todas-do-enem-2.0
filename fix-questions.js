const fs = require('fs');
const path = require('path');

// Função para remover o padrão ENEM2024... do final das opções
function fixOptionE(text) {
  if (!text) return text;
  const regex = /\s*ENEM2024ENEM2024ENEM2024[ENEM20E4]*$/;
  return text.replace(regex, '');
}

// Função para processar um arquivo JSON
function processJsonFile(filePath) {
  console.log(`\nProcessando ${filePath}...`);
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
          const questionNumber = question.questionNumber;
          const questionNumStr = questionNumber ? `questão ${questionNumber}` : '';
          console.log(`  Corrigido ${optionKey} da questão ${questionNumber || '?'} ${questionNumStr}`);
          console.log(`    Original: ${originalOption.substring(0, 60)}...`);
          console.log(`    Corrigido: ${fixedOption.substring(0, 60)}...`);
        }
      }
    });
  }
  
  if (fixedCount > 0) {
    // Backup do arquivo original
    const backupPath = filePath.replace('.json', '.json.backup');
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`  Backup criado: ${backupPath}`);
    
    // Salva o arquivo corrigido
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`  Arquivo atualizado: ${filePath}`);
  }
  
  return { fixedCount, totalQuestions };
}

// Processa os arquivos
const dataDir = path.join(__dirname, 'src', 'data', '2024');
const files = ['2024_D1_CD1_questoes.json', '2024_D2_CD7_questoes.json'];

let totalFixed = 0;
for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (fs.existsSync(filePath)) {
    const result = processJsonFile(filePath);
    totalFixed += result.fixedCount;
    console.log(`  Total questões no arquivo: ${result.totalQuestions}`);
  }
}

console.log(`\n========================================`);
console.log(`Total de correções realizadas: ${totalFixed}`);
console.log(`========================================`);
