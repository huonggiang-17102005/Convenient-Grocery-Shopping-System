import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Setup JWT token giả lập để test authenticateToken
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const mockUser = { id: 'user1', email: 'test@gmail.com', family_id: 'family1', role: 'homemaker' };
const testToken = jwt.sign({ id: mockUser.id }, JWT_SECRET);

const mockShoppingItems = [
  { id: 'shop_item_1', list_id: 'list_1', name: 'Đậu xanh', quantity: 1, unit: 'kg', is_bought: false }
];

// Định nghĩa mock chain thông qua vi.hoisted để Vitest hoist lên trước vi.mock
const { mockQueryChain } = vi.hoisted(() => {
  return {
    mockQueryChain: {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      lt: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      then: vi.fn().mockImplementation((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      })
    }
  };
});

// Mock Supabase Database Client
vi.mock('../../config/db.config.js', () => {
  return {
    default: {
      from: vi.fn().mockReturnValue(mockQueryChain),
    },
    testDBConnection: vi.fn(),
  };
});

import app from '../../app.js';

describe('Shopping List Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryChain.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    });
  });

  describe('GET /api/shopping-list/items', () => {
    it('Nên trả về 200 và danh sách mua sắm khi truyền token hợp lệ', async () => {
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho getActiveLists
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [{ id: 'list_1', family_id: 'family1' }], error: null }).then(onFulfilled);
      });
      // 3. Mock cho getShoppingItems select items
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockShoppingItems, error: null }).then(onFulfilled);
      });

      const response = await request(app)
        .get('/api/shopping-list/items')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body[0].name).toBe('Đậu xanh');
      expect(response.body[0].isBought).toBe(false);
    });
  });

  describe('POST /api/shopping-list/items', () => {
    it('Nên trả về 201 và tạo mới mặt hàng mua sắm thành công', async () => {
      const newItem = { name: 'Sữa tươi', quantity: 2, unit: 'hộp', category: 'Chất lỏng' };
      
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho getOrCreateShoppingList
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: { id: 'list_1', family_id: 'family1' }, error: null }).then(onFulfilled);
      });
      // 3. Mock cho insert shopping item thành công
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({
          data: { id: 'new_shop_item_id', list_id: 'list_1', ...newItem, is_bought: false },
          error: null
        }).then(onFulfilled);
      });

      const response = await request(app)
        .post('/api/shopping-list/items')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new_shop_item_id');
      expect(response.body.name).toBe('Sữa tươi');
      expect(response.body.isBought).toBe(false);
    });
  });
});
