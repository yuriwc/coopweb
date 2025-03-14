"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { redirect } from "next/navigation";

interface IProps {
  name: string;
  url: string;
}

interface AppProps {
  items: IProps[];
}

export default function App({ items }: AppProps) {
  function handleNavigate(url: string) {
    redirect(url);
  }

  return (
    <Breadcrumbs className="absolute top-24 right-10 z-10">
      {items.map((item) => (
        <BreadcrumbItem key={item.url} onPress={() => handleNavigate(item.url)}>
          {item.name}
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
