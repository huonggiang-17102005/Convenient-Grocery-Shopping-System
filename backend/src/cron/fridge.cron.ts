import cron from 'node-cron';
import * as fridgeRepo from '../repo/fridge.repo.js';
import * as inventoryLogRepo from '../repo/inventoryLog.repo.js';

export const runFridgeCronJob = () => {
  // Chạy vào lúc 00:00 mỗi ngày
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Bắt đầu chạy Cronjob kiểm tra thực phẩm hết hạn...');
      
      const expiredItems = await fridgeRepo.getExpiredUnwastedItems();
      
      if (expiredItems.length === 0) {
        console.log('Không có thực phẩm nào hết hạn cần ghi log.');
        return;
      }

      const itemIds: string[] = [];

      for (const item of expiredItems) {
        if (!item.family_id) continue;
        
        // Ghi log expire
        await inventoryLogRepo.insertLog(
          item.family_id,
          item.category || 'Khác',
          'expire',
          item.quantity,
          item.unit
        );

        itemIds.push(item.id);
      }

      // Đánh dấu đã phạt lãng phí để không bị ghi log đúp vào hôm sau
      if (itemIds.length > 0) {
        await fridgeRepo.markItemsAsWasted(itemIds);
        console.log(`Đã ghi log lãng phí (expire) cho ${itemIds.length} món đồ.`);
      }

    } catch (error) {
      console.error('Lỗi khi chạy Cronjob kiểm tra thực phẩm hết hạn:', error);
    }
  });
};
