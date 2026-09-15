import { PrismaClient } from "@prisma/client";
import {
  BalanceItemType,
  IncomePattern,
  InvestmentGoal,
  RiskTolerance,
  TransactionCategory,
  TransactionType,
} from "@prisma/client";
import { hash } from "bcryptjs";
import Decimal from "decimal.js";

const prisma = new PrismaClient();
const demoEmail = "demo@pocketwise.local";
const demoPassword = "pocketwise-demo-2026";

type TransactionSeed = Readonly<{
  amount: string;
  type: TransactionType;
  category: TransactionCategory;
  note: string;
  day: number;
  hour?: number;
  isRecurring?: boolean;
}>;

type BalanceSeed = Readonly<{
  name: string;
  type: BalanceItemType;
  valuation: string;
}>;

type MutualFundSeed = Readonly<{
  amfiCode: string;
  name: string;
  category: string;
  riskLevel: RiskTolerance;
}>;

function utcDate(day: number, hour = 9): Date {
  return new Date(Date.UTC(2026, 0, day, hour));
}

const expenseRows: readonly (readonly [
  string,
  TransactionCategory,
  string,
  number,
  number,
])[] = [
  ["180.00", TransactionCategory.TRANSPORT, "Metro card top-up", 5, 8],
  ["260.00", TransactionCategory.NUTRITION, "Weekday lunch", 6, 13],
  ["320.00", TransactionCategory.EDUCATION, "Course notes", 7, 17],
  ["240.00", TransactionCategory.TRANSPORT, "Cab share", 8, 20],
  ["420.00", TransactionCategory.NUTRITION, "Groceries", 9, 19],
  ["1850.00", TransactionCategory.SHOPPING, "Weekend clothes shopping", 10, 16],
  ["1250.00", TransactionCategory.NUTRITION, "Dinner with friends", 11, 21],
  ["210.00", TransactionCategory.TRANSPORT, "Bus pass", 12, 9],
  ["290.00", TransactionCategory.NUTRITION, "Cafe study session", 13, 15],
  ["360.00", TransactionCategory.EDUCATION, "Mock test subscription", 14, 18],
  ["2350.00", TransactionCategory.SHOPPING, "Weekend electronics accessory", 17, 18],
  ["980.00", TransactionCategory.NUTRITION, "Sunday brunch", 18, 12],
  ["275.00", TransactionCategory.TRANSPORT, "Auto rides", 20, 19],
  ["410.00", TransactionCategory.NUTRITION, "Midweek groceries", 22, 19],
  ["1450.00", TransactionCategory.OTHER, "Weekend movie and snacks", 24, 22],
  ["720.00", TransactionCategory.NUTRITION, "Family lunch", 25, 14],
];

const transactions: readonly TransactionSeed[] = [
  {
    amount: "45000.00",
    type: TransactionType.INCOME,
    category: TransactionCategory.SALARY,
    note: "Monthly stipend",
    day: 1,
    isRecurring: true,
  },
  {
    amount: "12000.00",
    type: TransactionType.INCOME,
    category: TransactionCategory.FREELANCE,
    note: "Landing page project",
    day: 10,
  },
  {
    amount: "9500.00",
    type: TransactionType.EXPENSE,
    category: TransactionCategory.HOME,
    note: "Rent contribution",
    day: 2,
    isRecurring: true,
  },
  ...expenseRows.map(([amount, category, note, day, hour]) => ({
    amount,
    type: TransactionType.EXPENSE,
    category,
    note,
    day,
    hour,
  })),
];

const balanceItems: readonly BalanceSeed[] = [
  { name: "Index Mutual Fund", type: BalanceItemType.ASSET, valuation: "185000.00" },
  { name: "Emergency Fund", type: BalanceItemType.ASSET, valuation: "65000.00" },
  { name: "Liquid Savings Account", type: BalanceItemType.ASSET, valuation: "42000.00" },
  { name: "Education Loan", type: BalanceItemType.LIABILITY, valuation: "88000.00" },
  { name: "Credit Card Balance", type: BalanceItemType.LIABILITY, valuation: "7400.00" },
];

