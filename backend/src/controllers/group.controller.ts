import { Response, NextFunction } from 'express';
import { GroupService } from '../services/group.service';
import { AuthenticatedRequest } from '../types';

export class GroupController {
  public static async createGroup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const group = await GroupService.createGroup(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Group created successfully',
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getUserGroups(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const groups = await GroupService.getUserGroups(userId);
      res.status(200).json({
        success: true,
        data: groups,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getGroupById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const group = await GroupService.getGroupById(req.params.id, userId);
      res.status(200).json({
        success: true,
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async joinGroup(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { inviteCode } = req.body;
      const group = await GroupService.joinGroupByInviteCode(userId, inviteCode);
      res.status(200).json({
        success: true,
        message: 'Joined group successfully',
        data: group,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async addSharedExpense(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const expense = await GroupService.addSharedExpense(req.params.id, userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Shared expense added successfully',
        data: expense,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async getGroupBalances(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const balances = await GroupService.calculateGroupBalances(req.params.id, userId);
      res.status(200).json({
        success: true,
        data: balances,
      });
    } catch (error) {
      next(error);
    }
  }

  public static async recordSettlement(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const payerId = req.user!.id;
      const settlement = await GroupService.recordSettlement(req.params.id, payerId, req.body);
      res.status(201).json({
        success: true,
        message: 'Settlement recorded successfully',
        data: settlement,
      });
    } catch (error) {
      next(error);
    }
  }
}
