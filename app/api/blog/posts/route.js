import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createPostSchema } from '@/lib/schemas/createPostSchema';
import { mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

// Função para criar um slug amigável para SEO
function slugify(text) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(p, c => b.charAt(a.indexOf(c)))
        .replace(/&/g, '-e-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '')
}

export async function POST(request) {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || session.user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Acesso negado.' }, { status: 403 });
    }

    try {
        const formData = await request.formData();
        const body = Object.fromEntries(formData.entries());
        const imageFile = formData.get('imageUrl');

        // O conteúdo do Editor.js chega como uma string JSON, por isso precisamos de o analisar (parse)
        let contentJson;
        try {
            contentJson = JSON.parse(body.content);
        } catch (error) {
            return NextResponse.json({ errors: { content: ['Formato de conteúdo inválido.'] } }, { status: 400 });
        }
        
        // Juntamos os dados analisados para a validação com o Zod
        const dataToValidate = { ...body, content: contentJson };
        
        const validation = createPostSchema.safeParse(dataToValidate);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        if (!imageFile || imageFile.size === 0) {
            return NextResponse.json({ errors: { imageUrl: ['A imagem de capa é obrigatória.'] } }, { status: 400 });
        }

        const { title, excerpt, status, content } = validation.data;

        // A lógica de processamento de imagem permanece a mesma
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'blog');
        await mkdir(uploadDir, { recursive: true });
        const buffer = Buffer.from(await imageFile.arrayBuffer());
        const uniqueSuffix = crypto.randomBytes(16).toString('hex');
        const imageName = `post_${uniqueSuffix}.webp`;
        await sharp(buffer).resize(1200, 630, { fit: 'cover' }).toFormat('webp', { quality: 80 }).toFile(path.join(uploadDir, imageName));
        const imageUrl = `/uploads/blog/${imageName}`;

        // A lógica de criação de slug permanece a mesma
        let slug = slugify(title);
        const count = await prisma.post.count({ where: { slug: { startsWith: slug } } });
        if (count > 0) slug = `${slug}-${count + 1}`;
        
        // Guardamos o novo artigo na base de dados
        const newPost = await prisma.post.create({
            data: {
                title,
                slug,
                excerpt,
                content, // O conteúdo já está no formato JSON correto para a base de dados
                imageUrl,
                status,
                publishedAt: status === 'PUBLISHED' ? new Date() : null,
                authorId: parseInt(session.user.id, 10),
            },
        });

        return NextResponse.json(newPost, { status: 201 });

    } catch (error) {
        console.error("Erro ao criar artigo:", error);
        return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
    }
}

