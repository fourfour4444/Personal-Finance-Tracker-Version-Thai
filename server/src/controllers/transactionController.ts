import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getTransactions = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const {
      page = '1',
      limit = '20',
      startDate,
      endDate,
      categoryId,
      type,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Build where clause
    const where: any = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate as string);
      if (endDate) where.date.lte = new Date(endDate as string);
    }

    if (categoryId) where.categoryId = categoryId as string;
    if (type) where.type = type as string;

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy as string] = sortOrder as string;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: { category: true },
        orderBy,
        skip,
        take: limitNum,
      }),
      prisma.transaction.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        transactions,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { type, amount, description, date, categoryId } = req.body;

    if (!type || !amount || !description || !date || !categoryId) {
      throw new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400);
    }

    if (amount <= 0) {
      throw new AppError('จำนวนเงินต้องมากกว่า 0', 400);
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new AppError('ไม่พบหมวดหมู่ที่เลือก', 404);
    }

    const transaction = await prisma.transaction.create({
      data: {
        type,
        amount: parseFloat(amount),
        description,
        date: new Date(date),
        categoryId,
        userId,
      },
      include: { category: true },
    });

    res.status(201).json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const updateTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const { type, amount, description, date, categoryId } = req.body;

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('ไม่พบรายการนี้', 404);
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(type && { type }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(date && { date: new Date(date) }),
        ...(categoryId && { categoryId }),
      },
      include: { category: true },
    });

    res.json({
      status: 'success',
      data: { transaction },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId },
    });
    if (!existing) {
      throw new AppError('ไม่พบรายการนี้', 404);
    }

    await prisma.transaction.delete({ where: { id } });

    res.json({
      status: 'success',
      message: 'ลบรายการสำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    const where: any = { userId };
    if (Object.keys(dateFilter).length > 0) {
      where.date = dateFilter;
    }

    // Total income and expense
    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = incomeResult._sum.amount || 0;
    const totalExpense = expenseResult._sum.amount || 0;
    const balance = totalIncome - totalExpense;

    // Expense by category
    const expenseByCategory = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { ...where, type: 'EXPENSE' },
      _sum: { amount: true },
    });

    // Get category details
    const categoryIds = expenseByCategory.map((e) => e.categoryId);
    const categories = await prisma.category.findMany({
      where: { id: { in: categoryIds } },
    });

    const categoryMap = new Map(categories.map((c) => [c.id, c]));
    const expenseByCategoryWithDetails = expenseByCategory.map((e) => ({
      category: categoryMap.get(e.categoryId),
      amount: e._sum.amount || 0,
    }));

    // Monthly income vs expense (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: sixMonthsAgo },
      },
      select: { type: true, amount: true, date: true },
    });

    // Group by month
    const monthlyData: Record<string, { income: number; expense: number }> = {};
    const thaiMonths = [
      'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
      'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.',
    ];

    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const label = `${thaiMonths[d.getMonth()]} ${d.getFullYear() + 543}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    for (const t of monthlyTransactions) {
      const d = new Date(t.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (monthlyData[key]) {
        if (t.type === 'INCOME') {
          monthlyData[key].income += t.amount;
        } else {
          monthlyData[key].expense += t.amount;
        }
      }
    }

    const monthlyComparison = Object.entries(monthlyData).map(([key, data]) => {
      const [year, month] = key.split('-');
      const monthIndex = parseInt(month, 10) - 1;
      return {
        month: `${thaiMonths[monthIndex]}`,
        income: data.income,
        expense: data.expense,
      };
    });

    // Recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
      take: 5,
    });

    res.json({
      status: 'success',
      data: {
        totalIncome,
        totalExpense,
        balance,
        expenseByCategory: expenseByCategoryWithDetails,
        monthlyComparison,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};
