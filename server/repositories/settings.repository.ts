import prisma from '@/lib/prisma';

const ID = 1;

export const settingsRepository = {
  /** The settings row, made with the defaults if it's missing. */
  async get() {
    return prisma.storeSettings.upsert({ where: { id: ID }, update: {}, create: { id: ID } });
  },

  async setCancellationAllowed(cancellationAllowed: boolean, updatedById: string | null) {
    return prisma.storeSettings.upsert({
      where: { id: ID },
      update: { cancellationAllowed, updatedById },
      create: { id: ID, cancellationAllowed, updatedById },
    });
  },
};
