"use client";

import { CentroCustoResumo } from "@/src/model/relatorio-vouchers";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Icon } from "@iconify/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

interface Props {
  data: CentroCustoResumo[];
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
}

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#84cc16", // lime-500
  "#f97316", // orange-500
];

export default function VouchersCharts({ data }: Props) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: TooltipPayload, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}:{" "}
              {entry.name.includes("Valor") || entry.name.includes("Total")
                ? formatCurrency(entry.value)
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Preparar dados para gráficos
  const barChartData = data.map((centro) => ({
    nome: centro.codigoCentroCusto,
    descricao: centro.descricaoCentroCusto,
    "Total Vouchers": centro.totalVouchers,
    "Valor Total": centro.valorTotal,
    "Valor Pago": centro.valorPago,
    "Valor Pendente": centro.valorPendente,
    "Taxa Pagamento":
      centro.valorTotal > 0 ? (centro.valorPago / centro.valorTotal) * 100 : 0,
  }));

  const pieChartData = data.map((centro, index) => ({
    name: centro.codigoCentroCusto,
    value: centro.valorTotal,
    color: COLORS[index % COLORS.length],
  }));

  const statusData = data.map((centro) => ({
    centro: centro.codigoCentroCusto,
    pago: centro.valorPago,
    pendente: centro.valorPendente,
  }));

  return (
    <div className="space-y-8">
      {/* Gráfico de Barras - Comparação de Vouchers */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/[0.20] dark:bg-white/[0.03] backdrop-blur-xl border border-blue-200/40 dark:border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100/20 dark:bg-blue-900/20 rounded-lg">
                <Icon
                  icon="solar:chart-linear"
                  className="w-5 h-5 text-blue-600 dark:text-blue-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Vouchers por Centro de Custo
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Quantidade de vouchers emitidos
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="Total Vouchers"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>

        <Card className="bg-white/[0.20] dark:bg-white/[0.03] backdrop-blur-xl border border-blue-200/40 dark:border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-100/20 dark:bg-emerald-900/20 rounded-lg">
                <Icon
                  icon="solar:pie-chart-linear"
                  className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Distribuição de Valores
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Valor total por centro de custo
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [
                      formatCurrency(value),
                      "Valor",
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Gráfico de Área - Valores por Status */}
      <section>
        <Card className="bg-white/[0.20] dark:bg-white/[0.03] backdrop-blur-xl border border-blue-200/40 dark:border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100/20 dark:bg-purple-900/20 rounded-lg">
                <Icon
                  icon="solar:chart-2-linear"
                  className="w-5 h-5 text-purple-600 dark:text-purple-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Status de Pagamentos
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Comparação entre valores pagos e pendentes
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="centro" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="pago"
                    stackId="1"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.6}
                    name="Valor Pago"
                  />
                  <Area
                    type="monotone"
                    dataKey="pendente"
                    stackId="1"
                    stroke="#f59e0b"
                    fill="#f59e0b"
                    fillOpacity={0.6}
                    name="Valor Pendente"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>

      {/* Gráfico de Linha - Taxa de Pagamento */}
      <section>
        <Card className="bg-white/[0.20] dark:bg-white/[0.03] backdrop-blur-xl border border-blue-200/40 dark:border-white/10">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-cyan-100/20 dark:bg-cyan-900/20 rounded-lg">
                <Icon
                  icon="solar:graph-linear"
                  className="w-5 h-5 text-cyan-600 dark:text-cyan-400"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Taxa de Pagamento
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Percentual de valores pagos por centro de custo
                </p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="nome" stroke="#64748b" fontSize={12} />
                  <YAxis
                    stroke="#64748b"
                    fontSize={12}
                    tickFormatter={(value) => `${value}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value.toFixed(1)}%`,
                      "Taxa de Pagamento",
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="Taxa Pagamento"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: "#06b6d4", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
