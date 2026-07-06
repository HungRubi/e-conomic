import type { AdminProductVariant } from '@/api/admin-products';
import { publicAssetUrl } from '@/lib/public-asset-url';
import { Input } from '@/components/ui/input';

type VariantStockInputsProps = {
  variants: AdminProductVariant[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  disabled?: boolean;
};

function variantLabel(v: AdminProductVariant): string {
  return v.label ?? ([v.name, v.color].filter(Boolean).join(' - ') || 'Biến thể');
}

export function VariantStockInputs({ variants, values, onChange, disabled }: VariantStockInputsProps) {
  const isCompact = variants.length > 5;

  return (
    <div className={isCompact ? 'grid grid-cols-2 gap-2' : 'divide-y divide-border rounded-lg border'}>
      {variants.map(v => (
        <div
          key={v.id}
          className={
            isCompact
              ? 'flex items-center gap-2 rounded-lg border border-border p-2.5'
              : 'flex items-center gap-3 px-3 py-2.5'
          }
        >
          {v.image ? (
            <img
              src={publicAssetUrl(v.image)}
              alt=''
              className='size-9 shrink-0 rounded border border-border object-cover'
              loading='lazy'
            />
          ) : (
            <div className='size-9 shrink-0 rounded bg-muted' />
          )}
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium'>{variantLabel(v)}</p>
            <p className='text-xs text-muted-foreground'>
              Tồn: <span className='tabular-nums'>{v.stockQuantity ?? 0}</span>
            </p>
          </div>
          <div className='w-20 shrink-0'>
            <Input
              type='number'
              min={0}
              value={values[v.id] ?? '0'}
              onChange={e => onChange(v.id, e.target.value.replace(/[^0-9]/g, ''))}
              placeholder='0'
              disabled={disabled}
              className='h-8 text-sm'
            />
          </div>
        </div>
      ))}
    </div>
  );
}
