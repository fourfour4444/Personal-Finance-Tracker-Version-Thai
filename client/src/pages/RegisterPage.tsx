import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (password.length < 6) {
      setLocalError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
      return;
    }
    if (password !== confirmPassword) {
      setLocalError('รหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      await register(name, email, password);
      navigate('/');
    } catch { /* error is handled by store */ }
  };

  const displayError = localError || error;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">✨</div>
          <h2>สร้างบัญชีใหม่</h2>
          <p>เริ่มต้นติดตามการเงินของคุณวันนี้</p>
        </div>

        {displayError && <div className="auth-error">{displayError}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-name">ชื่อ</label>
            <input id="reg-name" type="text" className="form-input" placeholder="ชื่อของคุณ" value={name} onChange={(e) => { setName(e.target.value); clearError(); setLocalError(''); }} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-email">อีเมล</label>
            <input id="reg-email" type="email" className="form-input" placeholder="your@email.com" value={email} onChange={(e) => { setEmail(e.target.value); clearError(); setLocalError(''); }} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-password">รหัสผ่าน</label>
            <input id="reg-password" type="password" className="form-input" placeholder="อย่างน้อย 6 ตัวอักษร" value={password} onChange={(e) => { setPassword(e.target.value); clearError(); setLocalError(''); }} required />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="reg-confirm">ยืนยันรหัสผ่าน</label>
            <input id="reg-confirm" type="password" className="form-input" placeholder="••••••••" value={confirmPassword} onChange={(e) => { setConfirmPassword(e.target.value); setLocalError(''); }} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={isLoading}>
            {isLoading ? '⏳ กำลังสมัคร...' : '🚀 สมัครสมาชิก'}
          </button>
        </form>

        <div className="auth-footer">
          มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}
