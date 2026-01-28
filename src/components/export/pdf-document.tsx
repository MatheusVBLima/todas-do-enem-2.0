import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer"
import type { QuestionWithExam } from "@/types"

// Registrar fonte que suporta caracteres portugueses
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
      fontWeight: 400,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: 700,
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-italic-webfont.ttf",
      fontStyle: "italic",
    },
  ],
})

// Mapeamento de áreas e disciplinas
const AREAS: Record<string, string> = {
  LINGUAGENS: "Linguagens",
  CIENCIAS_HUMANAS: "Humanas",
  CIENCIAS_NATUREZA: "Natureza",
  MATEMATICA: "Matemática",
}

const SUBJECTS: Record<string, string> = {
  PORTUGUES: "Português",
  LITERATURA: "Literatura",
  INGLES: "Inglês",
  ESPANHOL: "Espanhol",
  ARTES: "Artes",
  EDUCACAO_FISICA: "Ed. Física",
  HISTORIA: "História",
  GEOGRAFIA: "Geografia",
  FILOSOFIA: "Filosofia",
  SOCIOLOGIA: "Sociologia",
  BIOLOGIA: "Biologia",
  FISICA: "Física",
  QUIMICA: "Química",
  MATEMATICA: "Matemática",
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Roboto",
    fontSize: 11,
    lineHeight: 1.5,
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#000000",
  },
  title: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 11,
    color: "#666666",
  },
  question: {
    marginBottom: 25,
  },
  questionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
    gap: 8,
  },
  questionNumber: {
    fontWeight: 700,
    fontSize: 12,
    backgroundColor: "#f0f0f0",
    padding: "4 8",
    borderRadius: 4,
  },
  questionMeta: {
    fontSize: 10,
    color: "#666666",
  },
  context: {
    fontSize: 10,
    color: "#444444",
    fontStyle: "italic",
    marginBottom: 10,
    paddingLeft: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#cccccc",
  },
  statement: {
    marginBottom: 12,
    textAlign: "justify",
  },
  optionsContainer: {
    marginLeft: 8,
  },
  option: {
    flexDirection: "row",
    marginBottom: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 3,
  },
  optionLetter: {
    fontWeight: 700,
    width: 20,
  },
  optionText: {
    flex: 1,
  },
  optionCorrect: {
    backgroundColor: "#dcfce7",
  },
  optionCorrectText: {
    fontWeight: 700,
    color: "#166534",
  },
  answer: {
    marginTop: 10,
    fontSize: 11,
    fontWeight: 700,
    color: "#166534",
  },
  separator: {
    marginTop: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    fontSize: 9,
    color: "#666666",
    borderTopWidth: 1,
    borderTopColor: "#cccccc",
    paddingTop: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 30,
    right: 40,
    fontSize: 9,
    color: "#666666",
  },
})

interface PDFDocumentProps {
  questions: QuestionWithExam[]
  title: string
  showAnswers?: boolean
}

export function QuestionsPDFDocument({
  questions,
  title,
  showAnswers = true,
}: PDFDocumentProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>
            Total de questões: {questions.length}
          </Text>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <View
            key={question.id}
            style={styles.question}
            wrap={false}
          >
            {/* Question Header */}
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>
                Questão {question.questionNumber}
              </Text>
              <Text style={styles.questionMeta}>
                ENEM {question.exam.year} •{" "}
                {AREAS[question.knowledgeArea] || question.knowledgeArea} •{" "}
                {SUBJECTS[question.subject] || question.subject}
              </Text>
            </View>

            {/* Context */}
            {question.context && (
              <View style={styles.context}>
                <Text>{question.context}</Text>
              </View>
            )}

            {/* Statement */}
            <Text style={styles.statement}>{question.statement}</Text>

            {/* Options */}
            <View style={styles.optionsContainer}>
              {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                const optionKey = `option${letter}` as keyof QuestionWithExam
                const optionText = question[optionKey] as string | null
                const isCorrect = question.correctAnswer === letter
                const highlight = showAnswers && isCorrect

                if (!optionText) return null

                return (
                  <View
                    key={letter}
                    style={[
                      styles.option,
                      highlight ? styles.optionCorrect : {},
                    ]}
                  >
                    <Text style={[styles.optionLetter, highlight ? styles.optionCorrectText : {}]}>
                      {letter})
                    </Text>
                    <Text style={[styles.optionText, highlight ? styles.optionCorrectText : {}]}>
                      {optionText}
                    </Text>
                  </View>
                )
              })}
            </View>

            {/* Answer */}
            {showAnswers && (
              <Text style={styles.answer}>
                Gabarito: {question.correctAnswer}
              </Text>
            )}

            {/* Separator */}
            {index < questions.length - 1 && <View style={styles.separator} />}
          </View>
        ))}

        {/* Footer */}
        <Text style={styles.footer} fixed>
          Gerado por Todas do ENEM • todasdoenem.com.br
        </Text>

        {/* Page Number */}
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  )
}
