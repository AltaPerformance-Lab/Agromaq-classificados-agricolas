import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { z } from 'zod';
import { unlink, mkdir } from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

// Função para criar um slug amigável para SEO
function slugify(text) {
    const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
    const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
    const p = new RegExp(a.split('').join('|'), 'g')
    return text.toString().toLowerCase().replace(/\s+/g, '-').replace(p, c => b.charAt(a.indexOf(c))).replace(/&/g, '-e-').replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-').replace(/^-+/, '').replace(/-+$/, '')
}

// Schema de validação para os dados recebidos do formulário
const updateSchema = z.object({
    titulo: z.string().min(5, 'O título deve ter pelo menos 5 caracteres.'),
    preco: z.string().transform(v => BigInt(v.replace(/\D/g, ''))),
    descricao: z.string().optional(),
    benfeitorias: z.string().optional(),
    area_total_hectares: z.coerce.number().optional(),
    area_lavoura_hectares: z.coerce.number().optional().nullable(),
    area_pastagem_hectares: z.coerce.number().optional().nullable(),
    area_reserva_hectares: z.coerce.number().optional().nullable(),
    tipo_solo: z.string().optional(),
    topografia: z.string().optional(),
    possui_casa_sede: z.preprocess((val) => val === 'true', z.boolean()),
    possui_curral: z.preprocess((val) => val === 'true', z.boolean()),
    possui_recursos_hidricos: z.preprocess((val) => val === 'true', z.boolean()),
});


export async function PUT(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Não autorizado' }, { status: 401 });
    }

    const { slug } = params;
    const anuncio = await prisma.anuncioFazenda.findUnique({ where: { slug } });

    // Camada de segurança: Verifica se o anúncio existe e se pertence ao utilizador logado
    if (!anuncio || anuncio.userId !== parseInt(session.user.id)) {
        return NextResponse.json({ message: 'Anúncio não encontrado ou não autorizado' }, { status: 404 });
    }

    try {
        const formData = await request.formData();
        const body = Object.fromEntries(formData.entries());
        const newFiles = formData.getAll('newImages');
        const imagesToDelete = JSON.parse(formData.get('imagesToDelete') || '[]');

        const validation = updateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const dataToUpdate = validation.data;

        // Gerar novo slug se o título foi alterado
        if (dataToUpdate.titulo && dataToUpdate.titulo !== anuncio.titulo) {
            let newSlug = slugify(dataToUpdate.titulo);
            const count = await prisma.anuncioFazenda.count({ where: { slug: { startsWith: newSlug }, id: { not: anuncio.id } } });
            if (count > 0) {
                newSlug = `${newSlug}-${count + 1}`;
            }
            dataToUpdate.slug = newSlug;
        }

        // Apagar imagens marcadas para exclusão
        if (imagesToDelete.length > 0) {
            const images = await prisma.anuncioImagemFazenda.findMany({ where: { id: { in: imagesToDelete }, anuncioId: anuncio.id } });
            for (const image of images) {
                await unlink(path.join(process.cwd(), 'public', image.url)).catch(e => console.error("Falha ao apagar ficheiro:", e.message));
                await unlink(path.join(process.cwd(), 'public', image.thumbnailUrl)).catch(e => console.error("Falha ao apagar thumbnail:", e.message));
            }
            await prisma.anuncioImagemFazenda.deleteMany({ where: { id: { in: imagesToDelete } } });
        }

        // Adicionar novas imagens
        const processedImages = [];
        if (newFiles.length > 0 && newFiles[0].size > 0) {
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            await mkdir(uploadDir, { recursive: true });

            for (const file of newFiles) {
                const buffer = Buffer.from(await file.arrayBuffer());
                const uniqueSuffix = crypto.randomBytes(16).toString('hex');
                const imageName = `fazenda_${uniqueSuffix}.webp`;
                const thumbName = `fazenda_${uniqueSuffix}_thumb.webp`;
                await sharp(buffer).resize(1024, 768, { fit: 'inside' }).toFormat('webp').toFile(path.join(uploadDir, imageName));
                await sharp(buffer).resize(400, 300, { fit: 'cover' }).toFormat('webp').toFile(path.join(uploadDir, thumbName));
                processedImages.push({ url: `/uploads/${imageName}`, thumbnailUrl: `/uploads/${thumbName}` });
            }
        }

        // Executar a atualização e a criação do log numa transação
        const [updatedAnuncio] = await prisma.$transaction([
            prisma.anuncioFazenda.update({
                where: { id: anuncio.id },
                data: {
                    ...dataToUpdate,
                    ...(processedImages.length > 0 && {
                        imagens: { create: processedImages }
                    })
                },
            }),
            prisma.activityLog.create({
                data: {
                    action: 'EDIT_AD',
                    actorId: parseInt(session.user.id),
                    actorName: session.user.name || 'Utilizador',
                    targetType: 'AnuncioFazenda',
                    targetId: anuncio.id.toString(),
                    details: {
                        slug: dataToUpdate.slug || anuncio.slug,
                        message: `Utilizador editou o anúncio de fazenda "${dataToUpdate.titulo || anuncio.titulo}".`
                    }
                }
            })
        ]);

        return NextResponse.json(updatedAnuncio);

    } catch (error) {
        console.error("Erro ao atualizar anúncio de fazenda:", error);
        return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
    }
}

