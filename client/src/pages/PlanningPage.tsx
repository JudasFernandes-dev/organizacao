
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface TravelItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant';
  name: string;
  date?: string;
  checkIn?: string;
  checkOut?: string;
  amount: number;
  paid: boolean;
  details?: any;
}

interface Travel {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  items: TravelItem[];
}

const PlanningPage: React.FC = () => {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const calculateTotals = (travel: Travel) => {
    const totals = {
      flights: 0,
      hotels: 0,
      activities: 0,
      restaurants: 0,
      total: 0,
      paid: 0,
      pending: 0
    };

    travel.items.forEach(item => {
      totals[`${item.type}s`] += item.amount;
      totals.total += item.amount;
      if (item.paid) {
        totals.paid += item.amount;
      } else {
        totals.pending += item.amount;
      }
    });

    return totals;
  };

  const handleAddTravel = (newTravel: Travel) => {
    setTravels(prev => [...prev, { ...newTravel, id: Date.now().toString(), items: [] }]);
  };

  const handleDeleteTravel = (id: string) => {
    setTravels(prev => prev.filter(t => t.id !== id));
  };

  const handleAddItem = (travelId: string, item: TravelItem) => {
    setTravels(prev => prev.map(travel => {
      if (travel.id === travelId) {
        return {
          ...travel,
          items: [...travel.items, { ...item, id: Date.now().toString() }]
        };
      }
      return travel;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Planejamento de Viagens</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Adicionar Nova Viagem</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Viagem</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              handleAddTravel({
                id: '',
                name: formData.get('name') as string,
                startDate: formData.get('startDate') as string,
                endDate: formData.get('endDate') as string,
                budget: Number(formData.get('budget')),
                notes: formData.get('notes') as string,
                items: []
              });
            }}>
              <div className="space-y-2">
                <label>Nome da Viagem</label>
                <Input name="name" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Data Início</label>
                  <Input type="date" name="startDate" required />
                </div>
                <div className="space-y-2">
                  <label>Data Fim</label>
                  <Input type="date" name="endDate" required />
                </div>
              </div>
              <div className="space-y-2">
                <label>Orçamento Previsto</label>
                <Input type="number" name="budget" required />
              </div>
              <div className="space-y-2">
                <label>Observações</label>
                <Textarea name="notes" />
              </div>
              <Button type="submit">Salvar</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {travels.map(travel => {
          const totals = calculateTotals(travel);
          return (
            <Card key={travel.id}>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{travel.name}</h3>
                    <p className="text-sm text-gray-500">
                      {format(new Date(travel.startDate), 'dd/MM/yyyy')} - {format(new Date(travel.endDate), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <Badge variant={totals.total <= travel.budget ? "default" : "destructive"}>
                    R$ {totals.total.toFixed(2)}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => {
                    setSelectedTravel(travel);
                    setShowDetails(true);
                  }}>Ver Detalhes</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Excluir</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir esta viagem? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDeleteTravel(travel.id)}>
                          Confirmar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showDetails && selectedTravel && (
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedTravel.name} - Detalhes</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Orçamento Previsto</h4>
                  <p>R$ {selectedTravel.budget.toFixed(2)}</p>
                </div>
                <div>
                  <h4 className="font-semibold">Gasto Real</h4>
                  <p>R$ {calculateTotals(selectedTravel).total.toFixed(2)}</p>
                </div>
              </div>

              {/* Seções de itens aqui */}
              <div className="space-y-4">
                <h4 className="font-semibold">Voos</h4>
                {/* Lista de voos */}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Hotéis</h4>
                {/* Lista de hotéis */}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Passeios</h4>
                {/* Lista de passeios */}
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Restaurantes</h4>
                {/* Lista de restaurantes */}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default PlanningPage;
