import Dexie, { Table } from 'dexie';

export interface Category {
  id?: number;
  name: string;
}

export interface MenuItem {
  id?: number;
  categoryId: number;
  name: string;
  price: number;
  isActive: boolean;
  image?: string;
}

export interface OrderItem {
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Order {
  id?: number;
  invoiceNumber: number;
  createdAt: Date;
  customerPhone: string;
  customerName?: string;
  customerSubscriptionCode?: string;
  customerAddress?: string;
  items: OrderItem[];
  subtotal: number;
  discountType: 'none' | 'percent' | 'amount';
  discountValue: number;
  taxEnabled: boolean;
  taxPercentage: number;
  taxAmount: number;
  total: number;
  status: 'paid' | 'cancelled';
}

export interface Customer {
  id?: number;
  phone: string;
  name: string;
  subscriptionCode: string; // کد اشتراک
  address: string; // آدرس مشتری جهت غذاهای بیرون بر
  createdAt: Date;
}

export interface AppSettings {
  id?: number;
  restaurantName: string;
  phone: string;
  address: string;
  website: string;
  instagram: string;
  telegram: string;
  logoUrl: string;
  taxEnabled: boolean;
  taxPercentage: number;
  requireCustomerPhone: boolean;
}

export class POSDatabase extends Dexie {
  categories!: Table<Category>;
  menuItems!: Table<MenuItem>;
  orders!: Table<Order>;
  settings!: Table<AppSettings>;
  customers!: Table<Customer>;

  constructor() {
    super('RestaurantPOSDB');
    this.version(1).stores({
      categories: '++id, name',
      menuItems: '++id, categoryId, name',
      orders: '++id, invoiceNumber, createdAt, status',
      settings: '++id'
    });
    this.version(2).stores({
      categories: '++id, name',
      menuItems: '++id, categoryId, name',
      orders: '++id, invoiceNumber, createdAt, status',
      settings: '++id'
    }).upgrade(tx => {
      tx.table('settings').toCollection().modify(setting => {
        if (setting.taxEnabled === undefined) setting.taxEnabled = false;
        if (setting.taxPercentage === undefined) setting.taxPercentage = 0;
      });
      tx.table('orders').toCollection().modify(order => {
        if (order.subtotal === undefined) order.subtotal = order.total;
        if (order.discountType === undefined) order.discountType = 'none';
        if (order.discountValue === undefined) order.discountValue = 0;
        if (order.taxEnabled === undefined) order.taxEnabled = false;
        if (order.taxPercentage === undefined) order.taxPercentage = 0;
        if (order.taxAmount === undefined) order.taxAmount = 0;
      });
    });
    this.version(3).stores({
      categories: '++id, name',
      menuItems: '++id, categoryId, name',
      orders: '++id, invoiceNumber, createdAt, status',
      settings: '++id'
    }).upgrade(tx => {
      tx.table('settings').toCollection().modify(setting => {
        if (setting.requireCustomerPhone === undefined) setting.requireCustomerPhone = false;
      });
    });
    this.version(4).stores({
      categories: '++id, name',
      menuItems: '++id, categoryId, name',
      orders: '++id, invoiceNumber, createdAt, status',
      settings: '++id'
    }).upgrade(tx => {
      tx.table('menuItems').toCollection().modify(item => {
        if (item.image === undefined) item.image = '';
      });
    });
    this.version(5).stores({
      categories: '++id, name',
      menuItems: '++id, categoryId, name',
      orders: '++id, invoiceNumber, createdAt, status',
      settings: '++id',
      customers: '++id, phone, name, subscriptionCode'
    }).upgrade(tx => {
      tx.table('orders').toArray().then(ordersList => {
        const uniquePhones = new Set<string>();
        ordersList.forEach(order => {
          if (order.customerPhone && order.customerPhone.trim()) {
            uniquePhones.add(order.customerPhone.trim());
          }
        });
        uniquePhones.forEach(phone => {
          tx.table('customers').add({
            phone,
            name: '',
            subscriptionCode: '',
            address: '',
            createdAt: new Date()
          });
        });
      });
    });
  }
}

export const db = new POSDatabase();
