const fs = require('fs');
const path = require('path');

// Função para limpar o padrão ENEM2024 repetido e texto do cabeçalho
function cleanText(text) {
  if (!text || typeof text !== 'string') return text;
  
  // Remove o padrão ENEM2024 repetido (com variações como ENEM20E4)
  // e também remove o texto do cabeçalho do caderno
  let cleaned = text;
  
  // Remove tudo a partir do primeiro padrão ENEM2024ENEM2024 (incluindo quebras de linha)
  const enemPattern = /ENEM2024ENEM2024[\s\S]*$/;
  cleaned = cleaned.replace(enemPattern, '');
  
  // Remove também padrões isolados de ENEM2024 repetido
  const enemPattern2 = /\s*ENEM2024{2,}.*$/;
  cleaned = cleaned.replace(enemPattern2, '');
  
  // Remove padrões como "ENEM20E4 ENEM20E4" seguido de texto do cabeçalho
  const enemPattern3 = /\s*ENEM20E4\s+ENEM20E4\s+\d+\s+[A-ZÁÊÇ\s•]+$/;
  cleaned = cleaned.replace(enemPattern3, '');
  
  // Remove qualquer ocorrência de "ENEM20E4" repetido no final
  const enemPattern4 = /\s*ENEM20E4\s+ENEM20E4.*$/;
  cleaned = cleaned.replace(enemPattern4, '');
  
  // Remove também o texto do cabeçalho do caderno se ainda estiver presente
  const headerPattern = /\s*CIÊNCIAS DA NATUREZA E SUAS TECNOLOGIAS[\s\S]*$/;
  cleaned = cleaned.replace(headerPattern, '');
  
  // Remove também o texto do cabeçalho de matemática
  const mathHeaderPattern = /\s*MATEMÁTICA E SUAS TECNOLOGIAS[\s\S]*$/;
  cleaned = cleaned.replace(mathHeaderPattern, '');
  
  // Remove caracteres especiais no final (como •)
  cleaned = cleaned.replace(/\s*•\s*$/, '');
  
  // Remove espaços em branco no final
  cleaned = cleaned.trim();
  
  return cleaned;
}

// Função para processar um arquivo JSON
function processJsonFile(filePath) {
  console.log(`\nProcessando ${filePath}...`);
  const content = fs.readFileSync(filePath, 'utf8');
  const questions = JSON.parse(content);
  
  let fixedCount = 0;
  let totalQuestions = 0;
  const fixedQuestions = [];
  
  for (const question of questions) {
    totalQuestions++;
    let questionFixed = false;
    const originalQuestion = JSON.parse(JSON.stringify(question));
    
    // Limpa todas as opções (A, B, C, D, E)
    ['optionA', 'optionB', 'optionC', 'optionD', 'optionE'].forEach(optionKey => {
      const optionValue = question[optionKey];
      if (optionValue) {
        const cleaned = cleanText(optionValue);
        if (cleaned !== optionValue) {
          question[optionKey] = cleaned;
          questionFixed = true;
        }
      }
    });
    
    // Limpa também o statement se necessário
    if (question.statement) {
      const cleaned = cleanText(question.statement);
      if (cleaned !== question.statement) {
        question.statement = cleaned;
        questionFixed = true;
      }
    }
    
    // Limpa também o context se necessário
    if (question.context) {
      const cleaned = cleanText(question.context);
      if (cleaned !== question.context) {
        question.context = cleaned;
        questionFixed = true;
      }
    }
    
    if (questionFixed) {
      fixedCount++;
      fixedQuestions.push({
        number: question.questionNumber,
        original: originalQuestion,
        fixed: question
      });
      
      console.log(`  ✓ Corrigida questão ${question.questionNumber}`);
      
      // Mostra o que foi corrigido
      ['optionA', 'optionB', 'optionC', 'optionD', 'optionE'].forEach(optionKey => {
        if (originalQuestion[optionKey] !== question[optionKey]) {
          const original = originalQuestion[optionKey] || '';
          const fixed = question[optionKey] || '';
          console.log(`    ${optionKey}: "${original.substring(0, 50)}..." → "${fixed.substring(0, 50)}..."`);
        }
      });
    }
  }
  
  if (fixedCount > 0) {
    // Backup do arquivo original
    const backupPath = filePath.replace('.json', '.json.backup');
    fs.writeFileSync(backupPath, content, 'utf8');
    console.log(`\n  Backup criado: ${backupPath}`);
    
    // Salva o arquivo corrigido
    fs.writeFileSync(filePath, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`  Arquivo atualizado: ${filePath}`);
    
    // Retorna informações sobre as questões corrigidas para uso no banco de dados
    return { 
      fixedCount, 
      totalQuestions, 
      fixedQuestions,
      examId: questions[0]?.examId || null // Assumindo que todas as questões têm o mesmo examId
    };
  }
  
  return { fixedCount, totalQuestions, fixedQuestions: [], examId: null };
}

// Processa o arquivo específico
const filePath = path.join(__dirname, 'src', 'data', '2024', '2024_D2_CD7_questoes.json');

if (!fs.existsSync(filePath)) {
  console.error(`Arquivo não encontrado: ${filePath}`);
  process.exit(1);
}

const result = processJsonFile(filePath);

console.log(`\n========================================`);
console.log(`Total de questões corrigidas: ${result.fixedCount}`);
console.log(`Total de questões no arquivo: ${result.totalQuestions}`);
console.log(`========================================`);

// Exporta informações para uso no banco de dados
if (result.fixedCount > 0) {
  const updateInfo = {
    file: '2024_D2_CD7_questoes.json',
    fixedCount: result.fixedCount,
    fixedQuestions: result.fixedQuestions.map(q => ({
      questionNumber: q.number,
      updates: {
        optionA: q.fixed.optionA !== q.original.optionA ? q.fixed.optionA : undefined,
        optionB: q.fixed.optionB !== q.original.optionB ? q.fixed.optionB : undefined,
        optionC: q.fixed.optionC !== q.original.optionC ? q.fixed.optionC : undefined,
        optionD: q.fixed.optionD !== q.original.optionD ? q.fixed.optionD : undefined,
        optionE: q.fixed.optionE !== q.original.optionE ? q.fixed.optionE : undefined,
        statement: q.fixed.statement !== q.original.statement ? q.fixed.statement : undefined,
        context: q.fixed.context !== q.original.context ? q.fixed.context : undefined,
      }
    }))
  };
  
  fs.writeFileSync(
    path.join(__dirname, 'fix-enem2024-updates.json'),
    JSON.stringify(updateInfo, null, 2),
    'utf8'
  );
  console.log(`\nInformações de atualização salvas em: fix-enem2024-updates.json`);
}
