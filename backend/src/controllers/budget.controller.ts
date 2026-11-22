import { Response, NextFunction } from 'express';
import { BudgetService } from '../services/budget.service';
import { AuthenticatedRequest } from '../types';

export class BudgetController {
  public static async getBudgets(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const now = new Date();
      const month = req.query.month ? parseInt(req.query.month as string, 10) : now.getUTCMonth() + 1;
      const year = req.query.year ? parseInt(req.query.year as string, 10) : now.getUTCFullYear();

      const budgets = await BudgetService.getBudgetsWithProgress(userId, month, year);
      res.status(200).json({
        success: true,
        data: budgets,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createOrUpdateBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const budget = await BudgetService.createOrUpdateBudget(userId, req.body);
      res.status(200).json({
        success: true,
        message: 'Budget saved successfully',
        data: budget,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteBudget(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const result = await BudgetService.deleteBudget(userId, req.params.id);
      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}
