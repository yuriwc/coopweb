"use client";

import { useState } from "react";
import { Button } from "@heroui/react";
import { TextField, Label, Input, InputGroup } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Modal } from "@heroui/react";
import ShowToast from "@/src/components/Toast";
import { fetchComLog } from "@/src/utils/log-fetch";

interface Props {
  isOpen: boolean;
  onOpen: (open: boolean) => void;
  empresa: string;
  token: string;
  onSuccess?: () => void;
}

export default function CentroCustoModal({
  isOpen,
  onOpen,
  token,
  onSuccess,
}: Props) {
  const [formData, setFormData] = useState({
    codigo: "",
    descricao: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = () => {
    if (!formData.codigo.trim()) {
      ShowToast({
        color: "danger",
        title: "Código é obrigatório",
      });
      return false;
    }

    if (!formData.descricao.trim()) {
      ShowToast({
        color: "danger",
        title: "Descrição é obrigatória",
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);

    try {
      const response = await fetchComLog(
        `${process.env.NEXT_PUBLIC_SERVER}/api/v1/centro-custo`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        ShowToast({
          color: "success",
          title: "Centro de custo cadastrado com sucesso!",
        });

        setFormData({ codigo: "", descricao: "" });
        onOpen(false);
        onSuccess?.();
      } else {
        const errorData = await response.json();
        ShowToast({
          color: "danger",
          title: errorData.message || "Erro ao cadastrar centro de custo",
        });
      }
    } catch {
      ShowToast({
        color: "danger",
        title: "Erro ao cadastrar centro de custo. Tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ codigo: "", descricao: "" });
    onOpen(false);
  };

  return (
    <>
      <Button variant="tertiary" onPress={() => onOpen(true)} size="sm">
        <Icon icon="solar:buildings-3-linear" className="w-4 h-4" />
        Centro de Custo
      </Button>

      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpen}>
          <Modal.Container size="md">
            <Modal.Dialog>
              <Modal.CloseTrigger />
              <Modal.Header>
                <Modal.Heading>Cadastrar Centro de Custo</Modal.Heading>
              </Modal.Header>

              <Modal.Body className="gap-4">
                <TextField
                  value={formData.codigo}
                  onChange={(v) => handleInputChange("codigo", v)}
                  isRequired
                >
                  <Label>Código</Label>
                  <Input placeholder="Ex: CC001, ADM, VENDAS" />
                </TextField>

                <TextField
                  value={formData.descricao}
                  onChange={(v) => handleInputChange("descricao", v)}
                  isRequired
                >
                  <Label>Descrição</Label>
                  <InputGroup>
                    <InputGroup.TextArea
                      placeholder="Ex: Administrativo, Recursos Humanos, Vendas..."
                      rows={3}
                    />
                  </InputGroup>
                </TextField>
              </Modal.Body>

              <Modal.Footer>
                <Button variant="tertiary" onPress={handleClose} isDisabled={isLoading}>
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onPress={handleSubmit}
                  isPending={isLoading}
                >
                  {!isLoading && (
                    <Icon icon="solar:check-circle-linear" className="w-4 h-4" />
                  )}
                  Cadastrar
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
