import Link from "next/link";

interface Passageiro {
  nome?: string;
  sobrenome?: string;
  rua?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  latitude?: number;
  longitude?: number;
}

interface Viagem {
  id: string;
  passageiros: Passageiro[];
  statusViagem: string;
  enderecoEmpresa: string;
  latitudeOrigem: number;
  longitudeOrigem: number;
  latitudeDestino: number;
  longitudeDestino: number;
  latitudeMotorista?: number;
  longitudeMotorista?: number;
}

export default function ViagemCard({
  viagem,
  cooperativaId,
  motoristaId,
}: {
  viagem: Viagem;
  cooperativaId: string;
  motoristaId: string;
}) {
  // Concatena nomes dos passageiros
  const nomesPassageiros = viagem.passageiros
    .map((p) => (p.nome ? `${p.nome} ${p.sobrenome ?? ""}` : ""))
    .filter(Boolean)
    .join(", ");

  // Endereço destino do primeiro passageiro
  const p0 = viagem.passageiros[0] || {};
  const enderecoDestino = `${p0.rua ?? ""}, ${p0.numero ?? ""} - ${
    p0.bairro ?? ""
  }, ${p0.cidade ?? ""} - ${p0.estado ?? ""}`;

  console.log(viagem);

  return (
    <div className="border rounded-none bg-transparent p-0">
      <div className="border-[0.5px] rounded-none p-0 bg-transparent">
        {/* Cabeçalho com borda fina */}
        <div className="border-b-[0.5px] p-3">
          <h2 className="text-sm font-light tracking-[0.3em] uppercase">
            VIAGEM{" "}
            <span className="tracking-normal">#{viagem.id.slice(0, 6)}</span>
          </h2>
        </div>

        {/* Corpo do card */}
        <div className="divide-y-[0.5px] divide-white">
          {/* Passageiros */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">
              Passageiro(s)
            </p>
            <p className="text-sm font-light">
              {nomesPassageiros.toUpperCase()}
            </p>
          </div>

          {/* Status */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">Status</p>
            <p className="text-sm font-light">
              {viagem.statusViagem.toUpperCase()}
            </p>
          </div>

          {/* Origem */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">Origem</p>
            <p className="text-sm font-light leading-tight">
              {viagem.enderecoEmpresa}
            </p>
          </div>

          {/* Destino */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">Destino</p>
            <p className="text-sm font-light leading-tight">
              {enderecoDestino}
            </p>
          </div>

          {/* Botão - mantendo o link mas com estilo Yeezy */}
          <div className="p-3">
            <Link
              href={`./realtime/${motoristaId}/1/${cooperativaId}`}
              className="block w-full text-center mb-4 px-4 py-2 border uppercase tracking-widest text-xs rounded-none hover:bg-black dark:hover:bg-white dark:hover:text-black hover:text-white transition"
            >
              Acompanhar Viagem
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
