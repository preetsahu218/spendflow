import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { AppError } from '../middleware/errorHandler.middleware';
import { DebtSimplificationService } from './debtSimplification.service';
import { MemberBalance, SplitInput } from '../types';

export class GroupService {
  public static async createGroup(userId: string, data: { name: string; description?: string; currency?: string }) {
    const inviteCode = crypto.randomBytes(4).toString('hex').toUpperCase();

    const group = await prisma.group.create({
      data: {
        name: data.name,
        description: data.description || null,
        currency: data.currency || 'USD',
        inviteCode,
        createdById: userId,
        members: {
          create: {
            userId,
            role: 'ADMIN',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        groupId: group.id,
        userId,
        action: 'CREATED_GROUP',
        details: `Group "${group.name}" was created`,
      },
    });

    return group;
  }

  public static async getUserGroups(userId: string) {
    const groups = await prisma.group.findMany({
      where: {
        members: {
          some: { userId },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        _count: {
          select: { expenses: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return groups;
  }

  public static async getGroupById(groupId: string, userId: string) {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatar: true },
            },
          },
        },
        expenses: {
          include: {
            paidBy: { select: { id: true, name: true, email: true } },
            splits: {
              include: {
                user: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { date: 'desc' },
        },
        settlements: {
          include: {
            payer: { select: { id: true, name: true } },
            payee: { select: { id: true, name: true } },
          },
          orderBy: { date: 'desc' },
        },
        activities: {
          include: {
            user: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 30,
        },
      },
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    const isMember = group.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('You are not a member of this group', 403);
    }

    return group;
  }

  public static async joinGroupByInviteCode(userId: string, inviteCode: string) {
    const group = await prisma.group.findUnique({
      where: { inviteCode: inviteCode.trim().toUpperCase() },
      include: { members: true },
    });

    if (!group) {
      throw new AppError('Invalid group invite code', 404);
    }

    const alreadyMember = group.members.some((m) => m.userId === userId);
    if (alreadyMember) {
      throw new AppError('You are already a member of this group', 400);
    }

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId,
        role: 'MEMBER',
      },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });

    await prisma.activityLog.create({
      data: {
        groupId: group.id,
        userId,
        action: 'MEMBER_JOINED',
        details: `${user?.name || 'A new member'} joined the group`,
      },
    });

    return group;
  }

  public static async addSharedExpense(
    groupId: string,
    currentUserId: string,
    data: {
      amount: number;
      description: string;
      date?: string;
      category?: string;
      splitType?: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
      notes?: string | null;
      paidById?: string;
      splits: SplitInput[];
    }
  ) {
    // Check group membership
    const membership = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId: currentUserId,
        },
      },
    });

    if (!membership) {
      throw new AppError('You are not a member of this group', 403);
    }

    const paidById = data.paidById || currentUserId;
    const splitType = data.splitType || 'EQUAL';

