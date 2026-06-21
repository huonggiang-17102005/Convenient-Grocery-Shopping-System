import type { Response } from 'express';
import { BadRequestError } from '../errors/CommonError.js';

// Lưu trữ các kết nối theo định dạng: Map<familyId, Map<userId, Set<Response>>>
const sseClients = new Map<string, Map<string, Set<Response>>>();

export const addSSEClient = (familyId: string, userId: string, res: Response) => {
  if (!familyId) throw new BadRequestError('Thiếu familyId');
  if (!userId) throw new BadRequestError('Thiếu userId');

  if (!sseClients.has(familyId)) {
    sseClients.set(familyId, new Map<string, Set<Response>>());
  }

  const familyClients = sseClients.get(familyId)!;
  if (!familyClients.has(userId)) {
    familyClients.set(userId, new Set<Response>());
  }
  
  familyClients.get(userId)!.add(res);
  console.log(`[SSE] Client connected: user=${userId}, family=${familyId}`);
};

export const removeSSEClient = (familyId: string, userId: string, res: Response) => {
  if (!familyId || !userId) return;

  const familyClients = sseClients.get(familyId);
  if (familyClients) {
    const userClients = familyClients.get(userId);
    if (userClients) {
      userClients.delete(res);
      if (userClients.size === 0) {
        familyClients.delete(userId);
      }
    }
    if (familyClients.size === 0) {
      sseClients.delete(familyId);
    }
  }
};

export const broadcastToFamily = (familyId: string, eventType: string, payload: any) => {
  if (!familyId) return;

  const familyClients = sseClients.get(familyId);
  if (familyClients) {
    const data = JSON.stringify(payload);
    familyClients.forEach((userClients) => {
      userClients.forEach((res) => {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${data}\n\n`);
      });
    });
  }
};

export const broadcastToUser = (familyId: string, userId: string, eventType: string, payload: any) => {
  if (!familyId || !userId) return;

  const familyClients = sseClients.get(familyId);
  if (familyClients) {
    const userClients = familyClients.get(userId);
    if (userClients) {
      const data = JSON.stringify(payload);
      userClients.forEach((res) => {
        res.write(`event: ${eventType}\n`);
        res.write(`data: ${data}\n\n`);
      });
    }
  }
};
