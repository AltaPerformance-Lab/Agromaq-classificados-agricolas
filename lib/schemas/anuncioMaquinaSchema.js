import { z } from 'zod';

// Este é o schema para a CRIAÇÃO de um anúncio de máquina.
// Ele transforma os dados do formulário (que chegam como strings) para os tipos
// corretos que a base de dados espera (BigInt, Int, Boolean).
export const createAnuncioMaquinaSchema = z.object({
  nome: z.string().min(3, { message: 'O nome do anúncio deve ter pelo menos 3 caracteres.' }),
  
  // Lógica CORRIGIDA: Converte a string "R$ 150.000,00" para o BigInt 15000000n
  preco: z.string()
    .min(1, { message: 'O preço é obrigatório.' })
    .transform(value => {
      const onlyDigits = value.replace(/\D/g, '');
      return onlyDigits ? BigInt(onlyDigits) : BigInt(0);
    }),

  tipo: z.string().min(1, { message: 'Por favor, selecione um tipo.' }),
  marca: z.string().min(1, { message: 'Por favor, selecione uma marca.' }),
  
  // Converte a string do ano para um número inteiro
  ano: z.string()
    .min(4, { message: 'Por favor, selecione um ano válido.' })
    .transform(val => parseInt(val, 10)),
  
  // Converte a string de horas para um número inteiro
  horas: z.string()
    .min(1, { message: 'As horas de uso são obrigatórias.' })
    .transform(val => parseInt(val.replace(/\D/g, ''), 10)),

  estado: z.string().min(2, { message: 'Por favor, selecione um estado.' }),
  cidade: z.string().min(1, { message: 'Por favor, selecione uma cidade.' }),
  
  // Campos opcionais
  descricao: z.string().optional(),
  informacoes_adicionais: z.string().optional(),
  condicao: z.string().optional(),
  potencia_motor: z.string().optional(),
  transmissao: z.string().optional(),
  tracao: z.string().optional(),
  cabine: z.string().optional(),
  operacao_previa: z.string().optional(),
  condicao_pneus: z.string().optional(),
  pneus_dianteiros: z.string().optional(),
  pneus_traseiros: z.string().optional(),
  
  // Lógica unificada para booleanos
  ar_condicionado: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  lamina_frontal: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  carregador_frontal: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  gps: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  piloto_automatico: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),
  unico_dono: z.preprocess((val) => val === 'true' || val === true, z.boolean().optional()),

  // O campo 'terms_agreed' vem como string "true" do FormData
  terms_agreed: z.literal("true", {
      errorMap: () => ({ message: "Você deve aceitar os termos e condições." }),
  }),
});
