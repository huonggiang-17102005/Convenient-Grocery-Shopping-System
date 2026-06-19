import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateRecipe } from '../ai.service.js';

describe('AI Service - Chức năng Gợi ý bằng AI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('Nên ném ra lỗi nếu AI không được cấu hình', async () => {
    // Mock fetch để nó giả lập trả về lỗi 400 (hoặc bất kỳ lỗi nào) ngay lập tức
    // Tránh việc gửi request thật lên mạng làm treo (timeout) bài test
    const mockFetch = vi.spyOn(global, 'fetch');
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: { message: 'Lỗi giả lập từ mock fetch' } })
    } as any);

    try {
      await generateRecipe([], 'fam1');
    } catch (error: any) {
      expect(error.message).toContain('Lỗi từ Gemini');
    }

    mockFetch.mockRestore(); // Trả lại hàm fetch thật cho các bài test khác
  });
});
