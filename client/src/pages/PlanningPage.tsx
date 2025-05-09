
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PlanningPage: React.FC = () => {
  const [tripDetails, setTripDetails] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTripDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = () => {
    console.log('Detalhes da viagem:', tripDetails);
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Planejamento de Viagem</h2>
        <Button onClick={handleSave}>Salvar Planejamento</Button>
      </div>

      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Detalhes da Viagem</TabsTrigger>
          <TabsTrigger value="budget">Orçamento</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Destino</label>
                  <Input
                    name="destination"
                    value={tripDetails.destination}
                    onChange={handleChange}
                    placeholder="Para onde você vai?"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Ida</label>
                  <Input
                    type="date"
                    name="startDate"
                    value={tripDetails.startDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Data de Volta</label>
                  <Input
                    type="date"
                    name="endDate"
                    value={tripDetails.endDate}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Orçamento Previsto</label>
                  <Input
                    type="number"
                    name="budget"
                    value={tripDetails.budget}
                    onChange={handleChange}
                    placeholder="R$ 0,00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Anotações</label>
                <Textarea
                  name="notes"
                  value={tripDetails.notes}
                  onChange={handleChange}
                  placeholder="Adicione notas importantes sobre a viagem..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklist">
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500">Em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanningPage;
