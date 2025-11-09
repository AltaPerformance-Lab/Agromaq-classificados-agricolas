import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { createAnuncioMaquinaSchema } from '@/lib/schemas/createAnuncioMaquinaSchema';
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

    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    try {
        const formData = await request.formData();
        
        const body = Object.fromEntries(formData.entries());
        const files = formData.getAll('imagens');

        if (files.length === 0 || files[0].size === 0) {
            return NextResponse.json({ errors: { imagens: ['É obrigatório enviar pelo menos uma foto.'] } }, { status: 400 });
        }

        const validation = createAnuncioMaquinaSchema.safeParse(body);
        if (!validation.success) {
          return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { terms_agreed, ...dataToSave } = validation.data;

        let slug = slugify(dataToSave.nome);
        const count = await prisma.anuncioMaquina.count({ where: { slug: { startsWith: slug } } });
        if (count > 0) {
          slug = `${slug}-${count + 1}`;
        }

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        const imagePromises = files.map(async (file, index) => {
            const buffer = Buffer.from(await file.arrayBuffer());
            const uniqueSuffix = crypto.randomBytes(16).toString('hex');
            
            const imageName = `maquina_${uniqueSuffix}.webp`;
            const thumbName = `maquina_${uniqueSuffix}_thumb.webp`;

            await sharp(buffer).resize(1024, 768, { fit: 'inside', withoutEnlargement: true }).toFormat('webp', { quality: 80 }).toFile(path.join(uploadDir, imageName));
            await sharp(buffer).resize(200, 200, { fit: 'cover' }).toFormat('webp', { quality: 80 }).toFile(path.join(uploadDir, thumbName));

            return {
                url: `/uploads/${imageName}`,
                thumbnailUrl: `/uploads/${thumbName}`,
                isPrincipal: index === 0,
            };
        });

        const processedImages = await Promise.all(imagePromises);

        const novoAnuncio = await prisma.anuncioMaquina.create({
          data: {
            slug,
            userId: parseInt(session.user.id, 10),
            ...dataToSave,
            imagens: {
              create: processedImages,
            },
          },
        });

        return NextResponse.json(novoAnuncio, { status: 201 });

    } catch (error) {
        console.error("Erro ao criar anúncio de máquina:", error);
        if (error.code) { // Erros do Prisma
            return NextResponse.json({ error: `Erro na base de dados: ${error.meta?.cause || error.message}` }, { status: 500 });
        }
        return NextResponse.json({ error: 'Ocorreu um erro inesperado no servidor.' }, { status: 500 });
    }
}
