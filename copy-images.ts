import fs from 'fs';
import path from 'path';

const EXTRACOES_IMAGES = path.join(process.cwd(), 'extracoes-enem', 'images');
const PUBLIC_IMAGES = path.join(process.cwd(), 'public', 'images', 'enem');

interface CopyStats {
  year: number;
  filesCopied: number;
  totalSize: number;
  errors: string[];
}

/**
 * Copia imagens de um ano específico
 */
async function copyYearImages(year: number): Promise<CopyStats> {
  const stats: CopyStats = {
    year,
    filesCopied: 0,
    totalSize: 0,
    errors: [],
  };

  const sourceDir = path.join(EXTRACOES_IMAGES, `prova-${year}`);
  const destDir = path.join(PUBLIC_IMAGES, year.toString());

  // Verifica se pasta de origem existe
  if (!fs.existsSync(sourceDir)) {
    stats.errors.push(`Pasta de origem não encontrada: ${sourceDir}`);
    return stats;
  }

  // Cria pasta de destino
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  // Lista todos os arquivos PNG
  const files = fs.readdirSync(sourceDir).filter(f => f.endsWith('.png'));

  console.log(`📂 ${year}: Encontrados ${files.length} arquivos`);

  for (const file of files) {
    try {
      const sourcePath = path.join(sourceDir, file);
      const destPath = path.join(destDir, file);

      // Copia arquivo
      fs.copyFileSync(sourcePath, destPath);

      // Atualiza estatísticas
      const stat = fs.statSync(destPath);
      stats.filesCopied++;
      stats.totalSize += stat.size;

    } catch (error: any) {
      stats.errors.push(`Erro ao copiar ${file}: ${error.message}`);
    }
  }

  return stats;
}

/**
 * Formata tamanho de bytes para leitura humana
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Script principal
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('❌ Nenhum ano especificado!');
    console.log('\nUso:');
    console.log('  bun copy-images.ts 2022 2023');
    console.log('  bun copy-images.ts 2020-2023');
    console.log('  bun copy-images.ts all');
    process.exit(1);
  }

  let yearsToCopy: number[] = [];

  // Parse argumentos
  if (args[0] === 'all') {
    // Procura todas as pastas prova-* disponíveis
    const availableDirs = fs.readdirSync(EXTRACOES_IMAGES)
      .filter(dir => dir.startsWith('prova-'))
      .map(dir => parseInt(dir.replace('prova-', '')))
      .filter(y => !isNaN(y))
      .sort();

    yearsToCopy = availableDirs;

  } else if (args[0].includes('-')) {
    // Range de anos
    const [start, end] = args[0].split('-').map(y => parseInt(y));
    for (let year = start; year <= end; year++) {
      yearsToCopy.push(year);
    }

  } else {
    // Anos específicos
    yearsToCopy = args.map(y => parseInt(y)).filter(y => !isNaN(y));
  }

  console.log('🖼️  CÓPIA DE IMAGENS DO ENEM');
  console.log(`📊 Total de anos: ${yearsToCopy.length}`);
  console.log(`📁 Origem: ${EXTRACOES_IMAGES}`);
  console.log(`📁 Destino: ${PUBLIC_IMAGES}`);
  console.log('═'.repeat(70));
  console.log('');

  const allStats: CopyStats[] = [];
  let totalFiles = 0;
  let totalSize = 0;

  for (const year of yearsToCopy) {
    const stats = await copyYearImages(year);
    allStats.push(stats);

    if (stats.errors.length > 0) {
      console.log(`   ❌ ${stats.errors.length} erros:`);
      stats.errors.forEach(err => console.log(`      ${err}`));
    }

    if (stats.filesCopied > 0) {
      console.log(`   ✅ ${stats.filesCopied} arquivos copiados (${formatBytes(stats.totalSize)})`);
      totalFiles += stats.filesCopied;
      totalSize += stats.totalSize;
    } else if (stats.errors.length === 0) {
      console.log(`   ⚠️  Nenhum arquivo encontrado`);
    }

    console.log('');
  }

  // Resumo final
  console.log('═'.repeat(70));
  console.log('📈 RESUMO GERAL:');
  console.log(`   📁 Anos processados: ${yearsToCopy.length}`);
  console.log(`   ✅ Arquivos copiados: ${totalFiles}`);
  console.log(`   💾 Tamanho total: ${formatBytes(totalSize)}`);

  const yearsWithErrors = allStats.filter(s => s.errors.length > 0).length;
  if (yearsWithErrors > 0) {
    console.log(`   ⚠️  Anos com erros: ${yearsWithErrors}`);
  }

  const yearsWithNoFiles = allStats.filter(s => s.filesCopied === 0 && s.errors.length === 0).length;
  if (yearsWithNoFiles > 0) {
    console.log(`   ⚠️  Anos sem arquivos: ${yearsWithNoFiles}`);
  }

  console.log('\n✨ Processo concluído!');
}

main().catch(console.error);
