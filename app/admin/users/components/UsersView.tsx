'use client';

import React, { useState } from 'react';
import UsersTable from './UsersTable';
import UserCard from './UserCard';
import UserDetailDrawer from './UserDetailDrawer';
import type { UserRow } from '../types';

interface UsersViewProps {
  users: UserRow[];
  page: number;
  pageSize: number;
  search: string;
}

// Holds the selected customer so the table (desktop) and cards (mobile) share
// one drawer — mirrors how ProductsClient owns viewProduct for ViewProductDrawer.
export default function UsersView({ users, page, pageSize, search }: UsersViewProps) {
  const [selected, setSelected] = useState<UserRow | null>(null);

  const openDrawer = (user: UserRow) => setSelected(user);
  const closeDrawer = () => setSelected(null);

  return (
    <>
      {/* Table panel: stretches to fill the space between header and footer */}
      <div className="hidden sm:block flex-1 min-h-0 overflow-y-auto bg-white rounded-lg border border-gray-200 shadow-2xs mx-4">
        <UsersTable users={users} page={page} pageSize={pageSize} search={search} onView={openDrawer} />
      </div>

      {/* Card stack (mobile): same stretch behaviour */}
      <div className="sm:hidden flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-5 mx-3">
        {users.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 shadow-2xs py-12 text-center text-sm text-gray-400">
            {search ? `No customers found matching “${search}”.` : 'No customer accounts yet.'}
          </div>
        ) : (
          users.map((user) => <UserCard key={user.id} user={user} onView={openDrawer} />)
        )}
      </div>

      {/* Mounted per open customer, so tabs always start fresh with no stale data. */}
      {selected && <UserDetailDrawer key={selected.id} user={selected} onClose={closeDrawer} />}
    </>
  );
}
