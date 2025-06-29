import { getToken } from "@/src/utils/token/get-token";
import { Suspense } from "react";
import ResumoClient from "./resumo-client";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ dataInicio?: string; dataFim?: string }>;
}

async function ResumoVouchers({ params, searchParams }: Props) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const token = await getToken();

  return (
    <ResumoClient
      empresaId={resolvedParams.id}
      token={token}
      dataInicio={resolvedSearchParams.dataInicio}
      dataFim={resolvedSearchParams.dataFim}
    />
  );
}

export default function ResumoPage(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin mx-auto mb-4 border-4 border-blue-500 border-t-transparent rounded-full" />
            <p>Carregando resumo...</p>
          </div>
        </div>
      }
    >
      <ResumoVouchers {...props} />
    </Suspense>
  );
}