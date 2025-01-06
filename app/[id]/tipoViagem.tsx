import { Radio, RadioGroup } from "@nextui-org/radio";
import { cn } from "@nextui-org/theme";
import { Dispatch, SetStateAction } from "react";

interface Props {
  description: string;
  value: string;
  children: React.ReactNode;
}

export const CustomRadio = (props: Props) => {
  const { children, ...otherProps } = props;

  return (
    <Radio
      {...otherProps}
      classNames={{
        base: cn(
          "inline-flex m-0 bg-content1 hover:bg-content2",
          "flex-row-reverse max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
          "data-[selected=true]:border-primary",
        ),
      }}
    >
      {children}
    </Radio>
  );
};

interface RadioGroupProps {
  setSelectedPlan: Dispatch<SetStateAction<string>>;
}

export default function App({ setSelectedPlan }: RadioGroupProps) {
  return (
    <RadioGroup
      onValueChange={(e) => {
        setSelectedPlan(e);
      }}
      description="Selecione o plano de viagem"
      label="Plans"
    >
      <CustomRadio
        description="Buscar passageiro em casa para levar para fábrica"
        value="Apanha"
      >
        Apanha
      </CustomRadio>
      <CustomRadio
        description="Levar passageiro da fábrica para casa"
        value="Retorno"
      >
        Retorno
      </CustomRadio>
      <CustomRadio
        description="Buscar passageiro em casa e levar de volta após expediente"
        value="apanhaeretorno"
      >
        Apanha e Retorno
      </CustomRadio>
      <CustomRadio
        description="Viagem programada para uma hora específica"
        value="programada"
      >
        Programada
      </CustomRadio>
    </RadioGroup>
  );
}
