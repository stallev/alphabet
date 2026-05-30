import { z } from 'zod';

export const answerItemSchema = z.object({
  id: z.number().int().positive(),
  value: z.string().min(1).max(500),
});

export const questionImportSchema = z
  .object({
    id: z.number().int().positive(),
    questionContent: z.string().min(1).max(1000),
    complexityLevel: z.enum(['easy', 'medium', 'hard']),
    answerType: z.enum(['ID', 'String']),
    answersList: z.array(answerItemSchema).min(2).max(10).nullable(),
    rightAnswerId: z.number().int().positive().nullable().optional(),
    rightAnswerString: z.string().max(500).nullable().optional(),
  })
  .refine(
    (data) => {
      if (data.answerType === 'ID') {
        return (
          Array.isArray(data.answersList) &&
          data.answersList.length >= 2 &&
          data.rightAnswerId != null
        );
      }
      if (data.answerType === 'String') {
        return (
          data.rightAnswerString != null && data.rightAnswerString.trim().length > 0
        );
      }
      return false;
    },
    {
      message:
        'Для answerType=ID обязательны answersList (≥2) и rightAnswerId. Для answerType=String — rightAnswerString.',
    }
  );

export const suiteImportSchema = z.object({
  title: z.string().min(1).max(255),
  language: z
    .string()
    .length(2)
    .regex(/^[a-z]{2}$/, 'Двухбуквенный код языка (ru, en, ...)')
    .optional()
    .default('ru'),
  description: z.string().max(1000).optional(),
  questionsList: z
    .array(questionImportSchema)
    .min(1, 'Набор должен содержать хотя бы 1 вопрос')
    .max(500, 'Не более 500 вопросов в одном наборе'),
});

export type SuiteImportInput = z.infer<typeof suiteImportSchema>;
export type QuestionImportInput = z.infer<typeof questionImportSchema>;
