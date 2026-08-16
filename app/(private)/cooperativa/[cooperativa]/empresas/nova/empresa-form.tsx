"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@heroui/react";
import { Card } from "@heroui/react";
import { Form } from "@heroui/react";
import { TextField, Label, Description, Input } from "@heroui/react";
import ShowToast from "../../../../../../src/components/Toast";
import { cadastrarEmpresa } from "./action/cadastrar-empresa";
import { CadastroEmpresaDto } from "../../../../../../src/model/empresa";

interface EmpresaFormProps {
  cooperativaId: string;
  token: string;
}

const CAMPOS_VAZIOS: Omit<CadastroEmpresaDto, "cooperativaID"> = {
  nome: "",
  cnpj: "",
  dataFechamento: 10,
  rua: "",
  numero: "",
  bairro: "",
  cidade: "",
  cep: "",
  estado: "",
  telefone: "",
  email: "",
  referencia: "",
};

export default function EmpresaForm({ cooperativaId, token }: EmpresaFormProps) {
  const router = useRouter();
  const [dados, setDados] = useState(CAMPOS_VAZIOS);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | undefined>(undefined);

  function updateCampo<K extends keyof typeof CAMPOS_VAZIOS>(campo: K, valor: (typeof CAMPOS_VAZIOS)[K]) {
    setDados((prev) => ({ ...prev, [campo]: valor }));
  }

  async function handleSubmit() {
    setEnviando(true);
    setErro(undefined);

    const result = await cadastrarEmpresa({
      dados: { ...dados, cooperativaID: cooperativaId },
      token,
    });

    setEnviando(false);

    if (result.success) {
      setDados(CAMPOS_VAZIOS);
      ShowToast({ color: "success", title: "Empresa cadastrada com sucesso" });
    } else {
      setErro(result.message ?? "Erro ao cadastrar empresa. Tente novamente.");
      ShowToast({ color: "danger", title: "Não foi possível cadastrar a empresa", description: result.message });
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-4 sm:p-8 max-w-3xl">
        <header className="flex items-center gap-4 mb-6">
          <Button variant="secondary" onPress={() => router.back()}>
            ← Voltar
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
              Cadastrar Empresa
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Nova empresa cliente da cooperativa
            </p>
          </div>
        </header>

        <Card>
          <Card.Header>
            <p className="text-md font-semibold">Dados da empresa</p>
          </Card.Header>
          <Card.Content>
            <Form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit();
              }}
            >
              <TextField value={dados.nome} onChange={(v) => updateCampo("nome", v)} isRequired>
                <Label>Nome da empresa</Label>
                <Input />
              </TextField>
              <TextField value={dados.cnpj} onChange={(v) => updateCampo("cnpj", v)} isRequired>
                <Label>CNPJ</Label>
                <Input placeholder="00.000.000/0000-00" />
              </TextField>
              <TextField
                type="number"
                value={String(dados.dataFechamento)}
                onChange={(v) => updateCampo("dataFechamento", Number(v) || 10)}
                isRequired
              >
                <Label>Dia de fechamento</Label>
                <Input min={1} max={31} />
                <Description>Dia do mês em que o ciclo de faturamento fecha (1-31)</Description>
              </TextField>

              <div className="grid grid-cols-3 gap-3 w-full">
                <TextField
                  className="col-span-2"
                  value={dados.rua}
                  onChange={(v) => updateCampo("rua", v)}
                  isRequired
                >
                  <Label>Rua</Label>
                  <Input />
                </TextField>
                <TextField value={dados.numero} onChange={(v) => updateCampo("numero", v)} isRequired>
                  <Label>Número</Label>
                  <Input />
                </TextField>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full">
                <TextField value={dados.bairro} onChange={(v) => updateCampo("bairro", v)} isRequired>
                  <Label>Bairro</Label>
                  <Input />
                </TextField>
                <TextField value={dados.cidade} onChange={(v) => updateCampo("cidade", v)} isRequired>
                  <Label>Cidade</Label>
                  <Input />
                </TextField>
                <TextField value={dados.estado} onChange={(v) => updateCampo("estado", v)} isRequired>
                  <Label>Estado</Label>
                  <Input maxLength={2} />
                </TextField>
              </div>

              <div className="grid grid-cols-2 gap-3 w-full">
                <TextField value={dados.cep} onChange={(v) => updateCampo("cep", v)} isRequired>
                  <Label>CEP</Label>
                  <Input />
                </TextField>
                <TextField value={dados.telefone} onChange={(v) => updateCampo("telefone", v)} isRequired>
                  <Label>Telefone</Label>
                  <Input />
                </TextField>
              </div>

              <TextField value={dados.email} onChange={(v) => updateCampo("email", v)}>
                <Label>E-mail (opcional)</Label>
                <Input />
              </TextField>
              <TextField value={dados.referencia} onChange={(v) => updateCampo("referencia", v)}>
                <Label>Referência (opcional)</Label>
                <Input />
              </TextField>

              {erro ? (
                <p className="text-sm text-danger" role="alert">
                  {erro}
                </p>
              ) : null}

              <div className="flex gap-2 justify-end w-full pt-2">
                <Button variant="tertiary" onPress={() => router.back()} isDisabled={enviando}>
                  Cancelar
                </Button>
                <Button variant="primary" type="submit" isPending={enviando}>
                  Cadastrar empresa
                </Button>
              </div>
            </Form>
          </Card.Content>
        </Card>
      </div>
    </div>
  );
}
