import { settingsRepository } from '../repositories/settings.repository';

export const settingsService = {
  /** What the storefront needs to know. Safe to show anyone. */
  async getPublic() {
    const { cancellationAllowed } = await settingsRepository.get();
    return { cancellationAllowed };
  },

  /** Whether an order placed now can be cancelled. Recorded on the checkout and the order. */
  async isCancellationAllowed() {
    return (await settingsRepository.get()).cancellationAllowed;
  },

  /** Affects orders placed from now on; each existing order keeps the setting it was bought under. */
  async setCancellationAllowed(cancellationAllowed: boolean, adminId: string | null) {
    const settings = await settingsRepository.setCancellationAllowed(cancellationAllowed, adminId);
    return { cancellationAllowed: settings.cancellationAllowed };
  },
};
