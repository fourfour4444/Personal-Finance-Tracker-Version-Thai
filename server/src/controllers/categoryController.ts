import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getCategories = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId;

    // Get default categories + user's custom categories
    const categories = await prisma.category.findMany({
      where: {
        OR: [{ isDefault: true }, { userId }],
      },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    });

    res.json({
      status: 'success',
      data: { categories },
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, icon, color, type } = req.body;

    if (!name || !icon || !color || !type) {
      throw new AppError('กรุณากรอกข้อมูลให้ครบถ้วน', 400);
    }

    const category = await prisma.category.create({
      data: { name, icon, color, type, userId, isDefault: false },
    });

    res.status(201).json({
      status: 'success',
      data: { category },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const category = await prisma.category.findFirst({
      where: { id, userId, isDefault: false },
    });

    if (!category) {
      throw new AppError('ไม่พบหมวดหมู่นี้ หรือไม่สามารถลบหมวดหมู่เริ่มต้นได้', 404);
    }

    // Check if category is in use
    const transactionCount = await prisma.transaction.count({
      where: { categoryId: id },
    });

    if (transactionCount > 0) {
      throw new AppError(
        `ไม่สามารถลบได้ มีรายการ ${transactionCount} รายการใช้หมวดหมู่นี้อยู่`,
        400
      );
    }

    await prisma.category.delete({ where: { id } });

    res.json({
      status: 'success',
      message: 'ลบหมวดหมู่สำเร็จ',
    });
  } catch (error) {
    next(error);
  }
};
