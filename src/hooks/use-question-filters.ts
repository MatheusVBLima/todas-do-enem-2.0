"use client"

import { parseAsArrayOf, parseAsInteger, parseAsString, useQueryStates } from "nuqs"

export function useQuestionFilters() {
  return useQueryStates({
    anos: parseAsArrayOf(parseAsInteger).withDefault([]),
    areas: parseAsArrayOf(parseAsString).withDefault([]),
    disciplinas: parseAsArrayOf(parseAsString).withDefault([]),
    busca: parseAsString.withDefault(""),
    pagina: parseAsInteger.withDefault(1),
  })
}

export type QuestionFiltersState = ReturnType<typeof useQuestionFilters>[0]
export type QuestionFiltersSetters = ReturnType<typeof useQuestionFilters>[1]
