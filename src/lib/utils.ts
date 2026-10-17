import { db } from './db';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
};

export const exportDB = async (): Promise<string> => {
  const data = {
    categories: await db.categories.toArray(),
    menuItems: await db.menuItems.toArray(),
    orders: await db.orders.toArray(),
    settings: await db.settings.toArray(),
    customers: await db.customers.toArray(),
  };
  return JSON.stringify(data);
};

export const importDB = async (jsonString: string): Promise<void> => {
  try {
    const data = JSON.parse(jsonString);
    await db.transaction('rw', db.categories, db.menuItems, db.orders, db.settings, db.customers, async () => {
      // Clear existing
      await db.categories.clear();
      await db.menuItems.clear();
      await db.orders.clear();
      await db.settings.clear();
      await db.customers.clear();

      // Import new
      if (data.categories) await db.categories.bulkAdd(data.categories);
      if (data.menuItems) await db.menuItems.bulkAdd(data.menuItems);
      if (data.orders) await db.orders.bulkAdd(data.orders);
      if (data.settings) await db.settings.bulkAdd(data.settings);
      if (data.customers) await db.customers.bulkAdd(data.customers);
    });
  } catch (err) {
    console.error('Failed to import database', err);
    throw new Error('فرمت فایل بکاپ نامعتبر است.');
  }
};
