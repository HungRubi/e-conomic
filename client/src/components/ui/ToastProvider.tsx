'use client';

import { Toaster } from 'sonner';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-center"
      gap={10}
      offset={24}
      toastOptions={{
        duration: 3500,
        classNames: {
          toast:
            '!bg-[var(--surface)] !border !border-[var(--border)] !text-[var(--text)] !rounded-[var(--radius)] !shadow-[0_18px_60px_rgba(0,0,0,0.08)] !px-4 !py-3',
          title: '!text-sm !font-semibold !text-[var(--text)]',
          description: '!text-xs !text-[var(--text2)]',
          actionButton:
            '!bg-[var(--text)] !text-[var(--bg)] !rounded-[var(--radius-sm)] !text-xs !font-semibold !px-3 !py-1.5',
          cancelButton:
            '!text-[var(--text2)] !border !border-[var(--border)] !rounded-[var(--radius-sm)] !text-xs !px-3 !py-1.5',
          closeButton:
            '!text-[var(--text2)] !hover:text-[var(--text)] !hover:bg-[var(--surface2)] !rounded-full',
          icon: '!size-5',
          success: '!border-[var(--green)]/30',
          error: '!border-[var(--red)]/30',
          info: '!border-[var(--accent)]/30',
          warning: '!border-[var(--orange)]/30',
        },
      }}
    />
  );
}
