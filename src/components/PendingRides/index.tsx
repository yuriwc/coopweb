"use client";

import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Select, SelectItem } from "@heroui/select";
import { Button } from "@heroui/button";
import { Icon as IconifyIcon } from "@iconify/react";
import { useFirebaseRides, PendingRide } from "@/src/services/firebase-rides";
import { getMotoristas, assignMotoristaToRide, Motorista } from "@/src/services/motorista";
import { formatTimestampToTime } from "@/src/utils/date";

interface PendingRidesProps {
  cooperativaId: string;
  showHeader?: boolean;
}

interface PendingRidesHeaderProps {
  cooperativaId: string;
}

export const PendingRidesHeader = ({ cooperativaId }: PendingRidesHeaderProps) => {
  const [rides, setRides] = useState<PendingRide[]>([]);

  const { startListening, stopListening } = useFirebaseRides(
    cooperativaId,
    setRides
  );

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [cooperativaId, startListening, stopListening]);

  if (rides.length === 0) return null;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg">
        <IconifyIcon
          icon="solar:car-linear"
          className="w-5 h-5 text-orange-600 dark:text-orange-400"
        />
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {rides.length} viagem{rides.length !== 1 ? 'ns' : ''}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          pendente{rides.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export const PendingRides = ({ cooperativaId, showHeader = true }: PendingRidesProps) => {
  const [rides, setRides] = useState<PendingRide[]>([]);
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [selectedMotorista, setSelectedMotorista] = useState<Record<string, string>>({});
  const [assigning, setAssigning] = useState<Record<string, boolean>>({});

  const { startListening, stopListening } = useFirebaseRides(
    cooperativaId,
    setRides
  );

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [cooperativaId, startListening, stopListening]);

  useEffect(() => {
    const fetchMotoristas = async () => {
      const result = await getMotoristas(cooperativaId);
      if (result) {
        setMotoristas(result);
      }
    };
    fetchMotoristas();
  }, [cooperativaId]);

  const handleAssignMotorista = async (rideId: string) => {
    const motoristaId = selectedMotorista[rideId];
    if (!motoristaId) return;

    setAssigning(prev => ({ ...prev, [rideId]: true }));
    
    const success = await assignMotoristaToRide(cooperativaId, rideId, motoristaId);
    
    if (success) {
      // Remove a viagem da lista após sucesso na atribuição
      setRides(prev => prev.filter(ride => ride.id !== rideId));
      setSelectedMotorista(prev => {
        const newSelected = { ...prev };
        delete newSelected[rideId];
        return newSelected;
      });
    }
    
    setAssigning(prev => ({ ...prev, [rideId]: false }));
  };

  if (rides.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <IconifyIcon
              icon="solar:car-linear"
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Nenhuma viagem pendente
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As viagens pendentes aparecerão aqui quando houver solicitações
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Section Header */}
      {showHeader && (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <IconifyIcon
                icon="solar:car-linear"
                className="w-4 h-4 text-orange-600 dark:text-orange-400"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Viagens Pendentes
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {rides.length} viagem{rides.length !== 1 ? 'ns' : ''} aguardando atribuição
          </p>
        </div>
      )}

      {/* Rides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rides.map((ride) => (
          <div key={ride.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Ride Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                    <IconifyIcon
                      icon="solar:route-linear"
                      className="w-4 h-4 text-orange-600 dark:text-orange-400"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    {ride.externalId}
                  </h3>
                </div>
                <Chip 
                  size="sm" 
                  variant="flat"
                  className="bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300"
                >
                  {ride.category}
                </Chip>
              </div>
              
              {/* Company Info */}
              <div className="flex items-center gap-2">
                <IconifyIcon
                  icon="solar:buildings-2-linear"
                  className="w-3 h-3 text-gray-400 dark:text-gray-500"
                />
                <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  {ride.empresa.nome}
                </span>
              </div>
            </div>

            {/* Ride Details */}
            <div className="p-4">
              <div className="space-y-3">
                {/* Origin */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Origem
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {ride.origin.name || ride.origin.address}
                    </p>
                  </div>
                </div>

                {/* Destination */}
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mt-0.5">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                      Destino
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {ride.destination.name || ride.destination.address}
                    </p>
                  </div>
                </div>

                {/* Passenger */}
                <div className="flex items-center gap-2">
                  <IconifyIcon
                    icon="solar:user-linear"
                    className="w-3 h-3 text-gray-400 dark:text-gray-500"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                    {ride.passenger.email}
                  </span>
                </div>

                {/* Schedule Date */}
                {ride.scheduleDate && (
                  <div className="flex items-center gap-2">
                    <IconifyIcon
                      icon="solar:calendar-linear"
                      className="w-3 h-3 text-blue-500 dark:text-blue-400"
                    />
                    <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                      Agendada: {new Date(ride.scheduleDate).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                )}

                {/* Created Time */}
                <div className="flex items-center gap-2">
                  <IconifyIcon
                    icon="solar:clock-circle-linear"
                    className="w-3 h-3 text-gray-400 dark:text-gray-500"
                  />
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Criada: {formatTimestampToTime(ride.createdAt)}
                  </span>
                </div>

                {/* Observations */}
                {ride.observations && (
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {ride.observations}
                    </p>
                  </div>
                )}

                {/* Distance & Duration */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-1">
                    <IconifyIcon
                      icon="solar:map-linear"
                      className="w-3 h-3 text-gray-400 dark:text-gray-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {(ride.distance / 1000).toFixed(1)} km
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <IconifyIcon
                      icon="solar:clock-circle-linear"
                      className="w-3 h-3 text-gray-400 dark:text-gray-500"
                    />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {Math.round(ride.duration / 60)} min
                    </span>
                  </div>
                </div>

                {/* Motorista Assignment */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
                  <Select
                    size="sm"
                    placeholder="Selecione um motorista"
                    aria-label="Selecionar motorista para a viagem"
                    selectedKeys={selectedMotorista[ride.id] ? [selectedMotorista[ride.id]] : []}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      setSelectedMotorista(prev => ({ ...prev, [ride.id]: selected }));
                    }}
                    classNames={{
                      trigger: "h-8 min-h-8",
                      value: "text-xs",
                    }}
                  >
                    {motoristas.map((motorista) => (
                      <SelectItem key={motorista.id} value={motorista.id}>
                        {motorista.nome}
                      </SelectItem>
                    ))}
                  </Select>
                  
                  <Button
                    size="sm"
                    color="primary"
                    className="w-full h-8"
                    isDisabled={!selectedMotorista[ride.id] || assigning[ride.id]}
                    isLoading={assigning[ride.id]}
                    onPress={() => handleAssignMotorista(ride.id)}
                  >
                    {assigning[ride.id] ? 'Atribuindo...' : 'Atribuir Motorista'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};