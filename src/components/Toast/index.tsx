import { toast } from "@heroui/react";

type ColorVariant =
  | "default"
  | "foreground"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

const VARIANT_MAP: Record<ColorVariant, "default" | "accent" | "success" | "warning" | "danger"> = {
  default: "default",
  foreground: "default",
  primary: "accent",
  secondary: "default",
  success: "success",
  warning: "warning",
  danger: "danger",
};

interface Props {
  color: ColorVariant;
  title: string;
  description?: string;
}

export default function ShowToast({
  color = "default",
  title,
  description,
}: Props) {
  toast(title, {
    description,
    variant: VARIANT_MAP[color],
  });
}
