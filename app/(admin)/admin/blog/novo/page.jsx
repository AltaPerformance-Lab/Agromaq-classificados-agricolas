'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
// Importamos o nosso novo editor de forma dinâmica para otimizar o carregamento
import dynamic from 'next/dynamic';
const Editor = dynamic(() => import('@/app/components/Editor'), { ssr: false });

const InputField = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500" {...props} />
    </div>
);

export default function NewPostPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    
    const [title, setTitle] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [content, setContent] = useState(null); // O conteúdo agora é um objeto JSON
    const [image, setImage] = useState(null);
    const [postStatus, setPostStatus] = useState('DRAFT');
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});

    if (status === 'loading') return <p className="text-center p-8">A carregar...</p>;
    if (status === 'unauthenticated' || (status === 'authenticated' && session.user.role !== 'ADMIN')) {
        router.replace('/login');
        return null;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrors({});

        const formData = new FormData();
        formData.append('title', title);
        formData.append('excerpt', excerpt);
        // O conteúdo do editor (JSON) é convertido para uma string para ser enviado
        formData.append('content', JSON.stringify(content));
        formData.append('status', postStatus);
        if (image) {
            formData.append('imageUrl', image);
        }

        try {
            const response = await fetch('/api/blog/posts', {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                setErrors(result.errors || { form: 'Ocorreu um erro no servidor.' });
            } else {
                alert('Artigo criado com sucesso!');
                router.push('/admin/dashboard');
                router.refresh();
            }
        } catch (error) {
            setErrors({ form: 'Não foi possível conectar ao servidor.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-sm">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Criar Novo Artigo</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                <InputField label="Título do Artigo" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
                {errors.title && <p className="text-red-500 text-sm">{errors.title[0]}</p>}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Resumo (Excerpt)</label>
                    <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} required className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-yellow-500 focus:border-yellow-500" rows="3"></textarea>
                    {errors.excerpt && <p className="text-red-500 text-sm">{errors.excerpt[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa</label>
                    <input type="file" onChange={(e) => setImage(e.target.files[0])} required accept="image/*" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-50 file:text-yellow-700 hover:file:bg-yellow-100"/>
                    {errors.imageUrl && <p className="text-red-500 text-sm">{errors.imageUrl[0]}</p>}
                </div>
                
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo do Artigo</label>
                     <div className="bg-white border border-gray-300 rounded-md p-4 min-h-[400px]">
                        <Editor data={content} onChange={setContent} />
                     </div>
                     {errors.content && <p className="text-red-500 text-sm mt-2">{errors.content[0]}</p>}
                </div>

                <div className="flex items-center justify-between pt-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
                        <select id="status" value={postStatus} onChange={(e) => setPostStatus(e.target.value)} className="mt-1 p-2 border border-gray-300 rounded-md">
                            <option value="DRAFT">Rascunho</option>
                            <option value="PUBLISHED">Publicado</option>
                        </select>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="bg-yellow-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition duration-300 disabled:opacity-50">
                        {isSubmitting ? 'A Guardar...' : 'Guardar Artigo'}
                    </button>
                </div>
                 {errors.form && <p className="text-red-500 text-sm text-center">{errors.form}</p>}
            </form>
        </div>
    );
}