    // Verify all split participants are members of the group
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      select: { userId: true },
    });
    const memberIdSet = new Set(members.map((m) => m.userId));

    for (const split of data.splits) {
      if (!memberIdSet.has(split.userId)) {
        throw new AppError(`User ${split.userId} is not a member of this group`, 400);
      }
    }

    // Compute splits with penny precision
    const calculatedSplits = DebtSimplificationService.calculateSplits(
      data.amount,
      splitType,
      data.splits
    );

    // Save transaction in database
    const sharedExpense = await prisma.sharedExpense.create({
      data: {
        groupId,
        paidById,
        amount: data.amount,
        description: data.description,
        date: data.date ? new Date(data.date) : new Date(),
        category: data.category || 'General',
        splitType,
        notes: data.notes || null,
        splits: {
          create: calculatedSplits.map((s) => ({
            userId: s.userId,
            amountOwed: s.amountOwed,
            percentage: s.percentage ?? null,
            shares: s.shares ?? null,
          })),
        },
      },
      include: {
        paidBy: { select: { id: true, name: true, email: true } },
        splits: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        groupId,
        userId: currentUserId,
        action: 'CREATED_EXPENSE',
        details: `Added "${data.description}" for ${data.amount.toFixed(2)} (${splitType} split)`,
      },
    });

    return sharedExpense;
  }

  public static async calculateGroupBalances(groupId: string, userId: string) {
    // 1. Fetch all members
    const members = await prisma.groupMember.findMany({
      where: { groupId },
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
      },
    });

    const isMember = members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new AppError('You are not a member of this group', 403);
    }

    const userNames = new Map<string, string>();
    const totalPaidMap = new Map<string, number>();
    const totalOwedMap = new Map<string, number>();

    members.forEach((m) => {
      userNames.set(m.userId, m.user.name);
      totalPaidMap.set(m.userId, 0);
      totalOwedMap.set(m.userId, 0);
    });

    // 2. Fetch all shared expenses and their splits
    const expenses = await prisma.sharedExpense.findMany({
      where: { groupId },
      include: { splits: true },
    });

    for (const exp of expenses) {
      // Payer contributed full amount
      const currPaid = totalPaidMap.get(exp.paidById) || 0;
      totalPaidMap.set(exp.paidById, currPaid + exp.amount);

      // Each participant owes their split
      for (const split of exp.splits) {
        const currOwed = totalOwedMap.get(split.userId) || 0;
        totalOwedMap.set(split.userId, currOwed + split.amountOwed);
      }
    }

    // 3. Fetch all settled payments to offset balances
    const settlements = await prisma.settlement.findMany({
      where: { groupId, status: 'SETTLED' },
    });

    for (const set of settlements) {
      // Payer settled part of debt -> counts towards what payer paid
      const currPayerPaid = totalPaidMap.get(set.payerId) || 0;
      totalPaidMap.set(set.payerId, currPayerPaid + set.amount);

      // Payee received settlement -> counts towards what payee owed/received
      const currPayeeOwed = totalOwedMap.get(set.payeeId) || 0;
      totalOwedMap.set(set.payeeId, currPayeeOwed + set.amount);
    }

    // 4. Construct Net Balance Map: net = totalPaid - totalOwed
    const netBalanceMap = new Map<string, number>();
    const memberBalances: MemberBalance[] = [];

    members.forEach((m) => {
      const paid = Math.round((totalPaidMap.get(m.userId) || 0) * 100) / 100;
      const owed = Math.round((totalOwedMap.get(m.userId) || 0) * 100) / 100;
      const net = Math.round((paid - owed) * 100) / 100;

      netBalanceMap.set(m.userId, net);
      memberBalances.push({
        userId: m.userId,
        userName: m.user.name,
        totalPaid: paid,
        totalOwed: owed,
        netBalance: net,
      });
    });

    // 5. Execute Min-Cash-Flow Debt Simplification Algorithm
    const simplifiedTransactions = DebtSimplificationService.simplifyDebts(netBalanceMap, userNames);

    return {
      memberBalances,
      simplifiedTransactions,
    };
  }

  public static async recordSettlement(
    groupId: string,
    payerId: string,
    data: { payeeId: string; amount: number; date?: string; notes?: string }
  ) {
    if (payerId === data.payeeId) {
      throw new AppError('You cannot settle a payment with yourself', 400);
    }

    // Check membership of both
    const members = await prisma.groupMember.findMany({
      where: {
        groupId,
        userId: { in: [payerId, data.payeeId] },
      },
      include: { user: { select: { name: true } } },
    });

    if (members.length !== 2) {
      throw new AppError('Both payer and payee must be members of the group', 400);
    }

    const payer = members.find((m) => m.userId === payerId)?.user;
    const payee = members.find((m) => m.userId === data.payeeId)?.user;

    const settlement = await prisma.settlement.create({
      data: {
        groupId,
        payerId,
        payeeId: data.payeeId,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        notes: data.notes || null,
        status: 'SETTLED',
      },
      include: {
        payer: { select: { id: true, name: true } },
        payee: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        groupId,
        userId: payerId,
        action: 'SETTLED_DEBT',
        details: `${payer?.name} paid ${data.amount.toFixed(2)} to ${payee?.name}`,
      },
    });

    return settlement;
  }
}
