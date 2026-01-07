import fs from 'fs';
import path from 'path';
import { processExamFile } from './parse-enem-markdown';

const EXTRACOES_DIR = path.join(process.cwd(), 'extracoes-enem', 'extracoes');
const OUTPUT_DIR = path.join(process.cwd(), 'src', 'data');

// Anos problemáticos (PDFs com imagem apenas)
const PROBLEMATIC_YEARS = [2006, 2007, 2008];

async function convertYear(year: number): Promise<void> {
  const yearDir = path.join(EXTRACOES_DIR, year.toString());

  if (!fs.existsSync(yearDir)) {
    console.log(`⚠️  Ano ${year}: diretório não encontrado`);
    return;
  }

  const mdFiles = fs.readdirSync(yearDir).filter(f => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.log(`⚠️  Ano ${year}: nenhum arquivo .md encontrado`);
    return;
  }

  console.log(`\n📅 ANO ${year}`);
  console.log(`   Arquivos encontrados: ${mdFiles.length}`);

  for (const mdFile of mdFiles) {
    try {
      const filePath = path.join(yearDir, mdFile);
      const examData = await processExamFile(filePath);

      // Gera nome do arquivo de saída
      const outputFileName = `enem-${examData.exam.year}-d${examData.exam.day}-${examData.exam.color.toLowerCase()}.json`;
      const outputPath = path.join(OUTPUT_DIR, examData.exam.year.toString(), outputFileName);

      // Cria diretório do ano se não existir
      const yearOutputDir = path.join(OUTPUT_DIR, examData.exam.year.toString());
      if (!fs.existsSync(yearOutputDir)) {
        fs.mkdirSync(yearOutputDir, { recursive: true });
      }

      // Salva JSON
      fs.writeFileSync(outputPath, JSON.stringify(examData, null, 2), 'utf-8');

      console.log(`   ✅ ${outputFileName} (${examData.questions.length} questões)`);

    } catch (error: any) {
      console.error(`   ❌ Erro ao processar ${mdFile}: ${error.message}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);

  // Parse argumentos
  let yearsToProcess: number[] = [];

  if (args.length === 0) {
    console.log('❌ Nenhum ano especificado!');
    console.log('\nUso:');
    console.log('  bun convert-all-exams.ts 2022 2023 2024 2025');
    console.log('  bun convert-all-exams.ts 2020-2025');
    console.log('  bun convert-all-exams.ts all');
    process.exit(1);
  }

  if (args[0] === 'all') {
    // Processar todos os anos disponíveis
    const allYears = fs.readdirSync(EXTRACOES_DIR)
      .filter(item => {
        const itemPath = path.join(EXTRACOES_DIR, item);
        return fs.statSync(itemPath).isDirectory();
      })
      .map(y => parseInt(y))
      .filter(y => !isNaN(y) && !PROBLEMATIC_YEARS.includes(y))
      .sort();

    yearsToProcess = allYears;

  } else if (args[0].includes('-')) {
    // Range de anos (ex: 2020-2025)
    const [start, end] = args[0].split('-').map(y => parseInt(y));
    for (let year = start; year <= end; year++) {
      if (!PROBLEMATIC_YEARS.includes(year)) {
        yearsToProcess.push(year);
      }
    }

  } else {
    // Anos específicos
    yearsToProcess = args.map(y => parseInt(y)).filter(y => !isNaN(y));
  }

  // Remove anos problemáticos
  const filteredYears = yearsToProcess.filter(y => !PROBLEMATIC_YEARS.includes(y));
  const skippedProblematic = yearsToProcess.filter(y => PROBLEMATIC_YEARS.includes(y));

  if (skippedProblematic.length > 0) {
    console.log(`⚠️  Anos ignorados (PDFs com imagem): ${skippedProblematic.join(', ')}`);
  }

  if (filteredYears.length === 0) {
    console.log('❌ Nenhum ano válido para processar!');
    process.exit(1);
  }

  console.log('🚀 CONVERSÃO DE PROVAS ENEM PARA JSON');
  console.log(`📊 Total de anos a processar: ${filteredYears.length}`);
  console.log(`📂 Saída: ${OUTPUT_DIR}`);
  console.log('═'.repeat(60));

  let totalSuccess = 0;
  let totalFailed = 0;

  for (const year of filteredYears) {
    try {
      await convertYear(year);
      totalSuccess++;
    } catch (error: any) {
      console.error(`\n❌ Erro fatal ao processar ano ${year}: ${error.message}`);
      totalFailed++;
    }
  }

  console.log('\n' + '═'.repeat(60));
  console.log('📈 RESUMO:');
  console.log(`   ✅ Sucesso: ${totalSuccess} anos`);
  if (totalFailed > 0) {
    console.log(`   ❌ Falhas: ${totalFailed} anos`);
  }
  console.log('\n✨ Conversão concluída!');
}

main().catch(console.error);
