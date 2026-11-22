import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler.middleware';

export class BudgetService {
  public static async createOrUpdateBudget(
    userId: string,
    data: {
      categoryId: string;
      month: number;
      year: number;
      amountLimit: number;
      alertThreshold?: number;
    }
  ) {
    const category = await prisma.category.findFirst({
      where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
    });

    if (!category) {
      throw new AppError('Category not found', 404);
    }

    const budget = await prisma.budget.upsert({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId: data.categoryId,
          month: data.month,
          year: data.year,
        },
      },
      update: {
        amountLimit: data.amountLimit,
        alertThreshold: data.alertThreshold ?? 80.0,
      },
      create: {
        userId,
        categoryId: data.categoryId,
        month: data.month,
        year: data.year,
        amountLimit: data.amountLimit,
        alertThreshold: data.alertThreshold ?? 80.0,
      },
      include: {
        category: true,
      },
    });

    return budget;
  }

  public static async getBudgetsWithProgress(userId: string, month: number, year: number) {
    // 1. Fetch all budgets configured for the user for the given month/year
    const budgets = await prisma.budget.findMany({
      where: {
        userId,
        month,
        year,
      },
      include: {
        category: true,
      },
    });

    // 2. Fetch spending for each budgeted category in this month
    const startOfMonth = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));

    const expenses = await prisma.expense.findMany({
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
    });

    // Group actual spending by category
    const categorySpending = new Map<string, number>();
    for (const exp of expenses) {
      const current = categorySpending.get(exp.categoryId) || 0;
      categorySpending.set(exp.categoryId, current + exp.amount);
    }

    // 3. Assemble progress metrics
    const results = budgets.map((b) => {
      const spent = categorySpending.get(b.categoryId) || 0;
      const roundedSpent = Math.round(spent * 100) / 100;
      const percentage = Math.round((roundedSpent / b.amountLimit) * 1000) / 10;
      const remaining = Math.round((b.amountLimit - roundedSpent) * 100) / 100;

      let status: 'NORMAL' | 'WARNING' | 'EXCEEDED' = 'NORMAL';
      if (percentage >= 100) {
        status = 'EXCEEDED';
      } else if (percentage >= b.alertThreshold) {
        status = 'WARNING';
      }

      return {
        id: b.id,
        categoryId: b.categoryId,
        categoryName: b.category.name,
        categoryColor: b.category.color,
        categoryIcon: b.category.icon,
        month: b.month,
        year: b.year,
        amountLimit: b.amountLimit,
        alertThreshold: b.alertThreshold,
        spent: roundedSpent,
        remaining,
        percentage,
        status,
      };
    });

    return results;
  }

  public static async deleteBudget(userId: string, budgetId: string) {
    const existing = await prisma.budget.findFirst({
      where: { id: budgetId, userId },
    });

    if (!existing) {
      throw new AppError('Budget not found', 404);
    }

    await prisma.budget.delete({
      where: { id: budgetId },
    });

    return { message: 'Budget deleted successfully' };
  }
}
