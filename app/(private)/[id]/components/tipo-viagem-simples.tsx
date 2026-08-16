import { Radio, RadioGroup, Label } from "@heroui/react";
import { cn } from "@heroui/react";
import { Dispatch, SetStateAction } from "react";

interface Props {
  value: string;
  children: React.ReactNode;
}

export const CustomRadio = (props: Props) => {
  const { children, value } = props;

  return (
    <Radio
      value={value}
      className={cn(
        "inline-flex m-0 bg-surface hover:bg-surface-secondary",
        "flex-row cursor-pointer rounded-lg gap-4 p-3 border-2 border-transparent",
        "data-[selected=true]:border-accent"
      )}
    >
      <Radio.Content>
        <Radio.Control>
          <Radio.Indicator />
        </Radio.Control>
        {children}
      </Radio.Content>
    </Radio>
  );
};

interface RadioGroupProps {
  selectedPlan: string;
  setSelectedPlan: Dispatch<SetStateAction<string>>;
}

export default function TipoViagemSimples({ selectedPlan, setSelectedPlan }: RadioGroupProps) {
  return (
    <RadioGroup
      value={selectedPlan}
      onChange={(value) => {
        setSelectedPlan(value);
      }}
      orientation="horizontal"
      className="gap-3"
    >
      <Label>Selecione o tipo de viagem</Label>
      <CustomRadio value="Apanha">Apanha</CustomRadio>
      <CustomRadio value="Retorno">Retorno</CustomRadio>
    </RadioGroup>
  );
}