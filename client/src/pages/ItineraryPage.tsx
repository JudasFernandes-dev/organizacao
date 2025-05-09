
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plane, Hotel, Utensils, Ticket } from 'lucide-react';
import { format } from 'date-fns';

interface DayItinerary {
  date: string;
  items: Array<{
    id: string;
    type: 'flight' | 'hotel' | 'activity' | 'restaurant';
    name: string;
    time?: string;
    details?: any;
  }>;
}

export default function ItineraryPage() {
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [itinerary, setItinerary] = useState<DayItinerary[]>([]);

  const getIcon = (type: string) => {
    switch(type) {
      case 'flight': return <Plane className="h-5 w-5" />;
      case 'hotel': return <Hotel className="h-5 w-5" />;
      case 'activity': return <Ticket className="h-5 w-5" />;
      case 'restaurant': return <Utensils className="h-5 w-5" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">Roteiro de Viagem</h2>
        <Select value={selectedTrip} onValueChange={setSelectedTrip}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Selecione uma viagem" />
          </SelectTrigger>
          <SelectContent>
            {/* Add trip options here */}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        {itinerary.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>{format(new Date(day.date), 'dd/MM/yyyy')}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {day.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 bg-secondary rounded-lg">
                      {getIcon(item.type)}
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        {item.time && <p className="text-sm text-muted-foreground">{item.time}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
