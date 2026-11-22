import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma';
import { config } from '../config';
import { AppError } from '../middleware/errorHandler.middleware';
import { AuthenticatedUser } from '../types';

export class AuthService {
  public static async register(data: {
    name: string;
    email: string;
    password: string;
    currency?: string;
  }) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        password: hashedPassword,
        currency: data.currency || 'USD',
      },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        avatar: true,
        createdAt: true,
      },
    });

    // Seed default categories for new user
    await this.seedDefaultUserCategories(user.id);

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
    });

    return { user, token };
  }

  public static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      currency: user.currency,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        currency: user.currency,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
      token,
    };
  }

  public static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        avatar: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  public static async updateProfile(userId: string, data: { name?: string; currency?: string; avatar?: string | null }) {
    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        currency: true,
        avatar: true,
        createdAt: true,
      },
    });

    return updated;
  }

  public static generateToken(user: AuthenticatedUser): string {
    return jwt.sign(user, config.jwtSecret, {
      expiresIn: config.jwtExpiresIn as any,
    });
  }

  private static async seedDefaultUserCategories(userId: string) {
    const defaultCategories = [
      { name: 'Housing & Rent', type: 'EXPENSE', icon: 'home', color: '#3b82f6' },
      { name: 'Food & Groceries', type: 'EXPENSE', icon: 'shopping-cart', color: '#10b981' },
      { name: 'Dining & Drinks', type: 'EXPENSE', icon: 'utensils', color: '#f59e0b' },
      { name: 'Transportation', type: 'EXPENSE', icon: 'car', color: '#8b5cf6' },
      { name: 'Utilities & Bills', type: 'EXPENSE', icon: 'zap', color: '#ef4444' },
      { name: 'Entertainment', type: 'EXPENSE', icon: 'film', color: '#ec4899' },
      { name: 'Healthcare', type: 'EXPENSE', icon: 'heart-pulse', color: '#14b8a6' },
      { name: 'Shopping', type: 'EXPENSE', icon: 'shopping-bag', color: '#6366f1' },
      { name: 'Salary', type: 'INCOME', icon: 'briefcase', color: '#22c55e' },
      { name: 'Freelance & Projects', type: 'INCOME', icon: 'laptop', color: '#06b6d4' },
      { name: 'Investments', type: 'INCOME', icon: 'trending-up', color: '#84cc16' },
    ];

    await prisma.category.createMany({
      data: defaultCategories.map((c) => ({
        ...c,
        userId,
        isDefault: true,
      })),
    });
  }
}
