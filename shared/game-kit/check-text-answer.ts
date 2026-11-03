export function checkTextAnswer(input: string, correct: string): boolean {
  const normalizedInput = input.trim();
  const normalizedCorrect = correct.trim();
  if (normalizedInput === '' || normalizedCorrect === '') {
    return false;
  }
  return normalizedInput.toLowerCase() === normalizedCorrect.toLowerCase();
}
