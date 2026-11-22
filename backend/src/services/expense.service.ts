import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler.middleware';

export interface ExpenseFilterOptions {
  userId: string;
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  type?: 'EXPENSE' | 'INCOME';
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class ExpenseService {
  public static async createExpense(userId: string, data: {
    amount: number;
    type?: string;
    categoryId: string;
    description: string;
    date?: string;
    paymentMethod?: string;
    isRecurring?: boolean;
    recurrenceInterval?: string | null;
    notes?: string | null;
    receiptUrl?: string | null;
  }) {
    // Validate category exists and is accessible by user
    const category = await prisma.category.findFirst({
      where: {
        id: data.categoryId,
        OR: [{ userId }, { userId: null }],
      },
    });

    if (!category) {
      throw new AppError('Category not found or inaccessible', 404);
    }

    const expense = await prisma.expense.create({
      data: {
        userId,
        categoryId: data.categoryId,
        amount: data.amount,
        type: data.type || category.type,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        paymentMethod: data.paymentMethod || 'CARD',
        isRecurring: data.isRecurring || false,
        recurrenceInterval: data.recurrenceInterval || null,
        notes: data.notes || null,
        receiptUrl: data.receiptUrl || null,
      },
      include: {
        category: true,
      },
    });

    return expense;
  }

  public static async getExpenses(options: ExpenseFilterOptions) {
    const {
      userId,
      startDate,
      endDate,
      categoryId,
      type,
      search,
      page = 1,
      limit = 20,
      sortBy = 'date',
      sortOrder = 'desc',
    } = options;

    const whereClause: any = { userId };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) whereClause.date.gte = new Date(startDate);
      if (endDate) whereClause.date.lte = new Date(endDate);
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { description: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const totalCount = await prisma.expense.count({ where: whereClause });
    const skip = (page - 1) * limit;

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: {
        category: true,
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: limit,
    });

    return {
      expenses,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  public static async getExpenseById(userId: string, expenseId: string) {
    const expense = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
      include: { category: true },
    });

    if (!expense) {
      throw new AppError('Expense not found', 404);
    }

    return expense;
  }

  public static async updateExpense(
    userId: string,
    expenseId: string,
    data: any
  ) {
    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!existing) {
      throw new AppError('Expense not found', 404);
    }

    if (data.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: data.categoryId, OR: [{ userId }, { userId: null }] },
      });
      if (!category) {
        throw new AppError('Category not found', 404);
      }
    }

    const updatePayload: any = { ...data };
    if (data.date) {
      updatePayload.date = new Date(data.date);
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: updatePayload,
      include: { category: true },
    });

    return updated;
  }

  public static async deleteExpense(userId: string, expenseId: string) {
    const existing = await prisma.expense.findFirst({
      where: { id: expenseId, userId },
    });

    if (!existing) {
      throw new AppError('Expense not found', 404);
    }

    await prisma.expense.delete({
      where: { id: expenseId },
    });

    return { message: 'Expense deleted successfully' };
  }

  public static async exportCsv(userId: string, options: { startDate?: string; endDate?: string }) {
    const whereClause: any = { userId };
    if (options.startDate || options.endDate) {
      whereClause.date = {};
      if (options.startDate) whereClause.date.gte = new Date(options.startDate);
      if (options.endDate) whereClause.date.lte = new Date(options.endDate);
    }

    const expenses = await prisma.expense.findMany({
      where: whereClause,
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const headers = ['ID', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method', 'Notes'];
    const rows = expenses.map((e) => [
      e.id,
      e.date.toISOString().split('T')[0],
      e.type,
      `"${e.category.name.replace(/"/g, '""')}"`,
      `"${e.description.replace(/"/g, '""')}"`,
      e.amount.toFixed(2),
      e.paymentMethod,
      `"${(e.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }
}
