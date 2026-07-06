import * as React from 'react';
import { CalendarIcon, XIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

export type DateRangeValue = {
  from: string | null;
  to: string | null;
};

type Preset = {
  id: string;
  label: string;
  getRange: () => DateRangeValue;
};

const today = () => new Date().toISOString().slice(0, 10);

const PRESETS: Preset[] = [
  { id: 'today', label: 'Hôm nay', getRange: () => ({ from: today(), to: today() }) },
  {
    id: '7d',
    label: '7 ngày',
    getRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 6);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    id: '30d',
    label: '30 ngày',
    getRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 29);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    id: '90d',
    label: '90 ngày',
    getRange: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(to.getDate() - 89);
      return { from: from.toISOString().slice(0, 10), to: to.toISOString().slice(0, 10) };
    },
  },
  {
    id: 'mtd',
    label: 'Tháng này',
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: from.toISOString().slice(0, 10), to: today() };
    },
  },
  {
    id: 'ytd',
    label: 'Năm nay',
    getRange: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1);
      return { from: from.toISOString().slice(0, 10), to: today() };
    },
  },
];

export type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  className?: string;
  placeholder?: string;
};

function fmtDisplay(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(d);
}

export function DateRangePicker({ value, onChange, className, placeholder = 'Chọn khoảng thời gian' }: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);
  const [from, setFrom] = React.useState(value.from ?? '');
  const [to, setTo] = React.useState(value.to ?? '');

  function handleOpenChange(next: boolean) {
    if (next) {
      setFrom(value.from ?? '');
      setTo(value.to ?? '');
    }
    setOpen(next);
  }

  const summary = value.from && value.to
    ? fmtDisplay(value.from) + ' – ' + fmtDisplay(value.to)
    : value.from
      ? 'Từ ' + fmtDisplay(value.from)
      : value.to
        ? 'Đến ' + fmtDisplay(value.to)
        : placeholder;

  function applyRange() {
    if (from && to && from > to) {
      onChange({ from: to, to: from });
    } else {
      onChange({ from: from || null, to: to || null });
    }
    setOpen(false);
  }

  function clear() {
    setFrom('');
    setTo('');
    onChange({ from: null, to: null });
    setOpen(false);
  }

  const hasValue = Boolean(value.from || value.to);

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='outline'
          size='default'
          className={cn('font-normal', !hasValue && 'text-muted-foreground', className)}
        >
          <CalendarIcon className='size-4 shrink-0' />
          <span>{summary}</span>
          {hasValue ? (
            <XIcon
              className='ml-1 size-3 shrink-0 opacity-60 hover:opacity-100'
              role='button'
              aria-label='Xóa khoảng thời gian'
              onClick={(e) => {
                e.stopPropagation();
                clear();
              }}
            />
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align='end' className='w-[320px] p-3'>
        <div className='space-y-3'>
          <div className='flex flex-wrap gap-1.5'>
            {PRESETS.map((p) => (
              <Button
                key={p.id}
                type='button'
                variant='ghost'
                size='sm'
                className='h-7 px-2 text-xs'
                onClick={() => {
                  const r = p.getRange();
                  setFrom(r.from ?? '');
                  setTo(r.to ?? '');
                  onChange(r);
                  setOpen(false);
                }}
              >
                {p.label}
              </Button>
            ))}
          </div>
          <div className='grid grid-cols-2 gap-2'>
            <Field>
              <FieldLabel htmlFor='dr-from'>Từ ngày</FieldLabel>
              <Input id='dr-from' type='date' value={from} onChange={(e) => setFrom(e.target.value)} max={to || undefined} />
            </Field>
            <Field>
              <FieldLabel htmlFor='dr-to'>Đến ngày</FieldLabel>
              <Input id='dr-to' type='date' value={to} onChange={(e) => setTo(e.target.value)} min={from || undefined} />
            </Field>
          </div>
          <div className='flex justify-between gap-2'>
            <Button type='button' variant='ghost' size='sm' onClick={clear} disabled={!from && !to}>
              Xóa
            </Button>
            <Button type='button' size='sm' onClick={applyRange}>
              Áp dụng
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
