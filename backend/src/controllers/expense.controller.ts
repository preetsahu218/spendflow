import { Response, NextFunction } from 'express';
import { ExpenseService } from '../services/expense.service';
import { AuthenticatedRequest } from '../types';

export class ExpenseController {
  public static async createExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const expense = await ExpenseService.createExpense(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Expense created successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpenses(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const query = req.query as any;

      const result = await ExpenseService.getExpenses({
        userId,
        startDate: query.startDate,
        endDate: query.endDate,
        categoryId: query.categoryId,
        type: query.type,
        search: query.search,
        page: query.page ? parseInt(query.page as string, 10) : 1,
        limit: query.limit ? parseInt(query.limit as string, 10) : 20,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result.expenses,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getExpenseById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const expense = await ExpenseService.getExpenseById(userId, req.params.id);
      res.status(200).json({
        success: true,
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async updateExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const updated = await ExpenseService.updateExpense(userId, req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Expense updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await ExpenseService.deleteExpense(userId, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async exportCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query as any;
      const csvData = await ExpenseService.exportCsv(userId, { startDate, endDate });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=expenses_${new Date().toISOString().split('T')[0]}.csv`);
      res.status(200).send(csvData);
    } catch (error) {
      next(error);
    }
  }
}
