
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog';

interface TripItem {
  id: string;
  name: string;
  date: string;
  amount: number;
  paid: boolean;
  details?: any;
}

interface Trip {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes: string;
  flights: TripItem[];
  hotels: TripItem[];
  activities: TripItem[];
  restaurants: TripItem[];
}

const ItemCard = ({ item, onEdit, onDelete, type }: { item: TripItem; onEdit: () => void; onDelete: () => void; type: string }) => (
  <Card>
    <CardContent className="p-4 space-y-2">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-500">{format(new Date(item.date), 'dd/MM/yyyy')}</p>
        </div>
        <Badge variant={item.paid ? "default" : "secondary"}>
          {item.paid ? "Pago" : "A pagar"}
        </Badge>
      </div>
      <p className="text-lg font-semibold">R$ {item.amount.toFixed(2)}</p>
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
  const [filter, setFilter] = useState<'all' | 'paid' | 'pending'>('all');

  const calculateTotals = () => {
    if (!trip) return { flights: 0, hotels: 0, activities: 0, restaurants: 0, total: 0 };
    
    const totals = {
      flights: trip.flights.reduce((sum, item) => sum + item.amount, 0),
      hotels: trip.hotels.reduce((sum, item) => sum + item.amount, 0),
      activities: trip.activities.reduce((sum, item) => sum + item.amount, 0),
      restaurants: trip.restaurants.reduce((sum, item) => sum + item.amount, 0)
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

          <Tabs defaultValue="flights">
            <TabsList>
              <TabsTrigger value="flights">✈️ Voos</TabsTrigger>
              <TabsTrigger value="hotels">🏨 Hotéis</TabsTrigger>
              <TabsTrigger value="activities">🎡 Passeios</TabsTrigger>
              <TabsTrigger value="restaurants">🍽️ Restaurantes</TabsTrigger>
            </TabsList>

            <TabsContent value="flights" className="space-y-4">
              <Button>Adicionar Voo</Button>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {trip.flights.map(flight => (
                  <ItemCard 
                    key={flight.id} 
                    item={flight} 
                    type="flight"
                    onEdit={() => {}} 
                    onDelete={() => {}}
                  />
                ))}
              </div>
            </TabsContent>

            {/* Similar TabsContent for hotels, activities, and restaurants */}
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
    </div>
  );
};

export default TripDetailsPage;
