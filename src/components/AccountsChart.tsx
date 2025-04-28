"use client";
import { Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { formatAmount } from "../../utils/utils";

const CustomToolTip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: any[];
}) => {
  if (!active || !payload || payload.length === 0) return null;

  const { account, balance, fill } = payload[0].payload;

  return (
    <div className="flex flex-col gap-1 p-1.5 rounded-sm border-[1px] border-gray-100 bg-white custom-shadow">
      <div className="flex items-center gap-1.5">
        <div
          className="h-2 aspect-square rounded-xs"
          style={{ backgroundColor: fill }}
        />
        <span>{account}</span>
      </div>
      <span className="text-base font-semibold text-gray-700">
        {formatAmount(balance)}
      </span>
    </div>
  );
};

function generateColor(index: number, total: number, isNegative: boolean) {
  const baseHue = isNegative ? 0 : 210; // Red for negative, Blue for positive
  const saturation = 85;
  const lightness = 45 + index * (30 / total); // 45% - 75%

  return `hsl(${baseHue}, ${saturation}%, ${Math.min(lightness, 85)}%)`;
}

export function AccountsChart({
  accounts,
}: {
  accounts: { id: string; balance: number }[];
}) {
  const chartData =
    accounts?.map((account, index) => ({
      account: account.id,
      balance: Math.abs(account.balance),
      fill: generateColor(index, accounts.length, account.balance < 0),
    })) ?? [];

  const chartConfig: ChartConfig = {};

  accounts?.forEach((account, index) => {
    chartConfig[account.id] = {
      label: account.id,
      color: generateColor(index, accounts.length, account.balance < 0),
    };
  });

  return chartData.length === 0 ? (
    <div className="h-[150px] aspect-square flex justify-center items-center">
      <div className="h-[120px] aspect-square rounded-full bg-gray-200 flex justify-center items-center">
        <div className="h-[80px] aspect-square rounded-full bg-white" />
      </div>
    </div>
  ) : (
    <ChartContainer
      config={chartConfig}
      className="mx-auto aspect-square h-[120px] md:h-[150px]"
    >
      <PieChart>
        <ChartTooltip
          cursor={false}
          // content={<ChartTooltipContent hideLabel />}
          content={<CustomToolTip />}
        />
        <Pie
          data={chartData}
          dataKey="balance"
          nameKey="account"
          innerRadius={30}
        />
      </PieChart>
    </ChartContainer>
  );
}
