import { DebtSimplificationService } from '../src/services/debtSimplification.service';

describe('DebtSimplificationService Unit Tests', () => {
  describe('Split Calculation Strategies', () => {
    it('should split equally and handle penny remainders properly', () => {
      // $100.00 split among 3 people: $33.34, $33.33, $33.33
      const splits = DebtSimplificationService.calculateSplits(100.0, 'EQUAL', [
        { userId: 'u1' },
        { userId: 'u2' },
        { userId: 'u3' },
      ]);

      expect(splits).toHaveLength(3);
      const sum = splits.reduce((acc, s) => acc + s.amountOwed, 0);
      expect(Math.round(sum * 100) / 100).toBe(100.0);
      expect(splits[0].amountOwed).toBe(33.34);
      expect(splits[1].amountOwed).toBe(33.33);
      expect(splits[2].amountOwed).toBe(33.33);
    });

    it('should validate exact amounts match the total amount', () => {
      const splits = DebtSimplificationService.calculateSplits(150.0, 'EXACT', [
        { userId: 'u1', amountOwed: 50.0 },
        { userId: 'u2', amountOwed: 100.0 },
      ]);

      expect(splits).toHaveLength(2);
      expect(splits[0].amountOwed).toBe(50.0);
      expect(splits[1].amountOwed).toBe(100.0);
    });

    it('should throw error when exact amounts do not match total', () => {
      expect(() => {
        DebtSimplificationService.calculateSplits(150.0, 'EXACT', [
          { userId: 'u1', amountOwed: 40.0 },
          { userId: 'u2', amountOwed: 100.0 },
        ]);
      }).toThrow();
    });

    it('should split by percentage with penny conservation', () => {
      // $300 split: 40%, 35%, 25%
      const splits = DebtSimplificationService.calculateSplits(300.0, 'PERCENTAGE', [
        { userId: 'u1', percentage: 40 },
        { userId: 'u2', percentage: 35 },
        { userId: 'u3', percentage: 25 },
      ]);

      expect(splits[0].amountOwed).toBe(120.0);
      expect(splits[1].amountOwed).toBe(105.0);
      expect(splits[2].amountOwed).toBe(75.0);
      const sum = splits.reduce((acc, s) => acc + s.amountOwed, 0);
      expect(sum).toBe(300.0);
    });

    it('should throw error if percentages do not sum to 100', () => {
      expect(() => {
        DebtSimplificationService.calculateSplits(100.0, 'PERCENTAGE', [
          { userId: 'u1', percentage: 50 },
          { userId: 'u2', percentage: 40 },
        ]);
      }).toThrow();
    });

    it('should split by shares properly', () => {
      // $120 split: 2 shares, 1 share, 1 share -> total 4 shares
      const splits = DebtSimplificationService.calculateSplits(120.0, 'SHARES', [
        { userId: 'u1', shares: 2 },
        { userId: 'u2', shares: 1 },
        { userId: 'u3', shares: 1 },
      ]);

      expect(splits[0].amountOwed).toBe(60.0);
      expect(splits[1].amountOwed).toBe(30.0);
      expect(splits[2].amountOwed).toBe(30.0);
    });
  });

  describe('Greedy Minimum Cash Flow Algorithm', () => {
    it('should simplify a 3-person cyclic debt into minimum transactions', () => {
      // Scenario:
      // Alice owes Bob $10
      // Bob owes Charlie $10
      // Net balances:
      // Alice: -10
      // Bob: +10 - 10 = 0
      // Charlie: +10
      // Min transactions needed: exactly 1 transaction (Alice pays Charlie $10)!
      const balances = new Map<string, number>();
      balances.set('alice', -10);
      balances.set('bob', 0);
      balances.set('charlie', 10);

      const names = new Map<string, string>();
      names.set('alice', 'Alice');
      names.set('bob', 'Bob');
      names.set('charlie', 'Charlie');

      const transactions = DebtSimplificationService.simplifyDebts(balances, names);

      expect(transactions).toHaveLength(1);
      expect(transactions[0]).toEqual({
        fromUserId: 'alice',
        fromUserName: 'Alice',
        toUserId: 'charlie',
        toUserName: 'Charlie',
        amount: 10,
      });
    });

    it('should simplify complex 4-person debt network', () => {
      // Net balances:
      // D1: -40, D2: -60 (Total debt: 100)
      // C1: +70, C2: +30 (Total credit: 100)
      const balances = new Map<string, number>();
      balances.set('d1', -40);
      balances.set('d2', -60);
      balances.set('c1', 70);
      balances.set('c2', 30);

      const names = new Map<string, string>();
      names.set('d1', 'Debtor 1');
      names.set('d2', 'Debtor 2');
      names.set('c1', 'Creditor 1');
      names.set('c2', 'Creditor 2');

      const transactions = DebtSimplificationService.simplifyDebts(balances, names);

      // Max transactions <= V - 1 = 3
      expect(transactions.length).toBeLessThanOrEqual(3);

      // Verify that total money moved equals total debt ($100)
      const totalMoved = transactions.reduce((acc, t) => acc + t.amount, 0);
      expect(Math.round(totalMoved * 100) / 100).toBe(100);
    });
  });
});
