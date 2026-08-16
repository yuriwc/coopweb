"use client";

import { Breadcrumbs, BreadcrumbsItem } from "@heroui/react";

interface IProps {
  name: string;
  url: string;
}

interface AppProps {
  items: IProps[];
}

export default function App({ items }: AppProps) {
  return (
    <Breadcrumbs className="text-sm">
      {items.map((item) => (
        <BreadcrumbsItem key={item.url} href={item.url}>
          {item.name}
        </BreadcrumbsItem>
      ))}
    </Breadcrumbs>
  );
}
