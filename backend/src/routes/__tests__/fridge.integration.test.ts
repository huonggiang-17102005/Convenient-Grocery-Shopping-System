import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Setup JWT token giả lập để test authenticateToken
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const mockUser = { id: 'user1', email: 'test@gmail.com', family_id: 'family1', role: 'homemaker' };
const testToken = jwt.sign({ id: mockUser.id }, JWT_SECRET);

const mockFridgeItems = [
  { id: 'item1', family_id: 'family1', name: 'Đậu phụ', quantity: 2, unit: 'bìa', category: 'Thịt cá' }
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

describe('Fridge Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryChain.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    });
  });

  describe('GET /api/fridge/family/:familyId', () => {
    it('Nên trả về 200 và danh sách thực phẩm trong tủ khi truyền token hợp lệ', async () => {
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho getFamilyFridge
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockFridgeItems, error: null }).then(onFulfilled);
      });

      const response = await request(app)
        .get('/api/fridge/family/family1')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data[0].name).toBe('Đậu phụ');
    });
  });

  describe('POST /api/fridge', () => {
    it('Nên trả về 201 và tạo mới thực phẩm trong tủ thành công', async () => {
      const newItem = {
        family_id: 'family1',
        name: 'Thịt bò',
        quantity: 500,
        unit: 'g',
        category: 'Thịt cá',
        expiration_date: '2026-06-30'
      };
      
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho insert item thành công
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({
          data: { id: 'new_item_id', ...newItem },
          error: null
        }).then(onFulfilled);
      });

      const response = await request(app)
        .post('/api/fridge')
        .set('Authorization', `Bearer ${testToken}`)
        .send(newItem);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('new_item_id');
      expect(response.body.data.name).toBe('Thịt bò');
    });
  });
});
