'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { Button, Input } from '@/components';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', remember: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      showToast('error', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    setLoading(true);
    // Simulate login
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    showToast('success', 'Đăng nhập thành công!');
  };

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <Link href="/" className="text-xl font-bold text-text">
          e‑conomic
        </Link>
        <p className="text-sm text-text2 mt-1">Đăng nhập tài khoản</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          iconLeft={<Mail className="w-4 h-4" />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div>
          <Input
            label="Mật khẩu"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            iconLeft={<Lock className="w-4 h-4" />}
            iconRight={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-text2 hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-text2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) =>
                setForm({ ...form, remember: e.target.checked })
              }
              className="accent-accent"
            />
            Ghi nhớ
          </label>
          <Link href="#" className="text-accent hover:underline">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* Social login */}
      <div className="mt-6">
        <div className="relative text-center mb-4">
          <span className="relative z-10 px-2 text-xs text-text2 bg-surface">
            Hoặc tiếp tục với
          </span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border -translate-y-1/2" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button className="h-10 rounded-radius-btn border border-border text-sm text-text2 hover:text-text hover:bg-surface2 transition-colors">
            Google
          </button>
          <button className="h-10 rounded-radius-btn border border-border text-sm text-text2 hover:text-text hover:bg-surface2 transition-colors">
            Facebook
          </button>
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-text2">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-accent hover:underline">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
