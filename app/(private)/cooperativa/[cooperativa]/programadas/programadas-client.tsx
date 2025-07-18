"use client";
import { useState } from "react";
import ActionButton from "./action/button";
import EncerrarButton from "./action/encerrar-button";

interface IResponse {
  nome: string;
  id: string;
}

interface IProgramadas {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
}

interface IProgramadaComMotorista {
  id: string;
  nomeEmpresa: string;
  enderecoEmpresa: string;
  nomesPassageiros: string[];
  enderecosPassageiros: string[];
  horaSaida: string;
  horaRetorno: string;
  tipoViagem: "Apanha" | "Retorno" | "APANHA_E_RETORNO";
  motoristaId: string;
  motoristaNome: string;
  motoristaTelefone: string;
  motoristaMatricula: string;
}

interface ProgramadasClientProps {
  programadasSemMotorista: IProgramadas[];
  programadasComMotorista: IProgramadaComMotorista[];
  motoristas: IResponse[];
  token: string;
}

export default function ProgramadasClient({
  programadasSemMotorista,
  programadasComMotorista,
  motoristas,
  token,
}: ProgramadasClientProps) {
  const [activeTab, setActiveTab] = useState<"sem-motorista" | "com-motorista">("sem-motorista");
  const [searchTerm, setSearchTerm] = useState("");

  const getTipoViagemLabel = (tipo: string) => {
    switch (tipo) {
      case "Apanha":
        return "APANHA";
      case "Retorno":
        return "RETORNO";
      case "APANHA_E_RETORNO":
        return "IDA E VOLTA";
      default:
        return tipo.toUpperCase();
    }
  };

  const getTipoViagemColor = (tipo: string) => {
    switch (tipo) {
      case "Apanha":
        return "bg-blue-100/30 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
      case "Retorno":
        return "bg-green-100/30 dark:bg-green-900/30 text-green-700 dark:text-green-300";
      case "APANHA_E_RETORNO":
        return "bg-purple-100/30 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300";
      default:
        return "bg-gray-100/30 dark:bg-gray-900/30 text-gray-700 dark:text-gray-300";
    }
  };

  // Filtrar viagens sem motorista por passageiros
  const filteredProgramadasSemMotorista = programadasSemMotorista.filter((transporte) => {
    if (!searchTerm) return true;
    return transporte.nomesPassageiros.some((nome) =>
      nome.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Filtrar viagens com motorista por passageiros ou motorista
  const filteredProgramadasComMotorista = programadasComMotorista.filter((viagem) => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    
    // Buscar por nome do motorista
    const motoristaMatch = viagem.motoristaNome.toLowerCase().includes(searchLower);
    
    // Buscar por nomes dos passageiros
    const passageiroMatch = viagem.nomesPassageiros.some((nome) =>
      nome.toLowerCase().includes(searchLower)
    );
    
    return motoristaMatch || passageiroMatch;
  });

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-4 shadow-xl mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg 
              className="w-5 h-5 text-slate-500 dark:text-slate-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Buscar por passageiro ou motorista..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/40 dark:bg-white/10 backdrop-blur-sm border border-white/30 dark:border-white/20 rounded-xl text-slate-800 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tab Headers */}
      <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-2 shadow-xl mb-8">
        <div className="flex">
          <button
            onClick={() => setActiveTab("sem-motorista")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "sem-motorista"
                ? "bg-white/40 dark:bg-white/20 backdrop-blur-md shadow-lg text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
            <span>📋 Sem Motorista ({filteredProgramadasSemMotorista.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("com-motorista")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === "com-motorista"
                ? "bg-white/40 dark:bg-white/20 backdrop-blur-md shadow-lg text-slate-900 dark:text-white"
                : "text-slate-700 dark:text-slate-300 hover:bg-white/20 dark:hover:bg-white/10"
            }`}
          >
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>🚗 Com Motorista ({filteredProgramadasComMotorista.length})</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="mt-8">
        {activeTab === "sem-motorista" && (
          <div>
            {filteredProgramadasSemMotorista.length > 0 ? (
              <div className="space-y-6">
                {filteredProgramadasSemMotorista.map((transporte) => (
                  <div
                    key={transporte.id}
                    className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-orange-200/50 dark:border-orange-400/20 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-orange-100/20 dark:bg-orange-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          VIAGEM
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          #{transporte.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-sky-100/20 dark:bg-sky-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          HORÁRIO
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {transporte.horaSaida} → {transporte.horaRetorno}
                        </p>
                      </div>
                    </div>

                    {/* Passageiro */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-indigo-100/20 dark:bg-indigo-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          PASSAGEIRO
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        {transporte.nomesPassageiros.map((nome, index) => (
                          <p
                            key={index}
                            className="text-sm font-medium text-slate-800 dark:text-slate-100"
                          >
                            {nome.toUpperCase()}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Endereços */}
                    <div className="grid grid-cols-5">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-cyan-100/20 dark:bg-cyan-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          TRAJETO
                        </p>
                      </div>
                      <div className="col-span-3 p-4 space-y-3">
                        <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                            ORIGEM
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {transporte.enderecoEmpresa}
                          </p>
                        </div>
                        <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                            DESTINO
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {transporte.enderecosPassageiros[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Ação */}
                    <ActionButton
                      token={token}
                      motoristas={motoristas}
                      idProgramacao={transporte.id}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm 
                    ? `📋 Nenhuma viagem sem motorista encontrada para "${searchTerm}"`
                    : "📋 Nenhuma viagem aguardando atribuição de motorista"
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "com-motorista" && (
          <div>
            {filteredProgramadasComMotorista.length > 0 ? (
              <div className="space-y-6">
                {filteredProgramadasComMotorista.map((viagem) => (
                  <div
                    key={viagem.id}
                    className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-green-200/50 dark:border-green-400/20 rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Cabeçalho do Card */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-green-100/20 dark:bg-green-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          VIAGEM
                        </p>
                      </div>
                      <div className="col-span-3 p-4 flex items-center justify-between">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                          #{viagem.id.slice(0, 8).toUpperCase()}
                        </p>
                        {viagem.tipoViagem && (
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getTipoViagemColor(viagem.tipoViagem)}`}>
                            {getTipoViagemLabel(viagem.tipoViagem)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Motorista */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-emerald-100/20 dark:bg-emerald-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          MOTORISTA
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 mb-1">
                          {viagem.motoristaNome}
                        </p>
                        <div className="flex flex-wrap gap-3">
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            📱 {viagem.motoristaTelefone}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-400">
                            🆔 {viagem.motoristaMatricula}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Horários */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-sky-100/20 dark:bg-sky-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          HORÁRIO
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {viagem.horaSaida} → {viagem.horaRetorno}
                        </p>
                      </div>
                    </div>

                    {/* Empresa */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-orange-100/20 dark:bg-orange-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          EMPRESA
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                          {viagem.nomeEmpresa}
                        </p>
                      </div>
                    </div>

                    {/* Passageiros */}
                    <div className="grid grid-cols-5 border-b border-white/20 dark:border-white/10">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-indigo-100/20 dark:bg-indigo-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          PASSAGEIROS
                        </p>
                      </div>
                      <div className="col-span-3 p-4">
                        {viagem.nomesPassageiros.map((nome, index) => (
                          <p
                            key={index}
                            className="text-sm font-medium text-slate-800 dark:text-slate-100"
                          >
                            {nome.toUpperCase()}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Endereços */}
                    <div className="grid grid-cols-5">
                      <div className="col-span-2 p-4 border-r border-white/20 dark:border-white/10 bg-cyan-100/20 dark:bg-cyan-900/20">
                        <p className="text-xs font-medium tracking-[0.3em] uppercase text-slate-700 dark:text-slate-300">
                          TRAJETO
                        </p>
                      </div>
                      <div className="col-span-3 p-4 space-y-3">
                        <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                            ORIGEM
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {viagem.enderecoEmpresa}
                          </p>
                        </div>
                        <div className="bg-white/20 dark:bg-white/10 rounded-xl p-3 backdrop-blur-sm">
                          <p className="text-xs font-medium tracking-[0.2em] uppercase text-slate-600 dark:text-slate-400 mb-1">
                            DESTINO
                          </p>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                            {viagem.enderecosPassageiros[0]}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Botão de Encerrar */}
                    <EncerrarButton
                      idProgramacao={viagem.id}
                      token={token}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="backdrop-blur-md bg-white/20 dark:bg-white/10 border border-white/30 dark:border-white/20 rounded-2xl p-8 shadow-xl text-center">
                <p className="text-slate-600 dark:text-slate-400">
                  {searchTerm 
                    ? `🚗 Nenhuma viagem com motorista encontrada para "${searchTerm}"`
                    : "🚗 Nenhuma viagem com motorista atribuído"
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}