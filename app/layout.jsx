import './globals.css';
import AuthProvider from './components/AuthProvider';

export const metadata = {
  title: 'AgroMaq - Classificados de Máquinas e Fazendas',
  description: 'A sua plataforma completa para comprar e vender máquinas agrícolas, veículos pesados e imóveis rurais.',
};

// Este é o layout raiz. Ele NÃO deve conter a Navbar ou os Filtros.
export default function RootLayout({ children }) {
    return (
        <html lang="pt-BR">
            <body className="min-h-screen bg-gray-50">
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

