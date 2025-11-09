// lib/schemas/userSchema.js
import { z } from 'zod';

// Definimos as regras de validação para a criação de um utilizador.
export const createUserSchema = z.object({
  name: z.string({
    required_error: 'O nome é obrigatório.',
  }).min(3, { message: 'O nome deve ter pelo menos 3 caracteres.' }),
  
  email: z.string({
    required_error: 'O email é obrigatório.',
  }).email({ message: 'Por favor, insira um email válido.' }),
  
  password: z.string({
    required_error: 'A senha é obrigatória.',
  }).min(8, { message: 'A senha deve ter pelo menos 8 caracteres.' }),

  phone: z.string({
    required_error: 'O telefone é obrigatório.',
  })
  // Primeiro, removemos todos os caracteres que não são dígitos.
  .transform(val => val.replace(/\D/g, ''))
  // Depois, validamos se o resultado tem exatamente 11 dígitos.
  .pipe(z.string().length(11, { message: 'O telefone deve ter 11 dígitos (DDD + número).' })),
});