const mutualFunds: readonly MutualFundSeed[] = [
  {
    amfiCode: "119091",
    name: "HDFC Liquid Fund - Direct Plan - Growth Option",
    category: "Liquid",
    riskLevel: RiskTolerance.LOW,
  },
  {
    amfiCode: "120389",
    name: "Axis Liquid Fund - Direct Plan - Growth Option",
    category: "Liquid",
    riskLevel: RiskTolerance.LOW,
  },
  {
    amfiCode: "120716",
    name: "UTI Nifty 50 Index Fund - Direct Plan - Growth",
    category: "Large Cap / Index",
    riskLevel: RiskTolerance.LOW,
  },
  {
    amfiCode: "119551",
    name: "Axis Bluechip Fund - Direct Plan - Growth",
    category: "Large Cap / Index",
    riskLevel: RiskTolerance.LOW,
  },
  {
    amfiCode: "119528",
    name: "Aditya Birla Sun Life Large Cap Fund - Direct Plan - Growth",
    category: "Large Cap / Index",
    riskLevel: RiskTolerance.MEDIUM,
  },
  {
    amfiCode: "122639",
    name: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
    category: "Flexi Cap",
    riskLevel: RiskTolerance.MEDIUM,
  },
  {
    amfiCode: "141925",
    name: "Axis Flexi Cap Fund - Direct Plan - Growth Option",
    category: "Flexi Cap",
    riskLevel: RiskTolerance.MEDIUM,
  },
  {
    amfiCode: "120505",
    name: "Axis Midcap Fund - Direct Plan - Growth Option",
    category: "Mid Cap",
    riskLevel: RiskTolerance.HIGH,
  },
  {
    amfiCode: "147622",
    name: "Motilal Oswal Nifty Midcap 150 Index Fund - Direct Plan - Growth",
    category: "Mid Cap",
    riskLevel: RiskTolerance.HIGH,
  },
  {
    amfiCode: "118778",
    name: "Nippon India Small Cap Fund - Direct Plan - Growth Option",
    category: "Small Cap",
    riskLevel: RiskTolerance.HIGH,
  },
  {
    amfiCode: "125497",
    name: "SBI Small Cap Fund - Direct Plan - Growth",
    category: "Small Cap",
    riskLevel: RiskTolerance.HIGH,
  },
];

const portfolioDefaults = {
  riskLevel: RiskTolerance.MEDIUM,
  goalHorizon: InvestmentGoal.MEDIUM_TERM,
  fdAllocation: 40,
  mfAllocation: 40,
  bondAllocation: 20,
} as const;

async function main(): Promise<void> {
  const passwordHash = await hash(demoPassword, 12);
  const targetSavingsAmount = new Decimal(120000).toFixed(2);
  const profileDefaults = {
    incomePattern: IncomePattern.VARIABLE,
    primaryFinancialGoal: "Emergency Fund",
    targetSavingsAmount,
    age: 27,
    gender: "Prefer not to say",
    monthlyIncome: new Decimal(57000).toFixed(2),
    baselineMonthlyExpenses: new Decimal(22000).toFixed(2),
    isOnboarded: true,
  };

  const user = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Pocketwise Demo",
      passwordHash,
      image: null,
      profile: { upsert: { update: profileDefaults, create: profileDefaults } },
      portfolio: {
        upsert: { update: portfolioDefaults, create: portfolioDefaults },
      },
    },
    create: {
      name: "Pocketwise Demo",
      email: demoEmail,
      passwordHash,
      profile: { create: profileDefaults },
      portfolio: { create: portfolioDefaults },
    },
  });

  await prisma.transaction.deleteMany({ where: { userId: user.id } });
  await prisma.balanceItem.deleteMany({ where: { userId: user.id } });
  await prisma.transaction.createMany({
    data: transactions.map((transaction) => ({
      userId: user.id,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      note: transaction.note,
      date: utcDate(transaction.day, transaction.hour),
      isRecurring: transaction.isRecurring ?? false,
    })),
  });
  await prisma.balanceItem.createMany({
    data: balanceItems.map((item) => ({ userId: user.id, ...item })),
  });

  await prisma.mutualFund.deleteMany();
  await Promise.all(
    mutualFunds.map((fund) =>
      prisma.mutualFund.upsert({
        where: { amfiCode: fund.amfiCode },
        update: fund,
        create: fund,
      }),
    ),
  );

  console.info(`Seeded demo account: ${demoEmail}`);
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
