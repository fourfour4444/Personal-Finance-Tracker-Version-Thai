import { PrismaClient, CategoryType } from '@prisma/client';

const prisma = new PrismaClient();

const defaultCategories = [
  // Expense categories
  { name: 'อาหาร', icon: '🍕', color: '#FF6B6B', type: CategoryType.EXPENSE },
  { name: 'เดินทาง', icon: '🚗', color: '#4ECDC4', type: CategoryType.EXPENSE },
  { name: 'ช็อปปิ้ง', icon: '🛍️', color: '#A78BFA', type: CategoryType.EXPENSE },
  { name: 'บันเทิง', icon: '🎬', color: '#F472B6', type: CategoryType.EXPENSE },
  { name: 'สุขภาพ', icon: '💊', color: '#34D399', type: CategoryType.EXPENSE },
  { name: 'ที่พัก', icon: '🏠', color: '#60A5FA', type: CategoryType.EXPENSE },
  { name: 'การศึกษา', icon: '📚', color: '#FBBF24', type: CategoryType.EXPENSE },
  { name: 'ค่าน้ำค่าไฟ', icon: '💡', color: '#F97316', type: CategoryType.EXPENSE },
  { name: 'อื่นๆ (รายจ่าย)', icon: '📦', color: '#94A3B8', type: CategoryType.EXPENSE },

  // Income categories
  { name: 'เงินเดือน', icon: '💰', color: '#10B981', type: CategoryType.INCOME },
  { name: 'งานฟรีแลนซ์', icon: '💻', color: '#06B6D4', type: CategoryType.INCOME },
  { name: 'การลงทุน', icon: '📈', color: '#8B5CF6', type: CategoryType.INCOME },
  { name: 'อื่นๆ (รายรับ)', icon: '🎁', color: '#14B8A6', type: CategoryType.INCOME },
];

async function main() {
  console.log('🌱 Seeding default categories...');

  for (const category of defaultCategories) {
    await prisma.category.upsert({
      where: { id: `default-${category.name}` },
      update: {},
      create: {
        id: `default-${category.name}`,
        name: category.name,
        icon: category.icon,
        color: category.color,
        type: category.type,
        isDefault: true,
        userId: null,
      },
    });
  }

  console.log(`✅ Seeded ${defaultCategories.length} default categories`);
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
