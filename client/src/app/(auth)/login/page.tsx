'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, Smartphone } from 'lucide-react';
import { Button, Input } from '@/components';
import { useToast } from '@/components/ui/Toast';

interface Errors {
  email?: string;
  password?: string;
}

export default function LoginPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [form, setForm] = useState({ email: '', password: '' });

  const validate = (): boolean => {
    const e: Errors = {};
    if (!form.email.trim()) {
      e.email = 'Email không được để trống';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      e.email = 'Email không hợp lệ';
    }
    if (!form.password) {
      e.password = 'Mật khẩu không được để trống';
    } else if (form.password.length < 6) {
      e.password = 'Mật khẩu tối thiểu 6 ký tự';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    showToast('success', 'Đăng nhập thành công!');
  };

  return (
    <div className="card p-6 sm:p-8 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
      {/* Header */}
      <div className="text-center mb-8">
        <Link href="/" className="text-xl font-bold tracking-tight text-text">
          e‑conomic
        </Link>
        <p className="text-sm text-text2 mt-1.5">Đăng nhập tài khoản</p>
      </div>

      {/* ── Email form ── */}
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          iconLeft={<Mail className="w-4 h-4" />}
          value={form.email}
          error={errors.email}
          onChange={(e) => { setForm({ ...form, email: e.target.value }); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
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
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            value={form.password}
            error={errors.password}
            onChange={(e) => { setForm({ ...form, password: e.target.value }); if (errors.password) setErrors((p) => ({ ...p, password: undefined })); }}
          />
        </div>

        <div className="flex items-center justify-end">
          <Link href="#" className="text-sm text-text2 hover:text-text underline underline-offset-2 transition-colors">
            Quên mật khẩu?
          </Link>
        </div>

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>

      {/* ── Divider ── */}
      <div className="relative my-6">
        <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        <span className="relative z-10 block mx-auto w-fit px-4 text-xs text-text2 bg-surface">Hoặc tiếp tục với</span>
      </div>

      {/* ── Google ── */}
      <button
        type="button"
        onClick={() => showToast('info', 'Đang kết nối với Google...')}
        className="flex w-full items-center justify-center gap-3 h-11 rounded-full border border-border text-sm font-medium text-text hover:bg-surface2 transition-all active:translate-y-px"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>

      {/* ── Phone ── */}
      <button
        type="button"
        onClick={() => showToast('info', 'Tính năng đang phát triển')}
        className="mt-2 flex w-full items-center justify-center gap-3 h-11 rounded-full border border-border text-sm font-medium text-text2 hover:text-text hover:bg-surface2 transition-all active:translate-y-px"
      >
        <Smartphone className="w-4 h-4" />
        Số điện thoại
      </button>

      {/* Register link */}
      <p className="mt-8 text-center text-sm text-text2">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="text-text font-semibold hover:underline underline-offset-2">
          Đăng ký
        </Link>
      </p>
    </div>
  );
}
