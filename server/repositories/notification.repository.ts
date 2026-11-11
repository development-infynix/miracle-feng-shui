import prisma from '@/lib/prisma';
import type { NotificationKind } from '@/app/generated/prisma/client';

export interface NewNotification {
  kind: NotificationKind;
  title: string;
  body: string;
  link?: string | null;
}

/** Every query is scoped to its owner, so one customer can never read or change another's. */
export const notificationRepository = {
  async create(userId: string, data: NewNotification) {
    return prisma.notification.create({
      data: { userId, kind: data.kind, title: data.title, body: data.body, link: data.link ?? null },
    });
  },

  async listForUser(userId: string, take: number) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take,
      select: { id: true, kind: true, title: true, body: true, link: true, readAt: true, createdAt: true },
    });
  },

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, readAt: null } });
  },

  async markRead(userId: string, id?: string) {
    const { count } = await prisma.notification.updateMany({
      where: { userId, readAt: null, ...(id && { id }) },
      data: { readAt: new Date() },
    });
    return count;
  },

  async clearAll(userId: string) {
    const { count } = await prisma.notification.deleteMany({ where: { userId } });
    return count;
  },
};
