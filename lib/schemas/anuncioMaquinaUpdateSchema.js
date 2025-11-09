import { z } from 'zod';

// Pré-processadores para limpar e converter os dados
const stringToNumber = (val) => (val !== null && val !== undefined && val !== '') ? parseInt(String(val).replace(/\D/g, ''), 10) : undefined;
const stringToBoolean = (val) => val === 'true';

export const updateAnuncioMaquinaSchema = z.object({
  nome: z.string().min(5, 'O nome/modelo deve ter pelo menos 5 caracteres.').optional(),
  
  // Lógica CORRIGIDA para converter a string de moeda para um número inteiro em centavos.
  preco: z.string()
    .refine(value => value.trim() !== '' && value !== 'R$ 0,00', { message: 'O preço é obrigatório.' })
    .transform(value => {
      // 1. Remove tudo o que não for dígito. "R$ 150.000,00" -> "15000000"
      const onlyDigits = value.replace(/\D/g, '');
      if (!onlyDigits) return 0;
      
      // 2. Converte a string de dígitos diretamente para um número inteiro.
      return parseInt(onlyDigits, 10);
    }).optional(),

  tipo: z.string().min(1, 'Selecione um tipo.').optional(),
  marca: z.string().min(1, 'Selecione uma marca.').optional(),
  ano: z.preprocess(
    (val) => stringToNumber(val), 
    z.number().gte(1950, 'O ano deve ser igual ou superior a 1950.').lte(new Date().getFullYear(), 'O ano não pode ser no futuro.').optional()
  ),
  horas: z.preprocess(
    (val) => stringToNumber(val), 
    z.number().int('As horas de uso devem ser um número inteiro.').optional()
  ),

  descricao: z.string().optional(),
  informacoes_adicionais: z.string().optional(),
  
  ar_condicionado: z.preprocess(stringToBoolean, z.boolean().optional()),
  lamina_frontal: z.preprocess(stringToBoolean, z.boolean().optional()),
  carregador_frontal: z.preprocess(stringToBoolean, z.boolean().optional()),
  gps: z.preprocess(stringToBoolean, z.boolean().optional()),
  piloto_automatico: z.preprocess(stringToBoolean, z.boolean().optional()),
  unico_dono: z.preprocess(stringToBoolean, z.boolean().optional()),
});
