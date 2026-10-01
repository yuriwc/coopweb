"use client";

import { useEffect, useRef, useState } from "react";
import { ComboBox, FieldError, Input, Label, ListBox } from "@heroui/react";
import { Spinner } from "@heroui/react/spinner";
import { Icon } from "@iconify/react";
import { fetchComLog } from "@/src/utils/log-fetch";

interface SugestaoCidade {
  place_id: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface CidadeAutocompleteProps {
  label: string;
  /** Nome do campo no DTO, para o Form casar os erros de validação do backend. */
  name: string;
  value: string;
  onChange: (cidade: string) => void;
}

/**
 * Cidade da rota com sugestões do Google. Escolher na lista grava o nome como ele aparece nos
 * endereços, que é com o que o backend compara para achar a rota da viagem (RN-18). Texto livre
 * continua aceito se a busca falhar.
 */
export default function CidadeAutocomplete({ label, name, value, onChange }: CidadeAutocompleteProps) {
  const [sugestoes, setSugestoes] = useState<SugestaoCidade[]>([]);
  const [buscando, setBuscando] = useState(false);
  // Nome recém-escolhido na lista: não precisa buscar de novo
  const escolhida = useRef<string | null>(null);

  useEffect(() => {
    const termo = value.trim();
    if (termo.length < 3 || termo === escolhida.current) {
      setSugestoes([]);
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      setBuscando(true);
      try {
        const response = await fetchComLog(
          `/api/google-maps/autocomplete?tipo=cidade&input=${encodeURIComponent(termo)}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        setSugestoes(response.ok && data.status === "OK" ? data.predictions : []);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("Erro ao buscar cidades:", error);
          setSugestoes([]);
        }
      } finally {
        if (!controller.signal.aborted) setBuscando(false);
      }
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [value]);

  function handleSelectionChange(key: React.Key | null) {
    const sugestao = sugestoes.find((s) => s.place_id === key);
    if (sugestao) {
      escolhida.current = sugestao.structured_formatting.main_text;
      onChange(sugestao.structured_formatting.main_text);
    }
  }

  return (
    <ComboBox
      name={name}
      inputValue={value}
      onInputChange={(texto) => {
        escolhida.current = null;
        onChange(texto);
      }}
      onSelectionChange={handleSelectionChange}
      items={sugestoes}
      allowsCustomValue
      menuTrigger="input"
      isRequired
      className="w-full"
    >
      <Label>{label}</Label>
      <ComboBox.InputGroup>
        {buscando ? (
          <Spinner size="sm" />
        ) : (
          <Icon icon="solar:city-linear" className="w-4 h-4 text-muted" />
        )}
        <Input placeholder="Digite para buscar..." />
        {/* O InputGroup do HeroUI monta o grupo a partir do Trigger, que precisa ser o último filho */}
        <ComboBox.Trigger />
      </ComboBox.InputGroup>
      <ComboBox.Popover>
        <ListBox className="max-h-[200px]">
          {(sugestao: SugestaoCidade) => (
            <ListBox.Item id={sugestao.place_id} textValue={sugestao.structured_formatting.main_text}>
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  {sugestao.structured_formatting.main_text}
                </span>
                {sugestao.structured_formatting.secondary_text ? (
                  <span className="text-xs text-muted">
                    {sugestao.structured_formatting.secondary_text}
                  </span>
                ) : null}
              </div>
              <ListBox.ItemIndicator />
            </ListBox.Item>
          )}
        </ListBox>
      </ComboBox.Popover>
      <FieldError />
    </ComboBox>
  );
}
