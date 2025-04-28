"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { monthNames } from "@/constants/data";

const chartConfig = {
  amount: {
    label: "Amount",
    color: "var(--color-theme-d)",
  },
} satisfies ChartConfig;

export function BalanceChart({
  monthlyRecap,
  noTransactions,
}: {
  monthlyRecap: { month: string; amount: number }[];
  noTransactions?: boolean;
}) {
  if (monthlyRecap.length === 0) return;

  const chartData = monthlyRecap;
  // const chartData = [
  //   { month: "January", amount: 242.56 },
  //   { month: "February", amount: 142.56 },
  //   { month: "March", amount: 342.56 },
  //   { month: "April", amount: 142.56 },
  //   { month: "May", amount: 252.56 },
  //   { month: "June", amount: 222.56 },
  // ];

  const lastMonthDiff =
    monthlyRecap[monthlyRecap?.length - 1].amount -
    monthlyRecap[monthlyRecap?.length - 2].amount;

  const statusMessage = noTransactions
    ? "You don't have any transactions in the last six months on this account."
    : lastMonthDiff === 0
    ? "Your transaction activity is unchanged compared to last month."
    : lastMonthDiff < 0
    ? `You've spent $${Math.abs(lastMonthDiff)} less than last month.`
    : `You've spent $${lastMonthDiff} more than last month.`;

  return (
    <Card className="border-gray-100 shadow-none custom-shadow">
      <CardHeader>
        <CardTitle className="max-md:text-sm">
          Monthly spending summary
        </CardTitle>
        <CardDescription className="max-md:text-xs">
          {monthlyRecap[0].month}{" "}
          {monthlyRecap[0].month > monthlyRecap[monthlyRecap?.length - 1].month
            ? new Date().getFullYear() - 1
            : new Date().getFullYear()}{" "}
          - {monthNames[new Date().getMonth()]} {new Date().getFullYear()}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          className="h-[200px] w-full"
          config={chartConfig}
        >
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            {/* <YAxis/> */}
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="amount"
              type="natural"
              stroke="var(--color-theme-d)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-theme-d)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 max-md:text-xs text-sm">
        <div className="flex gap-2 font-medium leading-none">
          <span>{statusMessage}</span>
          <TrendingUp className="h-4 w-4" />
        </div>
        <span className="leading-none text-muted-foreground">
          Showing transaction summary for the last 6 months
        </span>
      </CardFooter>
    </Card>
  );
}
