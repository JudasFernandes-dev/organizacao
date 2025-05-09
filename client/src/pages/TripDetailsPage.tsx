import React, { useState } from 'react';
import { useParams } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface TripItem {
  id: string;
  type: 'flight' | 'hotel' | 'activity' | 'restaurant';
  name: string;
  date: string;
  amount: number;
  paid: boolean;
  details?: {
    airline?: string;
    flightNumber?: string;
    checkIn?: string;
    checkOut?: string;
    location?: string;
    notes?: string;
  };
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  items: TripItem[];
}

const ItemCard = ({ item, onEdit, onDelete }: { item: TripItem; onEdit: () => void; onDelete: () => void }) => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500">{format(new Date(item.date), 'dd/MM/yyyy')}</p>
        </div>
        <Badge variant={item.paid ? "default" : "destructive"}>
          {item.paid ? "Pago" : "A pagar"}
        </Badge>
      </div>
      <p className="text-lg font-semibold">R$ {item.amount.toFixed(2)}</p>
      {item.details && (
        <div className="text-sm text-gray-600">
          {item.type === 'flight' && (
            <>
              <p>Companhia: {item.details.airline}</p>
              <p>Voo: {item.details.flightNumber}</p>
            </>
          )}
          {item.type === 'hotel' && (
            <>
              <p>Check-in: {format(new Date(item.details.checkIn!), 'dd/MM/yyyy')}</p>
              <p>Check-out: {format(new Date(item.details.checkOut!), 'dd/MM/yyyy')}</p>
              <p>Local: {item.details.location}</p>
            </>
          )}
          {(item.type === 'activity' || item.type === 'restaurant') && item.details.notes && (
            <p>Observações: {item.details.notes}</p>
          )}
        </div>
      )}
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onEdit}>Editar</Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">Excluir</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja excluir este item? Esta ação não pode ser desfeita.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Confirmar</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </CardContent>
  </Card>
);

const TripDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedTab, setSelectedTab] = useState('flights');
  const [itemType, setItemType] = useState<TripItem['type']>('flight');

  const calculateTotals = () => {
    if (!trip) return { flights: 0, hotels: 0, activities: 0, restaurants: 0, total: 0 };

    const totals = {
      flights: trip.items.filter(i => i.type === 'flight').reduce((sum, i) => sum + i.amount, 0),
      hotels: trip.items.filter(i => i.type === 'hotel').reduce((sum, i) => sum + i.amount, 0),
      activities: trip.items.filter(i => i.type === 'activity').reduce((sum, i) => sum + i.amount, 0),
      restaurants: trip.items.filter(i => i.type === 'restaurant').reduce((sum, i) => sum + i.amount, 0)
    };

    return {
      ...totals,
      total: Object.values(totals).reduce((sum, value) => sum + value, 0)
    };
  };

  const totals = calculateTotals();
  const difference = trip ? trip.budget - totals.total : 0;

  return (
    <div className="space-y-6">
      {trip && (
        <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">{trip.name}</h2>
              <p className="text-gray-500">
                {format(new Date(trip.startDate), 'dd/MM/yyyy')} - {format(new Date(trip.endDate), 'dd/MM/yyyy')}
              </p>
            </div>
            <Badge variant={difference >= 0 ? "default" : "destructive"} className="text-lg">
              {difference >= 0 ? "Dentro do orçamento" : "Acima do orçamento"}
            </Badge>
          </div>

          <Tabs defaultValue="flights" onValueChange={(value) => setSelectedTab(value)}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="flights">✈️ Voos</TabsTrigger>
              <TabsTrigger value="hotels">🏨 Hotéis</TabsTrigger>
              <TabsTrigger value="activities">🎡 Passeios</TabsTrigger>
              <TabsTrigger value="restaurants">🍽️ Restaurantes</TabsTrigger>
            </TabsList>

            {['flights', 'hotels', 'activities', 'restaurants'].map(tabValue => (
              <TabsContent key={tabValue} value={tabValue} className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-semibold">
                    {tabValue === 'flights' && 'Voos'}
                    {tabValue === 'hotels' && 'Hotéis'}
                    {tabValue === 'activities' && 'Passeios'}
                    {tabValue === 'restaurants' && 'Restaurantes'}
                  </h3>
                  <Button onClick={() => {
                    setItemType(tabValue.slice(0, -1) as TripItem['type']);
                    setShowAddItem(true);
                  }}>
                    Adicionar
                  </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {trip.items
                    .filter(item => item.type === tabValue.slice(0, -1))
                    .map(item => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onEdit={() => {}}
                        onDelete={() => {}}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Financeiro</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Total Voos</p>
                  <p className="text-lg font-semibold">R$ {totals.flights.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Hotéis</p>
                  <p className="text-lg font-semibold">R$ {totals.hotels.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Passeios</p>
                  <p className="text-lg font-semibold">R$ {totals.activities.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Restaurantes</p>
                  <p className="text-lg font-semibold">R$ {totals.restaurants.toFixed(2)}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Geral</p>
                    <p className="text-xl font-bold">R$ {totals.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Diferença do Orçamento</p>
                    <p className={`text-xl font-bold ${difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {Math.abs(difference).toFixed(2)} {difference >= 0 ? 'abaixo' : 'acima'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar {
              itemType === 'flight' ? 'Voo' :
              itemType === 'hotel' ? 'Hotel' :
              itemType === 'activity' ? 'Passeio' :
              'Restaurante'
            }</DialogTitle>
          </DialogHeader>
          <form className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" />
            </div>
            <div className="space-y-2">
              <Label>Valor</Label>
              <Input type="number" step="0.01" />
            </div>
            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TripDetailsPage;