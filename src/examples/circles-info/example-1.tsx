"use client";

import React from "react";
import { Icon } from "@iconify/react";
import { ButtonProps, Button } from "@heroui/button";
import { CardProps, Card } from "@heroui/card";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Select, SelectItem } from "@heroui/select";
import { cn } from "@heroui/theme";
import { Tooltip } from "@heroui/tooltip";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

type ChartData = {
  name: string;
  [key: string]: string | number;
};

type CircleChartProps = {
  title: string;
  color: ButtonProps["color"];
  categories: string[];
  chartData: ChartData[];
};

const data: CircleChartProps[] = [
  {
    title: "Traffic Sources",
    categories: ["Search", "Direct", "Social", "Referral"],
    color: "warning",
    chartData: [
      { name: "Search", value: 400 },
      { name: "Direct", value: 300 },
      { name: "Social", value: 300 },
      { name: "Referral", value: 200 },
    ],
  },
  {
    title: "Device Usage",
    categories: ["Mobile", "Desktop", "Tablet", "Smart TV"],
    color: "success",
    chartData: [
      { name: "Mobile", value: 450 },
      { name: "Desktop", value: 300 },
      { name: "Tablet", value: 250 },
      { name: "Smart TV", value: 200 },
    ],
  },
  {
    title: "Browser Usage",
    categories: ["Chrome", "Safari", "Firefox", "Edge"],
    color: "danger",
    chartData: [
      { name: "Chrome", value: 350 },
      { name: "Safari", value: 280 },
      { name: "Firefox", value: 220 },
      { name: "Edge", value: 150 },
    ],
  },
];

export default function Component() {
  return (
    <dl className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {data.map((item, index) => (
        <CircleChartCard key={index} {...item} />
      ))}
    </dl>
  );
}

const formatTotal = (total: number) => {
  return total >= 1000 ? `${(total / 1000).toFixed(1)}K` : total;
};

const CircleChartCard = React.forwardRef<
  HTMLDivElement,
  Omit<CardProps, "children"> & CircleChartProps
>(({ className, title, categories, color, chartData, ...props }, ref) => {
  return (
    <Card
      ref={ref}
      className={cn(
        "min-h-[240px] border border-transparent dark:border-default-100",
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-y-2 p-4 pb-0">
        <div className="flex items-center justify-between gap-x-2">
          <dt>
            <h3 className="text-small font-medium text-default-500">{title}</h3>
          </dt>
          <div className="flex items-center justify-end gap-x-2">
            <Select
              aria-label="Time Range"
              classNames={{
                trigger: "min-w-[100px] min-h-7 h-7",
                value: "text-tiny !text-default-500",
                selectorIcon: "text-default-500",
                popoverContent: "min-w-[120px]",
              }}
              defaultSelectedKeys={["per-day"]}
              listboxProps={{
                itemClasses: {
                  title: "text-tiny",
                },
              }}
              placeholder="Per Day"
              size="sm"
            >
              <SelectItem key="per-day">Per Day</SelectItem>
              <SelectItem key="per-week">Per Week</SelectItem>
              <SelectItem key="per-month">Per Month</SelectItem>
            </Select>
            <Dropdown
              classNames={{
                content: "min-w-[120px]",
              }}
              placement="bottom-end"
            >
              <DropdownTrigger>
                <Button isIconOnly radius="full" size="sm" variant="light">
                  <Icon height={16} icon="solar:menu-dots-bold" width={16} />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                itemClasses={{
                  title: "text-tiny",
                }}
                variant="flat"
              >
                <DropdownItem key="view-details">View Details</DropdownItem>
                <DropdownItem key="export-data">Export Data</DropdownItem>
                <DropdownItem key="set-alert">Set Alert</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>
        </div>
      </div>
      <div className="flex h-full flex-wrap items-center justify-center gap-x-2 lg:flex-nowrap">
        <ResponsiveContainer
          className="[&_.recharts-surface]:outline-none"
          height={200}
          width="100%"
        >
          <PieChart
            accessibilityLayer
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <Tooltip
              content={<CustomTooltip categories={categories} color={color} />}
            />
            <Pie
              animationDuration={1000}
              animationEasing="ease"
              data={chartData}
              dataKey="value"
              innerRadius="68%"
              nameKey="name"
              paddingAngle={-20}
              strokeWidth={0}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`hsl(var(--heroui-${color}-${(index + 1) * 200}))`}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="flex w-full flex-col justify-center gap-4 p-4 text-tiny text-default-500 lg:p-0">
          {categories.map((category, index) => (
            <div key={index} className="flex items-center gap-2">
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `hsl(var(--heroui-${color}-${
                    (index + 1) * 200
                  }))`,
                }}
              />
              <span className="capitalize">{category}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
});

CircleChartCard.displayName = "CircleChartCard";
CircleChartCard.displayName = "CircleChartCard";

// CustomTooltip component for Recharts Tooltip
type CustomTooltipProps = {
  label?: string;
  payload?: Array<{
    name: string;
    value: number;
    [key: string]: unknown;
  }>;
  categories: string[];
  color: ButtonProps["color"];
};

const CustomTooltip = ({
  label,
  payload,
  categories,
  color,
}: CustomTooltipProps) => {
  if (!payload || payload.length === 0) return null;
  return (
    <div className="flex h-8 min-w-[120px] items-center gap-x-2 rounded-medium bg-background px-1 text-tiny shadow-small">
      <span className="font-medium text-foreground">{label}</span>
      {payload.map(
        (
          p: {
            name: string;
            value: number;
            [key: string]: unknown;
          },
          index: number
        ) => {
          const name = p.name;
          const value = p.value;
          const category =
            categories.find((c) => c.toLowerCase() === name) ?? name;

          return (
            <div
              key={`${index}-${name}`}
              className="flex w-full items-center gap-x-2"
            >
              <div
                className="h-2 w-2 flex-none rounded-full"
                style={{
                  backgroundColor: `hsl(var(--heroui-${color}-${
                    (index + 1) * 200
                  }))`,
                }}
              />
              <div className="flex w-full items-center justify-between gap-x-2 pr-1 text-xs text-default-700">
                <span className="text-default-500">{category}</span>
                <span className="font-mono font-medium text-default-700">
                  {formatTotal(value as number)}
                </span>
              </div>
            </div>
          );
        }
      )}
    </div>
  );
};
