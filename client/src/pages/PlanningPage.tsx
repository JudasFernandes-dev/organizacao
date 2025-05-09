import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Hotel, Utensils, MapPin } from 'lucide-react';
import { Label } from '@/components/ui/label';

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
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemType, setItemType] = useState<'flight' | 'hotel' | 'activity' | 'restaurant'>('flight');

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
            <Button>Nova Viagem</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
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
            <Card key={travel.id} className="hover:shadow-lg transition-shadow">
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

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Orçamento</p>
                    <p className="font-medium">R$ {travel.budget.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Restante</p>
                    <p className="font-medium">R$ {(travel.budget - totals.total).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Pago</p>
                    <p className="font-medium text-green-600">R$ {totals.paid.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Pendente</p>
                    <p className="font-medium text-red-600">R$ {totals.pending.toFixed(2)}</p>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <Plane className="w-4 h-4 mx-auto mb-1" />
                      <p>R$ {totals.flights.toFixed(2)}</p>
                    </div>
                    <div>
                      <Hotel className="w-4 h-4 mx-auto mb-1" />
                      <p>R$ {totals.hotels.toFixed(2)}</p>
                    </div>
                    <div>
                      <MapPin className="w-4 h-4 mx-auto mb-1" />
                      <p>R$ {totals.activities.toFixed(2)}</p>
                    </div>
                    <div>
                      <Utensils className="w-4 h-4 mx-auto mb-1" />
                      <p>R$ {totals.restaurants.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => {
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
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="flights">Voos</TabsTrigger>
                <TabsTrigger value="hotels">Hotéis</TabsTrigger>
                <TabsTrigger value="activities">Passeios</TabsTrigger>
                <TabsTrigger value="restaurants">Restaurantes</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
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
                <div>
                  <h4 className="font-semibold">Observações</h4>
                  <p className="text-gray-600">{selectedTravel.notes}</p>
                </div>
              </TabsContent>

              <TabsContent value="flights" className="space-y-4">
                <Button onClick={() => {
                  setItemType('flight');
                  setShowAddItem(true);
                }}>
                  Adicionar Voo
                </Button>
                {selectedTravel.items
                  .filter(item => item.type === 'flight')
                  .map(flight => (
                    <Card key={flight.id}>
                      <CardContent className="p-4">
                        <h4>{flight.name}</h4>
                        <p>R$ {flight.amount.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="hotels" className="space-y-4">
                <Button onClick={() => {
                  setItemType('hotel');
                  setShowAddItem(true);
                }}>
                  Adicionar Hotel
                </Button>
                {selectedTravel.items
                  .filter(item => item.type === 'hotel')
                  .map(hotel => (
                    <Card key={hotel.id}>
                      <CardContent className="p-4">
                        <h4>{hotel.name}</h4>
                        <p>R$ {hotel.amount.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="activities" className="space-y-4">
                <Button onClick={() => {
                  setItemType('activity');
                  setShowAddItem(true);
                }}>
                  Adicionar Passeio
                </Button>
                {selectedTravel.items
                  .filter(item => item.type === 'activity')
                  .map(activity => (
                    <Card key={activity.id}>
                      <CardContent className="p-4">
                        <h4>{activity.name}</h4>
                        <p>R$ {activity.amount.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>

              <TabsContent value="restaurants" className="space-y-4">
                <Button onClick={() => {
                  setItemType('restaurant');
                  setShowAddItem(true);
                }}>
                  Adicionar Restaurante
                </Button>
                {selectedTravel.items
                  .filter(item => item.type === 'restaurant')
                  .map(restaurant => (
                    <Card key={restaurant.id}>
                      <CardContent className="p-4">
                        <h4>{restaurant.name}</h4>
                        <p>R$ {restaurant.amount.toFixed(2)}</p>
                      </CardContent>
                    </Card>
                  ))}
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar {itemType === 'flight' ? 'Voo' : itemType === 'hotel' ? 'Hotel' : itemType === 'activity' ? 'Passeio' : 'Restaurante'}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const newItem = {
              id: Date.now().toString(),
              type: itemType,
              name: formData.get('name') as string,
              amount: Number(formData.get('amount')),
              paid: false,
              date: formData.get('date') as string,
              details: {}
            };

            if (itemType === 'flight') {
              newItem.details = {
                airline: formData.get('airline'),
                flightNumber: formData.get('flightNumber'),
                departure: formData.get('departure'),
                arrival: formData.get('arrival'),
                departureTime: formData.get('departureTime'),
                arrivalTime: formData.get('arrivalTime')
              };
            } else if (itemType === 'hotel') {
              newItem.details = {
                checkIn: formData.get('checkIn'),
                checkOut: formData.get('checkOut'),
                address: formData.get('address'),
                roomType: formData.get('roomType'),
                guests: formData.get('guests')
              };
            } else if (itemType === 'activity') {
              newItem.details = {
                location: formData.get('location'),
                duration: formData.get('duration'),
                includesTransport: formData.get('includesTransport') === 'true',
                notes: formData.get('notes')
              };
            } else if (itemType === 'restaurant') {
              newItem.details = {
                cuisine: formData.get('cuisine'),
                reservationTime: formData.get('reservationTime'),
                people: formData.get('people'),
                address: formData.get('address')
              };
            }

            handleAddItem(selectedTravel.id, newItem);
            setShowAddItem(false);
          }}>
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input name="name" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" name="date" required />
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input type="number" step="0.01" name="amount" required />
              </div>
            </div>

            {itemType === 'flight' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Companhia Aérea</Label>
                    <Input name="airline" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Número do Voo</Label>
                    <Input name="flightNumber" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Origem</Label>
                    <Input name="departure" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Destino</Label>
                    <Input name="arrival" required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário Partida</Label>
                    <Input type="time" name="departureTime" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Horário Chegada</Label>
                    <Input type="time" name="arrivalTime" required />
                  </div>
                </div>
              </>
            )}

            {itemType === 'hotel' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Check-in</Label>
                    <Input type="date" name="checkIn" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Check-out</Label>
                    <Input type="date" name="checkOut" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input name="address" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Quarto</Label>
                    <Select name="roomType" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Solteiro</SelectItem>
                        <SelectItem value="double">Casal</SelectItem>
                        <SelectItem value="suite">Suíte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hóspedes</Label>
                    <Input type="number" name="guests" required />
                  </div>
                </div>
              </>
            )}

            {itemType === 'activity' && (
              <>
                <div className="space-y-2">
                  <Label>Local</Label>
                  <Input name="location" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Duração (horas)</Label>
                    <Input type="number" name="duration" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Inclui Transporte</Label>
                    <Select name="includesTransport" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Sim</SelectItem>
                        <SelectItem value="false">Não</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Observações</Label>
                  <Textarea name="notes" />
                </div>
              </>
            )}

            {itemType === 'restaurant' && (
              <>
                <div className="space-y-2">
                  <Label>Tipo de Cozinha</Label>
                  <Input name="cuisine" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Horário da Reserva</Label>
                    <Input type="time" name="reservationTime" required />
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Pessoas</Label>
                    <Input type="number" name="people" required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Endereço</Label>
                  <Input name="address" required />
                </div>
              </>
            )}

            <DialogFooter>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningPage;