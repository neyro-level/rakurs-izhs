import { z } from 'zod';

export const RequestLeadSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Введите имя, чтобы мы поняли, как к вам обращаться.')
    .max(100, 'Имя слишком длинное.'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-()]{10,20}$/, 'Введите телефон в формате +7 (999) 999-99-99.'),
  agreed: z.boolean().refine((value) => value, {
    message: 'Нужно согласие на обработку персональных данных.',
  }),
});

export type RequestLeadInput = z.infer<typeof RequestLeadSchema>;
