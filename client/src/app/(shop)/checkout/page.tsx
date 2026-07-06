'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button, Input } from '@/components';
import { useCartStore } from '@/stores/cart-store';
import { useToast } from '@/components/ui/Toast';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';

type Step = 'shipping' | 'payment' | 'review';

const steps: { key: Step; label: string }[] = [
  { key: 'shipping', label: 'Giao hàng' },
  { key: 'payment', label: 'Thanh toán' },
  { key: 'review', label: 'Xác nhận' },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, clearCart } = useCartStore();
  const { showToast } = useToast();
  const [step, setStep] = useState<Step>('shipping');
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    address: '',
    note: '',
  });

  const selectedIds = searchParams.get('items')?.split(',').filter(Boolean) ?? [];
  const checkoutItems = selectedIds.length > 0
    ? items.filter((item) => selectedIds.includes(item.id))
    : items;
  const subtotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  if (items.length === 0 || checkoutItems.length === 0) {
    router.push('/cart');
    return null;
  }

  const stepIndex = steps.findIndex((s) => s.key === step);

  const handlePlaceOrder = async () => {
    setPlacing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    clearCart();
    showToast('success', 'Đặt hàng thành công!');
    router.push('/');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-text mb-6">Thanh toán</h1>

      {/* Steps indicator */}
      <div className="flex items-center mb-8">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  i <= stepIndex
                    ? 'bg-accent text-white'
                    : 'bg-surface2 text-text2'
                }`}
              >
                {i < stepIndex ? (
                  <Check className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={`text-sm hidden sm:inline ${
                  i <= stepIndex ? 'text-text' : 'text-text2'
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-px mx-3 ${
                  i < stepIndex ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Shipping form */}
      {step === 'shipping' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">
            Thông tin giao hàng
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Họ và tên"
              placeholder="Nguyễn Văn A"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
            />
            <Input
              label="Số điện thoại"
              placeholder="0123 456 789"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <Input
            label="Địa chỉ"
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />
          <Input
            label="Ghi chú (không bắt buộc)"
            placeholder="Ghi chú cho đơn hàng..."
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />
          <div className="flex justify-end pt-2">
            <Button
              onClick={() => setStep('payment')}
              disabled={!form.fullName || !form.phone || !form.address}
            >
              Tiếp tục <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Payment step */}
      {step === 'payment' && (
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text">
            Phương thức thanh toán
          </h2>
          <div className="space-y-2">
            {[
              { id: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
              { id: 'bank', label: 'Chuyển khoản ngân hàng' },
              { id: 'card', label: 'Thẻ tín dụng / Ghi nợ' },
            ].map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-3 p-3 rounded-radius-btn border border-border cursor-pointer hover:bg-surface2 transition-colors"
              >
                <input
                  type="radio"
                  name="payment"
                  defaultChecked={method.id === 'cod'}
                  className="accent-accent"
                />
                <span className="text-sm text-text">{method.label}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <Button
              variant="ghost"
              onClick={() => setStep('shipping')}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <Button onClick={() => setStep('review')}>
              Xem lại đơn hàng <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Review step */}
      {step === 'review' && (
        <div className="space-y-4">
          {/* Shipping info summary */}
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-text">
                Thông tin giao hàng
              </h3>
              <button
                onClick={() => setStep('shipping')}
                className="text-xs text-accent hover:underline"
              >
                Sửa
              </button>
            </div>
            <p className="text-sm text-text2">{form.fullName}</p>
            <p className="text-sm text-text2">{form.phone}</p>
            <p className="text-sm text-text2">{form.address}</p>
          </div>

          {/* Items summary */}
          <div className="card p-4 space-y-2">
            <h3 className="text-sm font-semibold text-text mb-2">
              Sản phẩm ({items.length})
            </h3>
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-text2 truncate max-w-[60%]">
                  {item.name}{' '}
                  <span className="text-text2">x{item.quantity}</span>
                </span>
                <span className="text-text font-medium">
                  {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                </span>
              </div>
            ))}
          </div>

          {/* Total summary */}
          <div className="card p-4 space-y-2 text-sm">
            <div className="flex justify-between text-text2">
              <span>Tạm tính</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            <div className="flex justify-between text-text2">
              <span>Phí vận chuyển</span>
              <span>
                {shipping === 0
                  ? 'Miễn phí'
                  : `${shipping.toLocaleString('vi-VN')}₫`}
              </span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between font-semibold text-text">
              <span>Tổng</span>
              <span className="text-accent text-lg">
                {total.toLocaleString('vi-VN')}₫
              </span>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="ghost"
              onClick={() => setStep('payment')}
              icon={<ChevronLeft className="w-4 h-4" />}
            >
              Quay lại
            </Button>
            <Button
              onClick={handlePlaceOrder}
              loading={placing}
              size="lg"
            >
              {placing ? 'Đang xử lý...' : 'Đặt hàng'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
