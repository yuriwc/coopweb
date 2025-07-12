"use client";

import { useEffect, useState } from "react";
import { Chip } from "@heroui/chip";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Icon as IconifyIcon } from "@iconify/react";
import { useFirebaseQueues, Fila } from "@/src/services/firebase-queue";
import { formatTimestampToTime } from "@/src/utils/date";

interface FilasDisplayProps {
  cooperativaId: string;
  showHeader?: boolean;
}

interface FilasHeaderProps {
  cooperativaId: string;
}

export const FilasHeader = ({ cooperativaId }: FilasHeaderProps) => {
  const [filas, setFilas] = useState<Fila[]>([]);

  const { startListening, stopListening } = useFirebaseQueues(
    cooperativaId,
    setFilas
  );

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [cooperativaId, startListening, stopListening]);

  if (filas.length === 0) return null;

  const totalDrivers = filas.reduce((acc, fila) => acc + fila.motoristas.length, 0);

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg">
        <IconifyIcon
          icon="solar:users-group-rounded-linear"
          className="w-5 h-5 text-blue-600 dark:text-blue-400"
        />
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {filas.length} fila{filas.length !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {totalDrivers} motorista{totalDrivers !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export const FilasDisplay = ({ cooperativaId, showHeader = true }: FilasDisplayProps) => {
  const [filas, setFilas] = useState<Fila[]>([]);

  const { startListening, stopListening } = useFirebaseQueues(
    cooperativaId,
    setFilas
  );

  useEffect(() => {
    startListening();
    return () => stopListening();
  }, [cooperativaId, startListening, stopListening]);

  if (filas.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
            <IconifyIcon
              icon="solar:clock-circle-linear"
              className="w-8 h-8 text-gray-400 dark:text-gray-500"
            />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              Nenhuma fila ativa
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              As filas aparecerão aqui quando houver motoristas aguardando
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
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <IconifyIcon
                icon="solar:users-group-rounded-linear"
                className="w-4 h-4 text-blue-600 dark:text-blue-400"
              />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Filas Ativas
            </h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {filas.length} fila{filas.length !== 1 ? 's' : ''} com motoristas aguardando
          </p>
        </div>
      )}

      {/* Queue Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filas.map((fila, index) => (
          <div key={fila.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            {/* Queue Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                    <IconifyIcon
                      icon="solar:map-point-wave-linear"
                      className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Fila {index + 1}
                  </h3>
                </div>
                <Chip 
                  size="sm" 
                  variant="flat"
                  className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  {fila.motoristas.length}
                </Chip>
              </div>
            </div>

            {/* Drivers List */}
            <div className="p-4">
              <ScrollShadow className="min-h-[150px] max-h-[300px]" hideScrollBar>
                <div className="space-y-3">
                  {fila.motoristas.map((motorista, motoristaIndex) => (
                    <div 
                      key={`${motorista.motorista}-${motoristaIndex}`}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {motorista.nome}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <IconifyIcon
                          icon="solar:clock-circle-linear"
                          className="w-3 h-3 text-gray-400 dark:text-gray-500"
                        />
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          {formatTimestampToTime(motorista.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollShadow>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};