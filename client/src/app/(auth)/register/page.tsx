'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { Button, Input } from '@/components';
import { useToast } from '@/components/ui/Toast';

export default function RegisterPage() {
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.role) {
      showToast('error', 'Vui lòng điền đầy đủ thông tin, bao gồm role');
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast('error', 'Mật khẩu không khớp');
      return;
    }
    if (form.password.length < 6) {
      showToast('error', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    showToast('success', 'Đăng ký thành công!');
  };

  return (
    <div className="card p-6">
      <div className="text-center mb-6">
        <Link href="/" className="text-xl font-bold text-text">
          e‑conomic
        </Link>
        <p className="text-sm text-text2 mt-1">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên"
          placeholder="Nguyễn Văn A"
          iconLeft={<User className="w-4 h-4" />}
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          label="Email"
          type="email"
          placeholder="your@email.com"
          iconLeft={<Mail className="w-4 h-4" />}
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <div className="w-full">
          <label htmlFor="role" className="block text-sm font-medium text-text mb-1.5">
            Role <span className="text-red" aria-hidden="true">*</span>
          </label>
          <select
            id="role"
            name="role"
            required
            aria-required="true"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full h-10 rounded-radius-btn bg-surface2 border border-border text-text px-3 transition-colors focus:outline-none focus:border-border focus:ring-2 focus:ring-border/60"
          >
            <option value="">Chọn role</option>
            <option value="user">Khách hàng</option>
            <option value="staff">Nhân viên</option>
            <option value="manager">Quản lý</option>
          </select>
        </div>
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
        <Input
          label="Xác nhận mật khẩu"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          iconLeft={<Lock className="w-4 h-4" />}
          value={form.confirmPassword}
          onChange={(e) =>
            setForm({ ...form, confirmPassword: e.target.value })
          }
        />

        <Button type="submit" className="w-full" loading={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng ký'}
        </Button>
      </form>

      {/* Social register */}
      <div className="mt-6">
        <div className="relative text-center mb-4">
          <span className="relative z-10 px-2 text-xs text-text2 bg-surface">
            Hoặc đăng ký với
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
        Đã có tài khoản?{' '}
        <Link href="/login" className="text-accent hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}
