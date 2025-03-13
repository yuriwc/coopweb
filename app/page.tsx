import { Cooperativa } from "@/src/model/cooperativas";
import { Card } from "@heroui/card";
import { Link } from "@heroui/link";
import Image from "next/image";

export default async function Home() {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SERVER}/api/v1/empresa/cooperativa/77c73ddc-1331-427a-b2b2-031a55ff8a73`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOKEN}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    console.error("Erro na requisição:", response.status, response.statusText);
    return null;
  }
  const empresas = await response.json();
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-center sm:text-left">
          Bem vindo ao CoopWeb
        </h1>
        <p className="text-lg text-center sm:text-left">
          Selecione em qual empresa deseja entrar
        </p>

        {empresas.map((empresa: Cooperativa) => (
          <Link className="w-full" href={`/${empresa.id}`} key={empresa.id}>
            <Card
              isHoverable
              isPressable
              className="w-full max-w-[400px] p-4 flex flex-col gap-2 items-center"
            >
              <span className="text-lg font-bold">{empresa.nome}</span>
            </Card>
          </Link>
        ))}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Desenvolvido por Yuri Cavalcante
        </a>

        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Algo deu errado? Entre em contato com o suporte →
        </a>
      </footer>
    </div>
  );
}
