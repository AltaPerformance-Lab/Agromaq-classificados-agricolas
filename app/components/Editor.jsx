'use client';

import React, { useEffect, useRef } from 'react';

// Este componente só será carregado no lado do cliente
const Editor = ({ data, onChange }) => {
    const editorRef = useRef(null);

    useEffect(() => {
        // Evita a reinicialização do editor a cada renderização
        if (editorRef.current) {
            return;
        }

        const initEditor = async () => {
            const EditorJS = (await import('@editorjs/editorjs')).default;
            const Header = (await import('@editorjs/header')).default;
            const List = (await import('@editorjs/list')).default;
            const Quote = (await import('@editorjs/quote')).default;

            const editor = new EditorJS({
                holder: 'editorjs-container',
                data: data || undefined,
                
                // Ferramentas disponíveis no editor
                tools: {
                    header: {
                        class: Header,
                        inlineToolbar: true,
                        config: {
                            placeholder: 'Digite um Título',
                            levels: [2, 3, 4],
                            defaultLevel: 2
                        }
                    },
                    list: {
                        class: List,
                        inlineToolbar: true,
                    },
                    quote: {
                        class: Quote,
                        inlineToolbar: true,
                    }
                },

                // Callback que é chamado sempre que o conteúdo muda
                async onChange(api, event) {
                    const savedData = await api.saver.save();
                    onChange(savedData);
                },

                // Configurações de internacionalização
                i18n: {
                    messages: {
                        toolNames: {
                            "Text": "Parágrafo",
                            "Heading": "Título",
                            "List": "Lista",
                            "Quote": "Citação",
                        },
                         blockTunes: {
                            "delete": {
                                "Delete": "Apagar"
                            },
                            "moveUp": {
                                "Move up": "Mover para cima"
                            },
                            "moveDown": {
                                "Move down": "Mover para baixo"
                            }
                        },
                    }
                }
            });
            editorRef.current = editor;
        };

        initEditor();

        // Limpa a instância do editor quando o componente é desmontado
        return () => {
            if (editorRef.current && editorRef.current.destroy) {
                editorRef.current.destroy();
                editorRef.current = null;
            }
        };
    }, [data, onChange]);

    return <div id="editorjs-container" className="prose prose-lg max-w-none" />;
};

export default Editor;
