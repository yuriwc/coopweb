import { Radio, RadioGroup } from "@heroui/radio";
import { cn } from "@heroui/theme";
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
          "flex-row cursor-pointer rounded-lg gap-4 p-3 border-2 border-transparent",
          "data-[selected=true]:border-primary"
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

export default function TipoViagemSimples({ setSelectedPlan }: RadioGroupProps) {
  return (
    <RadioGroup
      onValueChange={(e) => {
        setSelectedPlan(e);
      }}
      label="Selecione o tipo de viagem"
      orientation="horizontal"
      classNames={{
        wrapper: "flex flex-row gap-3"
      }}
    >
      <CustomRadio description="" value="Apanha">
        Apanha
      </CustomRadio>
      <CustomRadio description="" value="Retorno">
        Retorno
      </CustomRadio>
    </RadioGroup>
  );
}