import { z } from 'zod';

// Converte strings vazias para undefined, para que os campos opcionais funcionem corretamente
const emptyStringToUndefined = z.literal('').transform(() => undefined);

// Schema base com campos comuns
const baseSchema = {
  preco: z.preprocess(
    (val) => (typeof val === 'string' ? val.replace(/\D/g, '') : val),
    z.string().refine((val) => val.length > 0, { message: "O preço é obrigatório." })
  ),
  cidade: z.string().min(1, "A cidade é obrigatória."),
  estado: z.string().min(2, "O estado é obrigatório."),
  descricao: z.string().optional(),
  informacoes_adicionais: z.string().optional(),
};

// Schema completo para Máquina, com todos os campos
export const editarMaquinaAdminSchema = z.object({
  ...baseSchema,
  nome: z.string().min(1, "O nome é obrigatório."),
  tipo: z.string().min(1, "O tipo é obrigatório."),
  marca: z.string().min(1, "A marca é obrigatória."),
  ano: z.coerce.number().int("O ano deve ser um número inteiro."),
  horas: z.coerce.number().int("As horas devem ser um número inteiro."),
  condicao: z.string().optional().or(emptyStringToUndefined),
  potencia_motor: z.string().optional().or(emptyStringToUndefined),
  transmissao: z.string().optional().or(emptyStringToUndefined),
  // Adicione aqui outros campos de AnuncioMaquina que são editáveis
});

// Schema completo para Fazenda, com todos os campos
export const editarFazendaAdminSchema = z.object({
  ...baseSchema,
  titulo: z.string().min(1, "O título é obrigatório."),
  area_total_hectares: z.coerce.number().positive("A área total deve ser um número positivo."),
  // Adicione aqui outros campos de AnuncioFazenda que são editáveis
});

// Schema para a API conseguir diferenciar os tipos
export const editarAnuncioApiSchema = z.discriminatedUnion("type", [
  editarMaquinaAdminSchema.extend({ type: z.literal("maquina") }),
  editarFazendaAdminSchema.extend({ type: z.literal("fazenda") }),
]);
