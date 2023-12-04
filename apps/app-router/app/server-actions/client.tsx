'use client';
import { useCallback, useState, useTransition } from 'react';

export default function Client() {
  const [isPending, startTransition] = useTransition();

  return (
    <div>
      <button>Fire Server Actions</button>
      {isPending && <div>☎️ing Server Actions...</div>}
    </div>
  );
}
