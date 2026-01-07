import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function insertQuestions() {
  try {
    // Read the JSON file
    const filePath = path.join(process.cwd(), 'tmp-questions.json');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(fileContent);

    console.log(`📚 Inserindo ${data.questions.length} questões...`);

    for (const question of data.questions) {
      console.log(`\n📝 Processando questão ${question.number} (${question.id})...`);

      // Build supporting materials JSONB structure
      const supportingMaterialsJson = question.supportingMaterials?.map((material: any) => ({
        id: material.id,
        order: material.order,
        blocks: material.blocks || []
      })) || null;

      // Insert the question using the actual schema
      const { data: insertedQuestion, error: questionError } = await supabase
        .from('Question')
        .insert({
          id: question.id,
          examId: question.examYear.toString(), // Will need to be linked to proper Exam record
          questionNumber: question.number,
          knowledgeArea: question.area,
          subject: question.subject,
          languageOption: question.languageOption || null,
          statement: question.statement,
          context: null, // Not in the new format
          optionA: question.alternatives?.A || '',
          optionB: question.alternatives?.B || '',
          optionC: question.alternatives?.C || '',
          optionD: question.alternatives?.D || '',
          optionE: question.alternatives?.E || '',
          correctAnswer: question.correctAnswer,
          imageUrl: null, // Will be added later if needed
          supportingMaterials: supportingMaterialsJson,
          aiExplanation: null,
        })
        .select()
        .single();

      if (questionError) {
        console.error(`❌ Erro ao inserir questão ${question.number}:`, questionError);
        continue;
      }

      console.log(`✅ Questão ${question.number} inserida com sucesso`);
    }

    console.log('\n✨ Processo concluído!');
  } catch (error) {
    console.error('❌ Erro geral:', error);
    process.exit(1);
  }
}

insertQuestions();
