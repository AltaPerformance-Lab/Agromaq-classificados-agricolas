import { z } from 'zod';

// Este é o schema para a CRIAÇÃO de um anúncio de fazenda.
// Ele garante que todos os campos obrigatórios sejam fornecidos e que o preço seja
// convertido corretamente para BigInt em centavos antes de ser guardado na base de dados.
export const createAnuncioFazendaSchema = z.object({
  titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  
  // Lógica CORRIGIDA: Converte a string "R$ 5.000.000,00" para o BigInt 500000000n
  preco: z.string()
    .refine(value => value.trim() !== '' && value !== 'R$ 0,00', { message: 'O preço é obrigatório.' })
    .transform(value => {
      // 1. Remove tudo o que não for dígito. "R$ 5.000.000,00" -> "500000000"
      const onlyDigits = value.replace(/\D/g, '');
      if (!onlyDigits) return BigInt(0);
      
      // 2. Converte a string de dígitos diretamente para um BigInt.
      return BigInt(onlyDigits);
    }),

  estado: z.string().min(2, 'O estado é obrigatório.'),
  cidade: z.string().min(2, 'A cidade é obrigatória.'),
  
  area_total_hectares: z.preprocess(
    (val) => String(val).replace(',', '.'),
    z.coerce.number({ invalid_type_error: 'A área deve ser um número.' }).positive('A área total deve ser positiva.')
  ),
  area_pastagem_hectares: z.preprocess(
    (val) => String(val).replace(',', '.'),
    z.coerce.number({ invalid_type_error: 'A área deve ser um número.' }).optional().nullable()
  ),
  area_lavoura_hectares: z.preprocess(
    (val) => String(val).replace(',', '.'),
    z.coerce.number({ invalid_type_error: 'A área deve ser um número.' }).optional().nullable()
  ),
  area_reserva_hectares: z.preprocess(
    (val) => String(val).replace(',', '.'),
    z.coerce.number({ invalid_type_error: 'A área deve ser um número.' }).optional().nullable()
  ),

  descricao: z.string().optional(),
  benfeitorias: z.string().optional(),
  tipo_solo: z.string().optional(),
  topografia: z.string().optional(),
  
  // Checkboxes
  possui_casa_sede: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  possui_curral: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  possui_recursos_hidricos: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),

  // O campo 'terms_agreed' vem como string "true" do FormData
  terms_agreed: z.literal("true", {
      errorMap: () => ({ message: "Você deve aceitar os termos e condições." }),
  }),
});

