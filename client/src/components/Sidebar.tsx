import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Wallet, 
  BarChart3, 
  Calendar, 
  PieChart,
  Settings,
  User,
  X,
  Plus
} from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const [location] = useLocation();
  
  const navItems = [
    { name: 'Painel', icon: <Home size={18} />, path: '/' },
    { name: 'Contas', icon: <Wallet size={18} />, path: '/contas' },
    { name: 'Transações', icon: <BarChart3 size={18} />, path: '/transacoes' },
    { name: 'Planejamento', icon: <Calendar size={18} />, path: '/planejamento' },
    { name: 'Relatórios', icon: <PieChart size={18} />, path: '/relatorios' },
  ];
  
  const configItems = [
    { name: 'Preferências', icon: <Settings size={18} />, path: '/preferencias' },
    { name: 'Perfil', icon: <User size={18} />, path: '/perfil' },
  ];
  
  return (
    <div 
      className={`bg-primary text-white flex-shrink-0 transition-all duration-300 ease-in-out h-full overflow-y-auto z-10 ${
        isOpen ? 'w-64' : 'w-16'
      } fixed md:relative`}
    >
      <div className="p-4 flex items-center justify-between">
        {isOpen ? (
          <div className="text-xl font-bold">FinApp</div>
        ) : (
          <div className="text-xl font-bold w-8 h-8"></div>
        )}
        <button 
          onClick={toggleSidebar}
          className="md:hidden text-white focus:outline-none"
        >
          <X size={18} />
        </button>
      </div>
      
      {isOpen ? (
        <div className="px-4 py-2">
          <Button className="w-full bg-secondary text-white hover:bg-secondary/90">
            <Plus size={18} className="mr-2" />
            Novo
          </Button>
        </div>
      ) : (
        <div className="px-2 py-2">
          <Button className="w-10 h-10 p-0 bg-secondary text-white hover:bg-secondary/90">
            <Plus size={18} />
          </Button>
        </div>
      )}
      
      <nav className="mt-6">
        {isOpen && (
          <div className="px-4 py-2 text-xs uppercase tracking-wider text-purple-200">
            Principal
          </div>
        )}
        
        {navItems.map((item) => (
          <a 
            key={item.name}
            href={item.path} 
            className={`sidebar-item ${location === item.path ? 'active' : ''} ${!isOpen ? 'justify-center' : ''}`}
            title={!isOpen ? item.name : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {isOpen && <span className="ml-3">{item.name}</span>}
          </a>
        ))}
        
        {isOpen && (
          <div className="mt-4 px-4 py-2 text-xs uppercase tracking-wider text-purple-200">
            Configurações
          </div>
        )}
        
        {configItems.map((item) => (
          <a 
            key={item.name}
            href={item.path} 
            className={`sidebar-item ${location === item.path ? 'active' : ''} ${!isOpen ? 'justify-center' : ''}`}
            title={!isOpen ? item.name : ''}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {isOpen && <span className="ml-3">{item.name}</span>}
          </a>
        ))}
      </nav>
    </div>
  );
}
