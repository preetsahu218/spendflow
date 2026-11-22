export interface User {
  id: string;
  email: string;
  name: string;
  currency: string;
  avatar?: string | null;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'EXPENSE' | 'INCOME';
  icon: string;
  color: string;
  isDefault: boolean;
}

export interface Expense {
  id: string;
  userId: string;
  categoryId: string;
  category: Category;
  amount: number;
  type: 'EXPENSE' | 'INCOME';
  description: string;
  date: string;
  paymentMethod: 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'OTHER';
  isRecurring: boolean;
  recurrenceInterval?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
  createdAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  month: number;
  year: number;
  amountLimit: number;
  alertThreshold: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'NORMAL' | 'WARNING' | 'EXCEEDED';
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'ADMIN' | 'MEMBER';
  joinedAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string | null;
  };
}

export interface ExpenseSplit {
  id: string;
  userId: string;
  amountOwed: number;
  percentage?: number | null;
  shares?: number | null;
  user: {
    id: string;
    name: string;
  };
}

export interface SharedExpense {
  id: string;
  groupId: string;
  paidById: string;
  paidBy: {
    id: string;
    name: string;
    email: string;
  };
  amount: number;
  description: string;
  date: string;
  category: string;
  splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES';
  notes?: string | null;
  splits: ExpenseSplit[];
}

export interface Settlement {
  id: string;
  groupId: string;
  payerId: string;
  payer: { id: string; name: string };
  payeeId: string;
  payee: { id: string; name: string };
  amount: number;
  date: string;
  notes?: string | null;
  status: 'SETTLED' | 'PENDING';
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
  user: { id: string; name: string };
}

export interface Group {
  id: string;
  name: string;
  description?: string | null;
  currency: string;
  inviteCode: string;
  createdById: string;
  createdAt: string;
  members: GroupMember[];
  expenses?: SharedExpense[];
  settlements?: Settlement[];
  activities?: ActivityLog[];
  _count?: {
    expenses: number;
  };
}

export interface MemberBalance {
  userId: string;
  userName: string;
  netBalance: number;
  totalPaid: number;
  totalOwed: number;
}

export interface DebtTransaction {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

export interface DashboardSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  savingsRate: number;
  spendingVelocity: {
    dailyRate: number;
    daysElapsed: number;
    daysInMonth: number;
    projectedMonthEnd: number;
  };
  sharedBalances: {
    owedToMe: number;
    iOwe: number;
    net: number;
  };
  recentExpenses: Expense[];
}

export interface CashFlowData {
  monthName: string;
  income: number;
  expense: number;
  net: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  name: string;
  color: string;
  total: number;
  count: number;
  percentage: number;
}
