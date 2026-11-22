import { Response, NextFunction } from 'express';
import { prisma } from '../config/prisma';
import { AuthenticatedRequest } from '../types';
import { AppError } from '../middleware/errorHandler.middleware';

export class CategoryController {
  public static async getCategories(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const categories = await prisma.category.findMany({
        where: {
          OR: [{ userId }, { userId: null }],
        },
        orderBy: [{ type: 'asc' }, { name: 'asc' }],
      });

      res.status(200).json({
        success: true,
        data: categories,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async createCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { name, type, icon, color } = req.body;

      if (!name) {
        throw new AppError('Category name is required', 400);
      }

      const category = await prisma.category.create({
        data: {
          name,
          type: type || 'EXPENSE',
          icon: icon || 'tag',
          color: color || '#6366f1',
          userId,
          isDefault: false,
        },
      });

      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async deleteCategory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const category = await prisma.category.findFirst({
        where: { id, userId },
      });

      if (!category) {
        throw new AppError('Category not found or cannot delete default categories', 404);
      }

      await prisma.category.delete({
        where: { id },
      });

      res.status(200).json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}
