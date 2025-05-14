"use client";

import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import Link from "next/link";

interface IProps {
  name: string;
  url: string;
}

interface AppProps {
  items: IProps[];
}

export default function App({ items }: AppProps) {
  return (
    <Breadcrumbs variant="bordered" className="absolute top-24 right-2 z-10">
      {items.map((item) => (
        <BreadcrumbItem key={item.url}>
          <Link href={item.url}>{item.name}</Link>
        </BreadcrumbItem>
      ))}
    </Breadcrumbs>
  );
}
