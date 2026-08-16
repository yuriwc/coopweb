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
        "flex-row max-w-[300px] cursor-pointer rounded-lg gap-4 p-4 border-2 border-transparent",
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

export default function App({ selectedPlan, setSelectedPlan }: RadioGroupProps) {
  return (
    <RadioGroup
      value={selectedPlan}
      onChange={(value) => {
        setSelectedPlan(value);
      }}
    >
      <Label>Selecione o plano de viagem</Label>
      <CustomRadio value="Apanha">Apanha</CustomRadio>
      <CustomRadio value="Retorno">Retorno</CustomRadio>
      <CustomRadio value="APANHA_E_RETORNO">Apanha e Retorno</CustomRadio>
    </RadioGroup>
  );
}
