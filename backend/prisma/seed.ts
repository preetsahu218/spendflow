import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { DebtSimplificationService } from '../src/services/debtSimplification.service';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seeding...');

  // Clean existing tables in reverse dependency order
  await prisma.activityLog.deleteMany();
  await prisma.settlement.deleteMany();
  await prisma.expenseSplit.deleteMany();
  await prisma.sharedExpense.deleteMany();
  await prisma.groupMember.deleteMany();
  await prisma.group.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.expense.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('Password123!', salt);

  // 1. Create Demo Users
  const alex = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex@capstone.edu',
      password: hashedPassword,
      currency: 'USD',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: 'Bob Chen',
      email: 'bob@capstone.edu',
      password: hashedPassword,
      currency: 'USD',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    },
  });

  const clara = await prisma.user.create({
    data: {
      name: 'Clara Vance',
      email: 'clara@capstone.edu',
      password: hashedPassword,
      currency: 'USD',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    },
  });

  console.log('✅ Created demo users: Alex, Bob, Clara');

  // 2. Categories for Alex
  const categoriesData = [
    { name: 'Housing & Rent', type: 'EXPENSE', icon: 'home', color: '#3b82f6' },
    { name: 'Food & Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#10b981' },
    { name: 'Dining & Drinks', type: 'EXPENSE', icon: 'utensils', color: '#f59e0b' },
    { name: 'Transportation', type: 'EXPENSE', icon: 'car', color: '#8b5cf6' },
    { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'zap', color: '#ef4444' },
    { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#ec4899' },
    { name: 'Healthcare', type: 'EXPENSE', icon: 'heart-pulse', color: '#14b8a6' },
    { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#22c55e' },
    { name: 'Freelance & Projects', type: 'INCOME', icon: 'laptop', color: '#06b6d4' },
  ];

  const alexCategories: Record<string, any> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: {
        ...cat,
        userId: alex.id,
        isDefault: true,
      },
    });
    alexCategories[cat.name] = created;
  }

  // 3. Realistic Personal Expenses for Alex spanning past 3 months
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth(); // 0-indexed

  const dateDaysAgo = (daysAgo: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    return d;
  };

  const personalTransactions = [
    // Income
    { amount: 4800, type: 'INCOME', cat: 'Salary', desc: 'Monthly Software Engineer Salary', date: dateDaysAgo(22), method: 'BANK_TRANSFER' },
    { amount: 1200, type: 'INCOME', cat: 'Freelance & Projects', desc: 'Mobile App Consulting Project', date: dateDaysAgo(15), method: 'BANK_TRANSFER' },
    { amount: 4800, type: 'INCOME', cat: 'Salary', desc: 'Monthly Software Engineer Salary', date: dateDaysAgo(52), method: 'BANK_TRANSFER' },
    { amount: 4800, type: 'INCOME', cat: 'Salary', desc: 'Monthly Software Engineer Salary', date: dateDaysAgo(82), method: 'BANK_TRANSFER' },

    // Housing
    { amount: 1250, type: 'EXPENSE', cat: 'Housing & Rent', desc: 'Monthly Apartment Rent Share', date: dateDaysAgo(23), method: 'BANK_TRANSFER' },
    { amount: 1250, type: 'EXPENSE', cat: 'Housing & Rent', desc: 'Monthly Apartment Rent Share', date: dateDaysAgo(53), method: 'BANK_TRANSFER' },
    { amount: 1250, type: 'EXPENSE', cat: 'Housing & Rent', desc: 'Monthly Apartment Rent Share', date: dateDaysAgo(83), method: 'BANK_TRANSFER' },

    // Food & Groceries
    { amount: 135.5, type: 'EXPENSE', cat: 'Food & Groceries', desc: 'Trader Joes Weekly Grocery Run', date: dateDaysAgo(3), method: 'CARD' },
    { amount: 89.2, type: 'EXPENSE', cat: 'Food & Groceries', desc: 'Fresh Produce & Pantry Restock', date: dateDaysAgo(10), method: 'CARD' },
    { amount: 142.1, type: 'EXPENSE', cat: 'Food & Groceries', desc: 'Whole Foods Organic Groceries', date: dateDaysAgo(18), method: 'CARD' },
    { amount: 98.4, type: 'EXPENSE', cat: 'Food & Groceries', desc: 'Supermarket supplies', date: dateDaysAgo(34), method: 'CARD' },
    { amount: 110.0, type: 'EXPENSE', cat: 'Food & Groceries', desc: 'Costco bulk food', date: dateDaysAgo(65), method: 'CARD' },

    // Dining & Drinks
    { amount: 64.0, type: 'EXPENSE', cat: 'Dining & Drinks', desc: 'Dinner with college friends at Ramen Bar', date: dateDaysAgo(2), method: 'CARD' },
    { amount: 28.5, type: 'EXPENSE', cat: 'Dining & Drinks', desc: 'Blue Bottle Coffee & Breakfast Pastry', date: dateDaysAgo(7), method: 'CARD' },
    { amount: 85.0, type: 'EXPENSE', cat: 'Dining & Drinks', desc: 'Sushi Dinner & Sake', date: dateDaysAgo(14), method: 'CARD' },
    { amount: 42.0, type: 'EXPENSE', cat: 'Dining & Drinks', desc: 'Pizza night with team', date: dateDaysAgo(40), method: 'CARD' },

    // Transportation
    { amount: 75.0, type: 'EXPENSE', cat: 'Transportation', desc: 'Metro Transit Card Monthly Reload', date: dateDaysAgo(12), method: 'CARD' },
    { amount: 34.2, type: 'EXPENSE', cat: 'Transportation', desc: 'Uber ride from Airport terminal', date: dateDaysAgo(6), method: 'CARD' },
    { amount: 45.0, type: 'EXPENSE', cat: 'Transportation', desc: 'Gas refill at Shell station', date: dateDaysAgo(25), method: 'CARD' },

    // Utilities & Bills
    { amount: 65.0, type: 'EXPENSE', cat: 'Utilities & Bills', desc: 'High-speed Fiber Internet bill', date: dateDaysAgo(16), method: 'CARD' },
    { amount: 82.4, type: 'EXPENSE', cat: 'Utilities & Bills', desc: 'Electric & Gas utility bill', date: dateDaysAgo(20), method: 'BANK_TRANSFER' },
    { amount: 50.0, type: 'EXPENSE', cat: 'Utilities & Bills', desc: 'Mobile phone cellular service', date: dateDaysAgo(19), method: 'CARD' },

    // Entertainment
    { amount: 19.99, type: 'EXPENSE', cat: 'Entertainment', desc: 'Netflix 4K Streaming Subscription', date: dateDaysAgo(5), method: 'CARD', recurring: true },
    { amount: 10.99, type: 'EXPENSE', cat: 'Entertainment', desc: 'Spotify Premium Music Subscription', date: dateDaysAgo(8), method: 'CARD', recurring: true },
    { amount: 69.99, type: 'EXPENSE', cat: 'Entertainment', desc: 'Steam Video Game purchase', date: dateDaysAgo(26), method: 'CARD' },
  ];

  for (const t of personalTransactions) {
    const category = alexCategories[t.cat];
    if (category) {
      await prisma.expense.create({
        data: {
          userId: alex.id,
          categoryId: category.id,
          amount: t.amount,
          type: t.type,
          description: t.desc,
          date: t.date,
          paymentMethod: t.method,
          isRecurring: t.recurring || false,
          recurrenceInterval: t.recurring ? 'MONTHLY' : null,
        },
      });
    }
  }

  console.log(`✅ Seeded ${personalTransactions.length} personal transactions for Alex`);

  // 4. Budgets for Alex for Current Month
  const currentMonthNum = currentMonth + 1;
  const budgetLimits = [
    { cat: 'Housing & Rent', limit: 1300, threshold: 90 },
    { cat: 'Food & Groceries', limit: 500, threshold: 80 },
    { cat: 'Dining & Drinks', limit: 250, threshold: 80 },
    { cat: 'Transportation', limit: 180, threshold: 75 },
    { cat: 'Utilities & Bills', limit: 220, threshold: 80 },
    { cat: 'Entertainment', limit: 150, threshold: 80 },
  ];

  for (const b of budgetLimits) {
    const category = alexCategories[b.cat];
    if (category) {
      await prisma.budget.create({
        data: {
          userId: alex.id,
          categoryId: category.id,
          month: currentMonthNum,
          year: currentYear,
          amountLimit: b.limit,
          alertThreshold: b.threshold,
        },
      });
    }
  }

  console.log('✅ Seeded current month budgets with alert thresholds');

  // 5. Shared Group: Apartment 402 Roommates
  const group = await prisma.group.create({
    data: {
      name: 'Apartment 402 Roommates',
      description: 'Shared rent, groceries, household items & utilities',
      currency: 'USD',
      inviteCode: 'APT402',
      createdById: alex.id,
      members: {
        create: [
          { userId: alex.id, role: 'ADMIN' },
          { userId: bob.id, role: 'MEMBER' },
          { userId: clara.id, role: 'MEMBER' },
        ],
      },
    },
  });

  // Shared Expense 1: October Apartment Rent ($2400 split EQUAL among Alex, Bob, Clara)
  const rentSplits = DebtSimplificationService.calculateSplits(2400, 'EQUAL', [
    { userId: alex.id },
    { userId: bob.id },
    { userId: clara.id },
  ]);

  await prisma.sharedExpense.create({
    data: {
      groupId: group.id,
      paidById: alex.id,
      amount: 2400,
      description: 'Monthly Apartment Rent (October)',
      category: 'Rent',
      splitType: 'EQUAL',
      date: dateDaysAgo(20),
      splits: {
        create: rentSplits.map((s) => ({
          userId: s.userId,
          amountOwed: s.amountOwed,
        })),
      },
    },
  });

  // Shared Expense 2: Costco Household Supplies & Bulk Groceries ($360 paid by Bob, PERCENTAGE split)
  const grocerySplits = DebtSimplificationService.calculateSplits(360, 'PERCENTAGE', [
    { userId: alex.id, percentage: 40 }, // $144
    { userId: bob.id, percentage: 30 },  // $108
    { userId: clara.id, percentage: 30 }, // $108
  ]);

  await prisma.sharedExpense.create({
    data: {
      groupId: group.id,
      paidById: bob.id,
      amount: 360,
      description: 'Costco Bulk Groceries & Kitchen Supplies',
      category: 'Groceries',
      splitType: 'PERCENTAGE',
      date: dateDaysAgo(11),
      splits: {
        create: grocerySplits.map((s) => ({
          userId: s.userId,
          amountOwed: s.amountOwed,
          percentage: s.percentage,
        })),
      },
    },
  });

  // Shared Expense 3: High-speed Fiber Internet ($90 paid by Alex, EQUAL split)
  const internetSplits = DebtSimplificationService.calculateSplits(90, 'EQUAL', [
    { userId: alex.id },
    { userId: bob.id },
    { userId: clara.id },
  ]);

  await prisma.sharedExpense.create({
    data: {
      groupId: group.id,
      paidById: alex.id,
      amount: 90,
      description: 'High-speed Fiber Internet (1 Gbps)',
      category: 'Utilities',
      splitType: 'EQUAL',
      date: dateDaysAgo(8),
      splits: {
        create: internetSplits.map((s) => ({
          userId: s.userId,
          amountOwed: s.amountOwed,
        })),
      },
    },
  });

  // Shared Expense 4: Board Game Night Pizza & Craft Beer ($120 paid by Clara, SHARES split: Alex 2 shares, Bob 1 share, Clara 1 share)
  const gameNightSplits = DebtSimplificationService.calculateSplits(120, 'SHARES', [
    { userId: alex.id, shares: 2 },  // 2/4 = 50% = $60
    { userId: bob.id, shares: 1 },   // 1/4 = 25% = $30
    { userId: clara.id, shares: 1 }, // 1/4 = 25% = $30
  ]);

  await prisma.sharedExpense.create({
    data: {
      groupId: group.id,
      paidById: clara.id,
      amount: 120,
      description: 'Board Game Night Pizza & Craft Beer',
      category: 'Entertainment',
      splitType: 'SHARES',
      date: dateDaysAgo(4),
      splits: {
        create: gameNightSplits.map((s) => ({
          userId: s.userId,
          amountOwed: s.amountOwed,
          shares: s.shares,
        })),
      },
    },
  });

  // 6. Record a Settlement: Bob pays Alex $400 towards rent
  await prisma.settlement.create({
    data: {
      groupId: group.id,
      payerId: bob.id,
      payeeId: alex.id,
      amount: 400.0,
      date: dateDaysAgo(6),
      notes: 'Partial payment for October rent via Venmo',
      status: 'SETTLED',
    },
  });

  // 7. Activity Logs
  await prisma.activityLog.createMany({
    data: [
      { groupId: group.id, userId: alex.id, action: 'CREATED_GROUP', details: 'Created group "Apartment 402 Roommates"', createdAt: dateDaysAgo(25) },
      { groupId: group.id, userId: bob.id, action: 'MEMBER_JOINED', details: 'Bob Chen joined the group', createdAt: dateDaysAgo(24) },
      { groupId: group.id, userId: clara.id, action: 'MEMBER_JOINED', details: 'Clara Vance joined the group', createdAt: dateDaysAgo(24) },
      { groupId: group.id, userId: alex.id, action: 'CREATED_EXPENSE', details: 'Added "Monthly Apartment Rent (October)" for $2400.00 (EQUAL split)', createdAt: dateDaysAgo(20) },
      { groupId: group.id, userId: bob.id, action: 'CREATED_EXPENSE', details: 'Added "Costco Bulk Groceries & Kitchen Supplies" for $360.00 (PERCENTAGE split)', createdAt: dateDaysAgo(11) },
      { groupId: group.id, userId: alex.id, action: 'CREATED_EXPENSE', details: 'Added "High-speed Fiber Internet (1 Gbps)" for $90.00 (EQUAL split)', createdAt: dateDaysAgo(8) },
      { groupId: group.id, userId: bob.id, action: 'SETTLED_DEBT', details: 'Bob Chen paid $400.00 to Alex Rivera', createdAt: dateDaysAgo(6) },
      { groupId: group.id, userId: clara.id, action: 'CREATED_EXPENSE', details: 'Added "Board Game Night Pizza & Craft Beer" for $120.00 (SHARES split)', createdAt: dateDaysAgo(4) },
    ],
  });

  console.log('✅ Seeded shared group, expenses with 4 split types, settlement, and audit logs');
  console.log('🎉 Seeding successfully completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
