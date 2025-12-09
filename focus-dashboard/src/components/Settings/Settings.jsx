import { useState, useRef } from 'react';
import { backupData, restoreData, clearAllData } from '../../utils/storage';
import { changePassword } from '../../utils/api';
import './Settings.css';

const Settings = ({ onDataChange }) => {
  const [isOpen, setIsOpen] = useState(true); // 기본 열림으로 변경해 새 섹션이 바로 보이도록 함
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handleBackup = () => {
    const success = backupData();
    if (success) {
      alert('데이터가 백업되었습니다.');
    } else {
      alert('백업 중 오류가 발생했습니다.');
    }
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await restoreData(file);
      alert('데이터가 복원되었습니다.');
      if (onDataChange) {
        onDataChange();
      }
      window.location.reload();
    } catch (error) {
      alert('복원 중 오류가 발생했습니다: ' + error.message);
    }

    e.target.value = '';
  };

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    const success = clearAllData();
    if (success) {
      alert('모든 데이터가 삭제되었습니다.');
      setShowConfirm(false);
      if (onDataChange) {
        onDataChange();
      }
      window.location.reload();
    } else {
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const handleCancelClear = () => {
    setShowConfirm(false);
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    setShowConfirm(false);
  };

  const handlePasswordChange = async () => {
    setPwStatus({ type: '', message: '' });

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwStatus({ type: 'error', message: '모든 필드를 입력해주세요.' });
      return;
    }

    if (newPassword.length < 8) {
      setPwStatus({ type: 'error', message: '새 비밀번호는 8자 이상이어야 합니다.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwStatus({ type: 'error', message: '새 비밀번호가 일치하지 않습니다.' });
      return;
    }

    setPwLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwStatus({ type: 'success', message: '비밀번호가 변경되었습니다.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setPwStatus({ type: 'error', message: error.message || '비밀번호 변경에 실패했습니다.' });
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <div className={`settings ${isOpen ? 'open' : ''}`}>
      <button
        className="settings-header"
        onClick={handleToggle}
        type="button"
      >
        <span className="settings-icon">⚙️</span>
        <span className="settings-label">설정</span>
        <span className="settings-toggle">{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="settings-options">
          <div className="settings-version">v20251209.1 비밀번호 변경 기능 추가됨</div>
          <h3 className="settings-section-title">데이터 관리</h3>

          <button
            className="settings-button backup"
            onClick={handleBackup}
            type="button"
          >
            <span className="button-icon">💾</span>
            <span className="button-text">데이터 백업</span>
          </button>

          <button
            className="settings-button restore"
            onClick={handleRestoreClick}
            type="button"
          >
            <span className="button-icon">📥</span>
            <span className="button-text">데이터 복원</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          {!showConfirm ? (
            <button
              className="settings-button clear"
              onClick={handleClearClick}
              type="button"
            >
              <span className="button-icon">🗑️</span>
              <span className="button-text">모든 데이터 삭제</span>
            </button>
          ) : (
            <div className="confirm-box">
              <p className="confirm-message">정말로 모든 데이터를 삭제하시겠습니까?</p>
              <div className="confirm-buttons">
                <button
                  className="confirm-button yes"
                  onClick={handleConfirmClear}
                  type="button"
                >
                  예, 삭제합니다
                </button>
                <button
                  className="confirm-button no"
                  onClick={handleCancelClear}
                  type="button"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          <div className="settings-info">
            <p className="info-text">
              백업: 할일과 집중 기록을 JSON 파일로 저장
            </p>
            <p className="info-text">
              복원: 백업한 JSON 파일에서 데이터 불러오기
            </p>
            <p className="info-text warning">
              삭제: 모든 데이터가 영구적으로 삭제됩니다
            </p>
          </div>

          <h3 className="settings-section-title">계정 보안</h3>
          <div className="password-card">
            <div className="form-group">
              <label htmlFor="current-password">현재 비밀번호</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="현재 비밀번호"
                autoComplete="current-password"
              />
            </div>

            <div className="form-group">
              <label htmlFor="new-password">새 비밀번호</label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="8자 이상"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirm-password">새 비밀번호 확인</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="새 비밀번호 재입력"
                autoComplete="new-password"
                minLength={8}
              />
            </div>

            {pwStatus.message && (
              <div className={`password-status ${pwStatus.type}`}>
                {pwStatus.message}
              </div>
            )}

            <button
              className="settings-button change-password"
              onClick={handlePasswordChange}
              type="button"
              disabled={pwLoading}
            >
              <span className="button-icon">🔒</span>
              <span className="button-text">
                {pwLoading ? '변경 중...' : '비밀번호 변경'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
