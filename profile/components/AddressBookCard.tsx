'use client';

import React, { useEffect, useState } from 'react';
import { useLocale } from '@/context/CurrencyContext';
import {
  createAddress,
  deleteAddress,
  listAddresses,
  setPrimaryAddress,
  updateAddress,
  type AddressInput,
  type SavedAddress,
} from '@/lib/address';
import AddressDetailsDrawer from './AddressDetailsDrawer';
import {
  card,
  CardHeading,
  FormError,
  focusRing,
  primaryButton,
  primaryLabel,
  skeleton,
  smallButton,
  smallLabel,
  textButton,
  textLabel,
} from './profileUi';
import type { CustomerProfile } from './ProfileView';

export default function AddressBookCard({ profile }: { profile: CustomerProfile }) {
  const { t } = useLocale();
  const [addresses, setAddresses] = useState<SavedAddress[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [actionError, setActionError] = useState('');

  const [drawerOpen, setDrawerOpen] = useState(false);
  // Stays set after closing, so the form is still there while the drawer slides out.
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null);
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    let active = true;
    listAddresses()
      .then((list) => {
        if (!active) return;
        setAddresses(list);
        setLoadFailed(false);
      })
      .catch(() => {
        if (active) setLoadFailed(true);
      });
    return () => {
      active = false;
    };
  }, [attempt]);

  const refresh = async () => setAddresses(await listAddresses());

  const run = async (action: () => Promise<unknown>) => {
    setActionError('');
    try {
      await action();
      await refresh();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t('profile.save_failed', "Couldn't save your details. Please try again."));
    }
  };

  const openDrawer = (address: SavedAddress | null) => {
    setEditingAddress(address);
    setFormKey((value) => value + 1);
    setDrawerOpen(true);
  };

  const blank: AddressInput = {
    type: 'Home',
    isPrimary: false,
    name: profile.name,
    phone: profile.phone ?? '',
    line1: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
  };

  const saveFromDrawer = async (address: AddressInput) => {
    if (editingAddress) {
      const { isPrimary: _primary, ...changes } = address;
      await updateAddress(editingAddress.id, { ...changes, line2: changes.line2 ?? '' });
    } else {
      await createAddress(address);
    }
    await refresh();
    setDrawerOpen(false);
  };

  return (
    <section className={card}>
      <CardHeading
        action={
          addresses && addresses.length > 0 && (
            <button type="button" onClick={() => openDrawer(null)} className={smallButton}>
              <i aria-hidden="true" className="fa-solid fa-plus text-[12px] text-[#222222] transition-colors group-hover:underline" />
              <span className={smallLabel}>{t('profile.add_address', 'Add address')}</span>
            </button>
          )
        }
      >
        {t('profile.address_book', 'Address book')}
      </CardHeading>

      <div className="mt-4">
        {loadFailed && !addresses && (
          <FormError>
            {t('profile.addresses_failed', "Couldn't load your addresses.")}{' '}
            <button type="button" onClick={() => setAttempt((value) => value + 1)} className={textButton}>
              <span className={textLabel}>{t('profile.try_again', 'Try again')}</span>
            </button>
          </FormError>
        )}

        {!addresses && !loadFailed && (
          <div aria-busy="true" className="space-y-2.5">
            <div className={`${skeleton} h-4 w-1/3`} />
            <div className={`${skeleton} h-4 w-2/3`} />
          </div>
        )}

        {actionError && <div className="mb-3"><FormError>{actionError}</FormError></div>}

        {addresses && addresses.length === 0 && (
          <div className="py-4 text-center">
            <p className="text-[15px] text-[#595959]">
              {t('profile.no_addresses', 'Add a delivery address and it will be ready at checkout.')}
            </p>
            <button type="button" onClick={() => openDrawer(null)} className={`${primaryButton} mt-4`}>
              <span className={primaryLabel}>{t('profile.add_address', 'Add address')}</span>
            </button>
          </div>
        )}

        {addresses && addresses.length > 0 && (
          <ul className="list-none divide-y divide-[#E1E3DF]">
            {addresses.map((address) => (
              <li key={address.id} className="py-4 first:pt-0 last:pb-0">
                <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-semibold text-[#222222]">
                  <span>{t(`profile.type_${address.type.toLowerCase()}`, address.type)}</span>
                  {address.isPrimary && (
                    <span className="rounded-lg bg-[#F5F5F1] px-2 py-0.5 text-[12px]">{t('profile.primary', 'Primary')}</span>
                  )}
                </p>
                <p className="mt-1 text-[15px] font-medium text-[#222222]">{address.name}</p>
                <p className="mt-0.5 text-[14px] leading-relaxed text-[#222222]">
                  {[address.line1, address.line2, address.city, `${address.state} ${address.pincode}`, address.country].filter(Boolean).join(', ')}
                </p>
                <p className="mt-0.5 text-[14px] tabular-nums text-[#595959]">{address.phone}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
                  {confirmDelete === address.id ? (
                    <>
                      <span className="text-[14px] text-[#222222]">{t('profile.delete_confirm', 'Delete this address?')}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmDelete(null);
                          void run(() => deleteAddress(address.id));
                        }}
                        className={`cursor-pointer rounded-sm ${focusRing}`}
                      >
                        <span className="text-[14px] font-semibold text-[#8F1610] underline underline-offset-2">{t('profile.delete_yes', 'Yes, delete')}</span>
                      </button>
                      <button type="button" onClick={() => setConfirmDelete(null)} className={textButton}>
                        <span className={textLabel}>{t('profile.keep', 'Keep it')}</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button type="button" onClick={() => openDrawer(address)} className={textButton}>
                        <span className={textLabel}>{t('profile.edit', 'Edit')}</span>
                      </button>
                      {!address.isPrimary && (
                        <button type="button" onClick={() => void run(() => setPrimaryAddress(address.id))} className={textButton}>
                          <span className={textLabel}>{t('profile.make_primary', 'Set as primary')}</span>
                        </button>
                      )}
                      <button type="button" onClick={() => setConfirmDelete(address.id)} className={textButton}>
                        <span className={textLabel}>{t('profile.delete', 'Delete')}</span>
                      </button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <AddressDetailsDrawer
        open={drawerOpen}
        editing={Boolean(editingAddress)}
        formKey={formKey}
        initial={editingAddress ?? blank}
        onClose={() => setDrawerOpen(false)}
        onSubmit={saveFromDrawer}
      />
    </section>
  );
}
