import { Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

type HeaderProps = {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
};

export default function Header({ toggleSidebar, isSidebarOpen }: HeaderProps) {
  const [location] = useLocation();
  const [pageTitle, setPageTitle] = useState('Painel');

  useEffect(() => {
    // Atualiza o título da página com base na rota atual
    switch (location) {
      case '/':
        setPageTitle('Painel');
        break;
      case '/contas':
        setPageTitle('Contas');
        break;
      case '/transacoes':
        setPageTitle('Transações');
        break;
      case '/relatorios':
        setPageTitle('Relatórios');
        break;
      case '/planejamento':
        setPageTitle('Planejamento');
        break;
      default:
        setPageTitle('Painel');
    }
  }, [location]);

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm py-3 px-4 flex items-center justify-between">
      <div className="flex items-center">
        <Button 
          onClick={toggleSidebar}
          variant="outline"
          size="sm"
          className="mr-4 border border-gray-200 text-gray-800 hover:bg-gray-100"
        >
          {isSidebarOpen ? 'Ocultar' : 'Menu'}
        </Button>
        <h1 className="text-xl font-semibold text-gray-800">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <button className="text-gray-600 focus:outline-none">
            <Bell size={20} />
          </button>
          <span className="absolute top-0 right-0 -mt-1 -mr-1 h-3 w-3 bg-red-500 rounded-full"></span>
        </div>
        
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <span className="ml-2 text-sm font-medium text-gray-700">Olá, Usuário</span>
        </div>
      </div>
    </header>
  );
}
