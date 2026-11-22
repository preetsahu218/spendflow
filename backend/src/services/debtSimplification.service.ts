import { DebtTransaction, MemberBalance } from '../types';

/**
 * Debt Simplification Service
 * Implements the Minimum Cash Flow Algorithm to minimize transactions among group participants.
 * 
 * Time Complexity: O(V log V) where V is the number of participants.
 * Space Complexity: O(V)
 */
export class DebtSimplificationService {
  /**
   * Simplifies debts among participants by computing net balances and
   * greedily matching the greatest debtor with the greatest creditor.
   * 
   * @param balances Map of userId -> net balance (positive = owed money, negative = owes money)
   * @param userNames Map of userId -> display name
   * @returns Array of optimized settlement transactions
   */
  public static simplifyDebts(
    balances: Map<string, number>,
    userNames: Map<string, string>
  ): DebtTransaction[] {
    const transactions: DebtTransaction[] = [];

    // Separate into debtors (net balance < 0) and creditors (net balance > 0)
    // Round to 2 decimal places to avoid floating point anomalies
    const debtors: { userId: string; amount: number }[] = [];
    const creditors: { userId: string; amount: number }[] = [];

    balances.forEach((bal, userId) => {
      const rounded = Math.round(bal * 100) / 100;
      if (rounded < -0.009) {
        debtors.push({ userId, amount: Math.abs(rounded) });
      } else if (rounded > 0.009) {
        creditors.push({ userId, amount: rounded });
      }
    });

    // Greedy matching
    while (debtors.length > 0 && creditors.length > 0) {
      // Sort to always pick the largest remaining debtor and creditor
      debtors.sort((a, b) => b.amount - a.amount);
      creditors.sort((a, b) => b.amount - a.amount);

      const debtor = debtors[0];
      const creditor = creditors[0];

      // Settle the minimum of what debtor owes and creditor is owed
      const settleAmount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;

      if (settleAmount > 0) {
        transactions.push({
          fromUserId: debtor.userId,
          fromUserName: userNames.get(debtor.userId) || 'Unknown User',
          toUserId: creditor.userId,
          toUserName: userNames.get(creditor.userId) || 'Unknown User',
          amount: settleAmount,
        });
      }

      debtor.amount = Math.round((debtor.amount - settleAmount) * 100) / 100;
      creditor.amount = Math.round((creditor.amount - settleAmount) * 100) / 100;

      if (debtor.amount <= 0.009) {
        debtors.shift();
      }
      if (creditor.amount <= 0.009) {
        creditors.shift();
      }
    }

    return transactions;
  }

  /**
   * Distributes total amount among members according to split method.
   * Handles 4 strategies: EQUAL, EXACT, PERCENTAGE, SHARES.
   * Ensures zero rounding loss by allocating remainder cents to the payer or first member.
   */
  public static calculateSplits(
    totalAmount: number,
    splitType: 'EQUAL' | 'EXACT' | 'PERCENTAGE' | 'SHARES',
    splits: { userId: string; amountOwed?: number; percentage?: number; shares?: number }[]
  ): { userId: string; amountOwed: number; percentage?: number; shares?: number }[] {
    const totalCents = Math.round(totalAmount * 100);
    const n = splits.length;

    if (n === 0) {
      throw new Error('At least one member must be included in splits');
    }

    switch (splitType) {
      case 'EQUAL': {
        const baseCents = Math.floor(totalCents / n);
        let remainder = totalCents % n;

        return splits.map((s) => {
          const cents = baseCents + (remainder > 0 ? 1 : 0);
          if (remainder > 0) remainder--;
          return {
            userId: s.userId,
            amountOwed: cents / 100,
          };
        });
      }

      case 'EXACT': {
        const sumGiven = splits.reduce((acc, s) => acc + Math.round((s.amountOwed || 0) * 100), 0);
        if (Math.abs(sumGiven - totalCents) > 1) {
          throw new Error(`Exact amounts sum to ${(sumGiven / 100).toFixed(2)}, which does not match total amount ${totalAmount.toFixed(2)}`);
        }
        return splits.map((s) => ({
          userId: s.userId,
          amountOwed: Math.round((s.amountOwed || 0) * 100) / 100,
        }));
      }

      case 'PERCENTAGE': {
        const totalPct = splits.reduce((acc, s) => acc + (s.percentage || 0), 0);
        if (Math.abs(totalPct - 100) > 0.01) {
          throw new Error(`Percentages sum to ${totalPct.toFixed(2)}%, which must equal 100%`);
        }

        let allocatedCents = 0;
        const result = splits.map((s, idx) => {
          if (idx === n - 1) {
            // Last member absorbs rounding remainder to ensure penny conservation
            const cents = totalCents - allocatedCents;
            return {
              userId: s.userId,
              percentage: s.percentage,
              amountOwed: cents / 100,
            };
          }
          const cents = Math.round((totalCents * (s.percentage || 0)) / 100);
          allocatedCents += cents;
          return {
            userId: s.userId,
            percentage: s.percentage,
            amountOwed: cents / 100,
          };
        });
        return result;
      }

      case 'SHARES': {
        const totalShares = splits.reduce((acc, s) => acc + (s.shares || 0), 0);
        if (totalShares <= 0) {
          throw new Error('Total shares must be greater than zero');
        }

        let allocatedCents = 0;
        const result = splits.map((s, idx) => {
          if (idx === n - 1) {
            const cents = totalCents - allocatedCents;
            return {
              userId: s.userId,
              shares: s.shares,
              amountOwed: cents / 100,
            };
          }
          const cents = Math.round((totalCents * (s.shares || 0)) / totalShares);
          allocatedCents += cents;
          return {
            userId: s.userId,
            shares: s.shares,
            amountOwed: cents / 100,
          };
        });
        return result;
      }

      default:
        throw new Error(`Unsupported split type: ${splitType}`);
    }
  }
}
