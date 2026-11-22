import { Request } from 'express';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  currency: string;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export interface SplitInput {
  userId: string;
  amountOwed?: number;
  percentage?: number;
  shares?: number;
}

export interface DebtTransaction {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface MemberBalance {
  userId: string;
  userName: string;
  netBalance: number; // positive = owed money, negative = owes money
  totalPaid: number;
  totalOwed: number;
}
