import { cookies } from "next/headers";
import ProgramadasClient from "./programadas-client";

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

const App = async (props: { params: Promise<{ cooperativa: string }> }) => {
  const params = await props.params;
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";

  // Buscar programações primeiro
  const [programadasSemMotoristaRequest, programadasComMotoristaRequest] = await Promise.all([
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/sem-motorista`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { 
        tags: ["programacoes"],
        revalidate: 30 // Cache por 30 segundos para melhorar performance
      },
    }),
    fetch(`${process.env.NEXT_PUBLIC_SERVER}/api/v1/programacao/com-motorista`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      next: { 
        tags: ["programacoes-com-motorista"],
        revalidate: 30 // Cache por 30 segundos
      },
    })
  ]);

  if (!programadasSemMotoristaRequest.ok || !programadasComMotoristaRequest.ok) {
    console.error("Erro na requisição das programações");
    return null;
  }

  const programadasSemMotorista = (await programadasSemMotoristaRequest.json()) as IProgramadas[];
  const programadasComMotorista = (await programadasComMotoristaRequest.json()) as IProgramadaComMotorista[];

  // Buscar motoristas APENAS se há programações sem motorista
  let motoristas: IResponse[] = [];
  if (programadasSemMotorista.length > 0) {
    try {
      const motoristasRequest = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/cooperativa/${params.cooperativa}/motoristas`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          next: { 
            tags: ["motoristas"],
            revalidate: 300 // Cache por 5 minutos (dados menos voláteis)
          },
        }
      );

      if (motoristasRequest.ok) {
        motoristas = (await motoristasRequest.json()) as IResponse[];
      } else {
        console.warn("Erro ao buscar motoristas:", motoristasRequest.status);
      }
    } catch (error) {
      console.warn("Erro ao buscar motoristas:", error);
    }
  }


  return (
    <ProgramadasClient
      programadasSemMotorista={programadasSemMotorista}
      programadasComMotorista={programadasComMotorista}
      motoristas={motoristas}
      token={token}
    />
  );
};

export default App;
