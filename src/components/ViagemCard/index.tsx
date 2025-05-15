import Link from "next/link";

interface Viagem {
  id: string;
  nomePassageiro: string;
  statusViagem: string;
  enderecoOrigem: string;
  enderecoDestino: string;
}

export default function ViagemCard({ viagem }: { viagem: Viagem }) {
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
          {/* Passageiro */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">
              Passageiro
            </p>
            <p className="text-sm font-light">
              {viagem.nomePassageiro.toUpperCase()}
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
              {viagem.enderecoOrigem}
            </p>
          </div>

          {/* Destino */}
          <div className="p-3">
            <p className="text-xs tracking-[0.3em] uppercase mb-1">Destino</p>
            <p className="text-sm font-light leading-tight">
              {viagem.enderecoDestino}
            </p>
          </div>

          {/* Botão - mantendo o link mas com estilo Yeezy */}
          <div className="p-3">
            <Link
              href={`./realtime/${viagem.id}`}
              className="
              block w-full text-center
              border-[0.5px] rounded-none
              p-2 text-sm
              font-light tracking-[0.3em] uppercase
              hover:bg-white hover:text-black transition-colors
            "
            >
              Ver Mapa
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
