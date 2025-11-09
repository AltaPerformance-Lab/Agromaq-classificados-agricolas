import { z } from 'zod';

// Schema para validar um único bloco de conteúdo do Editor.js
const BlockSchema = z.object({
    id: z.string(),
    type: z.string(),
    data: z.record(z.any()), // Os dados dentro de um bloco podem ter qualquer formato
});

// Schema para validar a estrutura completa do conteúdo do Editor.js
const ContentSchema = z.object({
    time: z.number(),
    blocks: z.array(BlockSchema),
    version: z.string(),
});


// Schema principal para a criação de um novo artigo
export const createPostSchema = z.object({
  title: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
  excerpt: z.string().min(10, 'O resumo deve ter pelo menos 10 caracteres.').max(200, 'O resumo não pode exceder 200 caracteres.'),
  // O conteúdo deve ser um objeto JSON válido e não pode estar vazio
  content: ContentSchema.refine(data => data.blocks.length > 0, {
    message: "O conteúdo do artigo não pode estar vazio.",
  }),
  status: z.enum(['DRAFT', 'PUBLISHED']), // O status deve ser um dos valores permitidos
});

