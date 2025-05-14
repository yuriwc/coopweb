import { addToast } from "@heroui/toast";

type ColorVariant =
  | "default"
  | "foreground"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

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
  addToast({
    title: title,
    description: description,
    color,
  });
}
