import { z } from 'zod';

// Schema para a ATUALIZAÇÃO de um anúncio de fazenda.
export const updateAnuncioFazendaSchema = z.object({
  titulo: z.string().min(1, 'O título é obrigatório.').optional(),
  
  // SOLUÇÃO DEFINITIVA:
  // Recebe a string formatada (ex: 'R$ 5.000.000,00'),
  // remove tudo o que não for dígito e converte diretamente para um número inteiro.
  preco: z.string()
    .refine(value => value.trim() !== '' && value !== 'R$ 0,00', { message: 'O preço é obrigatório.' })
    .transform(value => {
      // 1. Remove caracteres não numéricos: "R$ 5.000.000,00" -> "500000000"
      const onlyDigits = value.replace(/\D/g, '');
      if (!onlyDigits) return 0;
      
      // 2. Converte a string de dígitos para o número inteiro correto.
      return parseInt(onlyDigits, 10);
    }).optional(),

  descricao: z.string().optional(),
  benfeitorias: z.string().optional(),
});

