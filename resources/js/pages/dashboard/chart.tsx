'use client'

import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from 'recharts'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { usePage } from '@inertiajs/react'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

interface ChartDataPoint {
  breeding_harga: number
  breeding_jumlah: number
  breeding_rata_jumlah: number
  breeding_rata_harga: number
  complete_harga: number
  complete_jumlah: number
  complete_rata_jumlah: number
  complete_rata_harga: number
  fattening_harga: number
  fattening_jumlah: number
  fattening_rata_jumlah: number
  fattening_rata_harga: number
  silase_harga: number
  silase_jumlah: number
  silase_rata_jumlah: number
  silase_rata_harga: number
  month: string
}

interface YearlyDataPoint {
  harga: number
  jumlah: number
  label: string
  rata_harga: number
  rata_jumlah: number
}

const chartConfig = {
  breeding_jumlah: {
    label: 'Breeding',
    color: 'var(--chart-1)',
  },
  fattening_jumlah: {
    label: 'Fattening',
    color: 'var(--chart-2)',
  },
  complete_jumlah: {
    label: 'Complete',
    color: 'var(--chart-3)',
  },
  silase_jumlah: {
    label: 'Silase',
    color: 'var(--chart-4)',
  },
  breeding_harga: {
    label: 'Breeding Price',
    color: 'var(--chart-1)',
  },
  fattening_harga: {
    label: 'Fattening Price',
    color: 'var(--chart-2)',
  },
  complete_harga: {
    label: 'Complete Price',
    color: 'var(--chart-3)',
  },
  silase_harga: {
    label: 'Silase Price',
    color: 'var(--chart-4)',
  },
  breeding_rata_jumlah: {
    label: 'Breeding Average Quantity',
    color: 'var(--chart-1)',
  },
  fattening_rata_jumlah: {
    label: 'Fattening Average Quantity',
    color: 'var(--chart-2)',
  },
  complete_rata_jumlah: {
    label: 'Complete Average Quantity',
    color: 'var(--chart-3)',
  },
  silase_rata_jumlah: {
    label: 'Silase Average Quantity',
    color: 'var(--chart-4)',
  },
  breeding_rata_harga: {
    label: 'Breeding Average Price',
    color: 'var(--chart-1)',
  },
  fattening_rata_harga: {
    label: 'Fattening Average Price',
    color: 'var(--chart-2)',
  },
  complete_rata_harga: {
    label: 'Complete Average Price',
    color: 'var(--chart-3)',
  },
  silase_rata_harga: {
    label: 'Silase Average Price',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

const yearlyChartConfig = {
  harga: {
    label: 'Harga',
    color: 'var(--chart-1)',
  },
  jumlah: {
    label: 'Jumlah',
    color: 'var(--chart-2)',
  },
  rata_harga: {
    label: 'Rata-rata Harga',
    color: 'var(--chart-3)',
  },
  rata_jumlah: {
    label: 'Rata-rata Jumlah',
    color: 'var(--chart-4)',
  },
  label: {
    color: 'var(--background)',
  },
} satisfies ChartConfig

export function ProductChart() {
  const { chartData, yearlyData } = usePage<{
    chartData: ChartDataPoint[]
    yearlyData: YearlyDataPoint[]
  }>().props

  const [chartType, setChartType] = useState<
    'jumlah' | 'harga' | 'rata_jumlah' | 'rata_harga'
  >('jumlah')

  const [yearlyChartType, setYearlyChartType] = useState<
    'jumlah' | 'harga' | 'rata_jumlah' | 'rata_harga'
  >('jumlah')

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-7">
      <Card className="col-span-1 py-0 lg:col-span-5">
        <CardHeader className="flex flex-col items-stretch border-b p-4 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1">
            <CardTitle className="text-xl">
              Pembelian Berdasarkan Tipe
            </CardTitle>
            <CardDescription className="text-lg">
              Tren pembelian pakan per jenis pakan berdasarkan {chartType}
            </CardDescription>
          </div>
          <div className="flex items-center">
            {/* Month/Year Selector */}
            <div className="relative">
              <select
                value={chartType}
                onChange={(e) =>
                  setChartType(
                    e.target.value as
                      | 'jumlah'
                      | 'harga'
                      | 'rata_jumlah'
                      | 'rata_harga',
                  )
                }
                className="cursor-pointer appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-base text-foreground transition-colors hover:bg-muted"
              >
                <option value="jumlah">Jumlah (kg)</option>
                <option value="harga">Harga (Rp)</option>
                <option value="rata_jumlah">Rata-rata Jumlah (kg)</option>
                <option value="rata_harga">Rata-rata Harga (Rp)</option>
              </select>
              <ChevronDown className="pointer-events-none absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:p-6">
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    formatter={(value, name, item, index) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                          style={
                            {
                              '--color-bg': `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                          {chartType === 'harga' ? (
                            <span className="font-normal text-muted-foreground">
                              Rp{value}
                            </span>
                          ) : (
                            <span className="font-normal text-muted-foreground">
                              {value} kg
                            </span>
                          )}
                        </div>
                        {/* Add this after the last item */}
                        {index === 3 && (
                          <div className="mt-1.5 flex basis-full items-center border-t pt-1.5 text-xs font-medium text-foreground">
                            Total
                            <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                              {chartType === 'jumlah'
                                ? item.payload.breeding_jumlah +
                                  item.payload.fattening_jumlah +
                                  item.payload.complete_jumlah +
                                  item.payload.silase_jumlah
                                : item.payload.breeding_harga +
                                  item.payload.fattening_harga +
                                  item.payload.complete_harga +
                                  item.payload.silase_harga}
                              <span className="font-normal text-muted-foreground">
                                kg
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  />
                }
              />
              <Bar
                dataKey={`breeding_${chartType}`}
                fill="var(--color-breeding_jumlah)"
                radius={4}
              />
              <Bar
                dataKey={`fattening_${chartType}`}
                fill="var(--color-fattening_jumlah)"
                radius={4}
              />
              <Bar
                dataKey={`complete_${chartType}`}
                fill="var(--color-complete_jumlah)"
                radius={4}
              />
              <Bar
                dataKey={`silase_${chartType}`}
                fill="var(--color-silase_jumlah)"
                radius={4}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-1 lg:col-span-2">
        <CardHeader className="flex flex-col items-stretch border-b px-4 pb-4 sm:flex-row">
          <div className="flex flex-1 flex-col justify-center gap-1">
            <CardTitle className="text-xl">Pembelian Pertahun</CardTitle>
            <CardDescription className="text-lg">
              Tren pembelian pakan per tahun
            </CardDescription>
          </div>
          <div className="relative">
            <select
              value={yearlyChartType}
              onChange={(e) =>
                setYearlyChartType(
                  e.target.value as
                    | 'jumlah'
                    | 'harga'
                    | 'rata_jumlah'
                    | 'rata_harga',
                )
              }
              className="cursor-pointer appearance-none rounded-md border border-border bg-background px-3 py-2 pr-8 text-base text-foreground transition-colors hover:bg-muted"
            >
              <option value="jumlah">Jumlah (kg)</option>
              <option value="harga">Harga (Rp)</option>
              <option value="rata_jumlah">Rata-rata Jumlah (kg)</option>
              <option value="rata_harga">Rata-rata Harga (Rp)</option>
            </select>
            <ChevronDown className="pointer-events-none absolute top-5 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </CardHeader>
        <CardContent>
          <ChartContainer config={yearlyChartConfig}>
            <BarChart
              accessibilityLayer
              data={yearlyData}
              layout="vertical"
              margin={{
                right: 16,
              }}
            >
              <CartesianGrid vertical={true} />
              <YAxis
                dataKey="label"
                type="category"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
                hide
              />
              <XAxis dataKey={yearlyChartType} type="number" hide />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    className="w-[180px]"
                    labelFormatter={(value: string) => {
                      return value.charAt(0).toUpperCase() + value.slice(1)
                    }}
                    formatter={(value, name) => (
                      <>
                        <div
                          className="h-2.5 w-2.5 shrink-0 rounded-[2px] bg-(--color-bg)"
                          style={
                            {
                              '--color-bg': `var(--color-${name})`,
                            } as React.CSSProperties
                          }
                        />
                        {chartConfig[name as keyof typeof chartConfig]?.label ||
                          name
                            .toString()
                            .replace(/_/g, ' ')
                            .replace(/^./, (c) => c.toUpperCase())}
                        <div className="ml-auto flex items-baseline gap-0.5 font-mono font-medium text-foreground tabular-nums">
                          {yearlyChartType === 'harga' ||
                          yearlyChartType === 'rata_harga' ? (
                            <span className="font-normal text-muted-foreground">
                              {new Intl.NumberFormat('id-ID', {
                                style: 'currency',
                                currency: 'IDR',
                                maximumFractionDigits: 0,
                              }).format(Number(value))}
                            </span>
                          ) : (
                            <span className="font-normal text-muted-foreground">
                              {value} kg
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  />
                }
              />
              <Bar
                dataKey={yearlyChartType}
                layout="vertical"
                fill={`var(--color-${yearlyChartType})`}
                radius={4}
              >
                <LabelList
                  dataKey="label"
                  position="insideLeft"
                  offset={8}
                  className="fill-(--color-label) text-lg"
                  fontSize={12}
                  formatter={(name: string) => {
                    return (
                      name.toString().charAt(0).toUpperCase() +
                      name.toString().slice(1)
                    )
                  }}
                />
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
