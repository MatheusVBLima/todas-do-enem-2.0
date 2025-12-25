/**
 * Capitaliza a primeira letra de cada sentença
 */
export function capitalizeSentences(text: string): string {
  if (!text) return text

  // Capitaliza a primeira letra e após pontos finais
  return text
    .split('. ')
    .map(sentence => {
      if (!sentence) return sentence
      return sentence.charAt(0).toUpperCase() + sentence.slice(1)
    })
    .join('. ')
}

/**
 * Capitaliza a primeira letra do texto
 */
export function capitalizeFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}
