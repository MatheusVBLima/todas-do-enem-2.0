const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'data', '2024', '2024_D2_CD7_questoes.json');
const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

// Corrige questão 166
const q166 = data.find(q => q.questionNumber === 166);
if (q166) {
  q166.optionA = 'd(Q) = (1/3) d(R)';
  q166.optionB = 'd(Q) = (2/3) d(R)';
  q166.optionC = 'd(Q) = (4/3) d(R)';
  q166.optionD = 'd(Q) = (3/2) d(R)';
  q166.optionE = 'd(Q) = (2/3) d(R)';
  console.log('✓ Questão 166 corrigida');
}

// Corrige questão 169
const q169 = data.find(q => q.questionNumber === 169);
if (q169) {
  q169.optionA = '1/26 + 1/25 + 1/24';
  q169.optionB = '24/26 + 24/25 + 24/24';
  q169.optionC = '25/26 × 24/25 × 1/24';
  q169.optionD = '24/26 × 23/25 × 1/24';
  q169.optionE = '25/26 × 24/25 × 1/24';
  console.log('✓ Questão 169 corrigida');
}

// Corrige questão 180
const q180 = data.find(q => q.questionNumber === 180);
if (q180) {
  q180.optionA = '7!/(4!×3!)';
  q180.optionB = '6!/(3!×3!) × 7!/(4!×3!)';
  q180.optionC = '7!/(2!×5!)';
  q180.optionD = '7!/(3!×4!) × 6!/(2!×4!) + 7!/(4!×3!) × 6!/(1!×5!) + 7!/(5!×2!)';
  q180.optionE = '7!/(3!×4!) × 6!/(2!×4!) + 7!/(4!×3!) × 6!/(1!×5!) + 7!/(5!×2!)';
  console.log('✓ Questão 180 corrigida');
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
console.log('\nArquivo atualizado!');
