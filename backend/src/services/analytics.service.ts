import { prisma } from '../config/prisma';

export class AnalyticsService {
  public static async getDashboardSummary(userId: string) {
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth, 0, 23, 59, 59, 999));

    // 1. Current Month Expenses and Incomes
    const currentMonthTransactions = await prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    let monthlyIncome = 0;
    let monthlyExpense = 0;

    for (const t of currentMonthTransactions) {
      if (t.type === 'INCOME') {
        monthlyIncome += t.amount;
      } else {
        monthlyExpense += t.amount;
      }
    }

    // 2. All-Time Net Balance (Total Incomes - Total Expenses)
    const allExpenses = await prisma.expense.findMany({
      where: { userId },
      select: { amount: true, type: true },
    });

    let totalIncome = 0;
    let totalExpense = 0;
    for (const t of allExpenses) {
      if (t.type === 'INCOME') totalIncome += t.amount;
      else totalExpense += t.amount;
    }
    const totalBalance = Math.round((totalIncome - totalExpense) * 100) / 100;

    // 3. Shared Groups Net Balance
    // Sum what user is owed minus what user owes across all joined groups
    const userMemberships = await prisma.groupMember.findMany({
      where: { userId },
      select: { groupId: true },
    });

    let sharedNetOwedToMe = 0; // other people owe user
    let sharedNetIOwe = 0; // user owes other people

    for (const m of userMemberships) {
      const expenses = await prisma.sharedExpense.findMany({
        where: { groupId: m.groupId },
        include: { splits: true },
      });

      let paid = 0;
      let owed = 0;

      for (const exp of expenses) {
        if (exp.paidById === userId) paid += exp.amount;
        for (const sp of exp.splits) {
          if (sp.userId === userId) owed += sp.amountOwed;
        }
      }

      const settlements = await prisma.settlement.findMany({
        where: { groupId: m.groupId, status: 'SETTLED' },
      });

      for (const set of settlements) {
        if (set.payerId === userId) paid += set.amount;
        if (set.payeeId === userId) owed += set.amount;
      }

      const net = Math.round((paid - owed) * 100) / 100;
      if (net > 0) sharedNetOwedToMe += net;
      else if (net < 0) sharedNetIOwe += Math.abs(net);
    }

    // 4. Spending Velocity (Burn Rate)
    // Days elapsed in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    const currentDay = Math.max(1, now.getUTCDate());
    const dailySpendingRate = Math.round((monthlyExpense / currentDay) * 100) / 100;
    const projectedMonthEndExpense = Math.round((dailySpendingRate * daysInMonth) * 100) / 100;

    // 5. Recent 5 Transactions
    const recentExpenses = await prisma.expense.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    return {
      totalBalance,
      monthlyIncome: Math.round(monthlyIncome * 100) / 100,
      monthlyExpense: Math.round(monthlyExpense * 100) / 100,
      savingsRate: monthlyIncome > 0 ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 1000) / 10 : 0,
      spendingVelocity: {
        dailyRate: dailySpendingRate,
        daysElapsed: currentDay,
        daysInMonth,
        projectedMonthEnd: projectedMonthEndExpense,
      },
      sharedBalances: {
        owedToMe: Math.round(sharedNetOwedToMe * 100) / 100,
        iOwe: Math.round(sharedNetIOwe * 100) / 100,
        net: Math.round((sharedNetOwedToMe - sharedNetIOwe) * 100) / 100,
      },
      recentExpenses,
    };
  }

  public static async getCashFlowTrends(userId: string, monthsBack: number = 6) {
    const now = new Date();
    const trends: { monthName: string; income: number; expense: number; net: number }[] = [];

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = monthsBack - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
      const year = d.getUTCFullYear();
      const month = d.getUTCMonth(); // 0-indexed

      const start = new Date(Date.UTC(year, month, 1, 0, 0, 0));
      const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));

      const transactions = await prisma.expense.findMany({
        where: {
          userId,
          date: { gte: start, lte: end },
        },
      });

      let inc = 0;
      let exp = 0;

      for (const t of transactions) {
        if (t.type === 'INCOME') inc += t.amount;
        else exp += t.amount;
      }

      trends.push({
        monthName: `${monthNames[month]} ${year}`,
        income: Math.round(inc * 100) / 100,
        expense: Math.round(exp * 100) / 100,
        net: Math.round((inc - exp) * 100) / 100,
      });
    }

    return trends;
  }

  public static async getCategoryBreakdown(userId: string, month?: number, year?: number) {
    const now = new Date();
    const m = month || now.getUTCMonth() + 1;
    const y = year || now.getUTCFullYear();

    const start = new Date(Date.UTC(y, m - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(y, m, 0, 23, 59, 59, 999));

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: { gte: start, lte: end },
      },
      include: { category: true },
    });

    const categoryMap = new Map<string, { categoryId: string; name: string; color: string; total: number; count: number }>();

    for (const exp of expenses) {
      const cat = exp.category;
      const existing = categoryMap.get(cat.id);
      if (existing) {
        existing.total += exp.amount;
        existing.count += 1;
      } else {
        categoryMap.set(cat.id, {
          categoryId: cat.id,
          name: cat.name,
          color: cat.color,
          total: exp.amount,
          count: 1,
        });
      }
    }

    const totalExpense = Array.from(categoryMap.values()).reduce((sum, item) => sum + item.total, 0);

    const breakdown = Array.from(categoryMap.values())
      .map((item) => ({
        ...item,
        total: Math.round(item.total * 100) / 100,
        percentage: totalExpense > 0 ? Math.round((item.total / totalExpense) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      month: m,
      year: y,
      totalExpense: Math.round(totalExpense * 100) / 100,
      categories: breakdown,
    };
  }
}
