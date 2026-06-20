import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Setup JWT token giả lập để test authenticateToken
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const mockUser = { id: 'user1', email: 'test@gmail.com', family_id: 'family1', role: 'homemaker' };
const testToken = jwt.sign({ id: mockUser.id }, JWT_SECRET);

const mockRecipes = [
  { id: 'recipe1', name: 'Canh Chua Cá', author_id: null, visibility: 'Public', created_at: new Date().toISOString() }
];

// Định nghĩa mock chain thông qua vi.hoisted để Vitest hoist lên trước vi.mock
const { mockQueryChain } = vi.hoisted(() => {
  return {
    mockQueryChain: {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      is: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockReturnThis(),
      // Phương thức then giả lập Promise để bất kỳ kết thúc chain nào await cũng thành công
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

describe('Recipes Router Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockQueryChain.then.mockImplementation((onFulfilled) => {
      return Promise.resolve({ data: [], error: null }).then(onFulfilled);
    });
  });

  describe('GET /api/recipes/system', () => {
    it('Nên trả về 401 khi không truyền Token xác thực', async () => {
      const response = await request(app).get('/api/recipes/system');
      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Không tìm thấy Token xác thực');
    });

    it('Nên trả về 200 và danh sách công thức hệ thống khi có Token hợp lệ', async () => {
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho getSystemRecipes select recipes
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockRecipes, error: null }).then(onFulfilled);
      });
      // 3. Mock cho user_favorite_recipes select
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: [], error: null }).then(onFulfilled);
      });

      const response = await request(app)
        .get('/api/recipes/system')
        .set('Authorization', `Bearer ${testToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Canh Chua Cá');
    });
  });

  describe('POST /api/recipes', () => {
    it('Nên trả về 401 khi tạo công thức mà thiếu Token', async () => {
      const response = await request(app)
        .post('/api/recipes')
        .send({ name: 'Thịt kho trứng' });
      expect(response.status).toBe(401);
    });

    it('Nên trả về 201 và tạo công thức thành công khi truyền dữ liệu hợp lệ', async () => {
      // 1. Mock cho middleware authenticateToken tìm thấy user
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({ data: mockUser, error: null }).then(onFulfilled);
      });
      // 2. Mock cho insert recipe thành công
      mockQueryChain.then.mockImplementationOnce((onFulfilled) => {
        return Promise.resolve({
          data: {
            id: 'new_recipe_id',
            name: 'Thịt kho trứng',
            author_id: 'user1',
            visibility: 'Private',
            created_at: new Date().toISOString(),
            author: { id: 'user1', full_name: 'Người nấu chính' }
          },
          error: null
        }).then(onFulfilled);
      });

      const response = await request(app)
        .post('/api/recipes')
        .set('Authorization', `Bearer ${testToken}`)
        .send({
          name: 'Thịt kho trứng',
          cookTimeMinutes: 40,
          difficulty: 'Trung bình',
          servings: 4,
          ingredients: [],
          steps: []
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBe('new_recipe_id');
      expect(response.body.name).toBe('Thịt kho trứng');
      expect(response.body.author_id).toBe('user1');
    });
  });
});
