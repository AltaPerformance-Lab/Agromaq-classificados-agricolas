import { z } from 'zod';

export const moderacaoSchema = z.object({
  type: z.enum(['maquina', 'fazenda']),
  status: z.enum(['ATIVO', 'SUSPENSO']),
  // O motivo é opcional, mas se for enviado, deve ser uma string
  reason: z.string().optional().nullable(),
});
