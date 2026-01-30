"use client";

import { useEffect, useState, useRef } from "react";
import { Icon as IconifyIcon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { useFirebaseRides, PendingRide } from "@/src/services/firebase-rides";

interface PendingRidesNotificationProps {
  cooperativaId: string;
}

export const PendingRidesNotification = ({
  cooperativaId,
}: PendingRidesNotificationProps) => {
  const [rides, setRides] = useState<PendingRide[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { startListening, stopListening } = useFirebaseRides(
    cooperativaId,
    setRides
  );

  useEffect(() => {
    if (cooperativaId) {
      startListening();
      return () => stopListening();
    }
  }, [cooperativaId, startListening, stopListening]);

  // Fechar menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    if (pendingCount > 0) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      // Se não há viagens, navegar direto para o dashboard
      router.push(`/cooperativa/${cooperativaId}`);
    }
  };

  const handleRideClick = (rideId: string) => {
    setIsMenuOpen(false);
    router.push(`/cooperativa/${cooperativaId}#ride-${rideId}`);
  };

  const pendingCount = rides.length;

  // Para debug - forçar um número de teste (descomente para testar)
  // const pendingCount = 2;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={handleBellClick}
        className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-2 shadow-sm relative hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        {pendingCount > 0 ? (
          <>
            <IconifyIcon
              icon="solar:bell-bing-linear"
              className="w-5 h-5 text-orange-600 dark:text-orange-400"
            />
            {/* Badge customizado */}
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-5 h-5 flex items-center justify-center px-1 border-2 border-white dark:border-gray-800">
              {pendingCount}
            </div>
          </>
        ) : (
          <IconifyIcon
            icon="solar:bell-linear"
            className="w-5 h-5 text-gray-600 dark:text-gray-400"
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isMenuOpen && pendingCount > 0 && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <IconifyIcon
                icon="solar:car-linear"
                className="w-4 h-4 text-orange-600"
              />
              Viagens Disponíveis
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {pendingCount} {pendingCount === 1 ? "viagem" : "viagens"}{" "}
              aguardando atribuição
            </p>
          </div>

          <div className="py-2">
            {rides.map((ride) => (
              <button
                key={ride.id}
                onClick={() => handleRideClick(ride.id)}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
              >
                <div className="space-y-2">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      {ride.externalId || `ID: ${ride.id.substring(0, 8)}`}
                    </span>
                    <span className="text-xs px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded">
                      {ride.category}
                    </span>
                  </div>

                  {/* Route */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {ride.origin.name || ride.origin.address}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0" />
                      <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                        {ride.destination.name || ride.destination.address}
                      </span>
                    </div>
                  </div>

                  {/* Company */}
                  <div className="flex items-center gap-1">
                    <IconifyIcon
                      icon="solar:buildings-2-linear"
                      className="w-3 h-3 text-gray-400"
                    />
                    <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {ride.empresa.nome}
                    </span>
                  </div>

                  {/* Time info */}
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>
                      📅{" "}
                      {new Date(ride.scheduleDate).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    {(ride.distance || ride.duration) && (
                      <span>
                        {ride.distance
                          ? `${(ride.distance / 1000).toFixed(1)}km`
                          : ""}
                        {ride.distance && ride.duration ? " • " : ""}
                        {ride.duration
                          ? `${Math.round(ride.duration / 60)}min`
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                router.push(`/cooperativa/${cooperativaId}`);
              }}
              className="w-full text-center text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
            >
              Ver todas as viagens →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
