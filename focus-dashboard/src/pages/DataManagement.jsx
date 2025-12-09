import { useState, useRef, useEffect } from 'react';
import { backupData, restoreData, clearAllData } from '../utils/storage';
import ProductivitySummary from '../components/DataManagement/ProductivitySummary';
import MonthlyCalendar from '../components/DataManagement/MonthlyCalendar';
import ProductivityCharts from '../components/DataManagement/ProductivityCharts';
import DateDetailModal from '../components/DataManagement/DateDetailModal';
import { useGlobalTodos } from '../contexts/TodosContext';
import { useFocusHistory } from '../hooks/useFocusHistory';
import './DataManagement.css';

const DataManagement = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);
  const [modalData, setModalData] = useState(null);

  // useGlobalTodos 훅 사용 (전역 상태)
  const { todos } = useGlobalTodos();

  const { focusHistory, refreshHistory } = useFocusHistory();

  // 페이지 마운트 시 데이터 새로고침
  useEffect(() => {
    console.log('[DataManagement] 페이지 마운트 - 데이터 새로고침 시작');
    refreshHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 데이터 변경 감지 및 로그
  useEffect(() => {
    console.log('[DataManagement] focusHistory 업데이트:', focusHistory);
    console.log('[DataManagement] todos 업데이트:', todos);
    console.log('[DataManagement] todos 개수:', todos.length);
  }, [focusHistory, todos]);

  // 10초마다 집중 기록 새로고침 (타이머가 실행 중일 때 실시간 반영)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[DataManagement] 10초 자동 새로고침');
      refreshHistory();
    }, 10000); // 10초

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleDateClick = (date, data) => {
    setModalData({ date, data });
  };

  const handleCloseModal = () => {
    setModalData(null);
  };

  const handleBackup = () => {
    const success = backupData();
    if (success) {
      showMessage('데이터가 성공적으로 백업되었습니다.', 'success');
    } else {
      showMessage('백업 중 오류가 발생했습니다.', 'error');
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
      showMessage('데이터가 성공적으로 복원되었습니다.', 'success');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      showMessage('복원 중 오류가 발생했습니다: ' + error.message, 'error');
    }

    e.target.value = '';
  };

  const handleClearClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmClear = () => {
    const success = clearAllData();
    if (success) {
      showMessage('모든 데이터가 삭제되었습니다.', 'success');
      setShowConfirm(false);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showMessage('삭제 중 오류가 발생했습니다.', 'error');
    }
  };

  const handleCancelClear = () => {
    setShowConfirm(false);
  };

  return (
    <div className="data-management">
      <div className="data-container">
        <div className="page-header">
          <div className="header-title-section">
            <h2 className="data-title">생산성 대시보드</h2>
            <p className="data-subtitle">
              집중 시간 분석 및 생산성 통계를 확인하세요
            </p>
          </div>

          <div className="header-actions">
            <button
              className="compact-btn backup-btn"
              onClick={handleBackup}
              title="데이터 백업"
            >
              💾 백업
            </button>
            <button
              className="compact-btn restore-btn"
              onClick={handleRestoreClick}
              title="데이터 복원"
            >
              📥 복원
            </button>
            <button
              className="compact-btn delete-btn"
              onClick={handleClearClick}
              title="데이터 삭제"
            >
              🗑️ 삭제
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {message && (
          <div className={`message-box ${message.type}`}>
            {message.text}
          </div>
        )}

        {showConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h3>⚠️ 데이터 삭제 확인</h3>
              <p>정말로 모든 데이터를 삭제하시겠습니까?</p>
              <p className="confirm-warning">이 작업은 되돌릴 수 없습니다.</p>
              <div className="confirm-buttons">
                <button className="confirm-btn yes" onClick={handleConfirmClear}>
                  예, 삭제합니다
                </button>
                <button className="confirm-btn no" onClick={handleCancelClear}>
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 생산성 요약 카드 */}
        <ProductivitySummary focusHistory={focusHistory} todos={todos} />

        {/* 월별 달력 */}
        <MonthlyCalendar
          focusHistory={focusHistory}
          todos={todos}
          onDateClick={handleDateClick}
        />

        {/* 차트 */}
        <ProductivityCharts focusHistory={focusHistory} todos={todos} />

        {/* 날짜 상세 모달 */}
        <DateDetailModal
          isOpen={!!modalData}
          onClose={handleCloseModal}
          date={modalData?.date}
          data={modalData?.data}
        />

        <div className="old-data-sections" style={{ display: 'none' }}>
          {/* 백업 섹션 */}
          <div className="data-section">
            <div className="section-icon">💾</div>
            <h3 className="section-title">데이터 백업</h3>
            <p className="section-description">
              현재 저장된 모든 할일과 집중 기록을 JSON 파일로 다운로드합니다.
            </p>
            <button
              className="data-button backup-button"
              onClick={handleBackup}
              type="button"
            >
              <span className="button-icon">⬇️</span>
              <span className="button-label">지금 백업하기</span>
            </button>
            <div className="section-info">
              <p>파일명: pomodoro-backup-YYYY-MM-DD.json</p>
              <p>포함 내용: 할일 목록, 집중 시간 기록</p>
            </div>
          </div>

          {/* 복원 섹션 */}
          <div className="data-section">
            <div className="section-icon">📥</div>
            <h3 className="section-title">데이터 복원</h3>
            <p className="section-description">
              이전에 백업한 JSON 파일에서 데이터를 불러옵니다.
            </p>
            <button
              className="data-button restore-button"
              onClick={handleRestoreClick}
              type="button"
            >
              <span className="button-icon">⬆️</span>
              <span className="button-label">파일 선택하기</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div className="section-info">
              <p>지원 형식: JSON 파일만</p>
              <p>⚠️ 현재 데이터가 백업 파일로 덮어씌워집니다</p>
            </div>
          </div>

          {/* 삭제 섹션 */}
          <div className="data-section danger-section">
            <div className="section-icon">🗑️</div>
            <h3 className="section-title">모든 데이터 삭제</h3>
            <p className="section-description">
              저장된 모든 할일과 집중 기록을 영구적으로 삭제합니다.
            </p>

            {!showConfirm ? (
              <>
                <button
                  className="data-button delete-button"
                  onClick={handleClearClick}
                  type="button"
                >
                  <span className="button-icon">⚠️</span>
                  <span className="button-label">데이터 삭제</span>
                </button>
                <div className="section-info warning">
                  <p>⚠️ 이 작업은 되돌릴 수 없습니다</p>
                  <p>삭제 전 반드시 백업하세요</p>
                </div>
              </>
            ) : (
              <div className="confirm-container">
                <div className="confirm-message">
                  <strong>정말로 모든 데이터를 삭제하시겠습니까?</strong>
                  <p>이 작업은 되돌릴 수 없습니다.</p>
                </div>
                <div className="confirm-buttons">
                  <button
                    className="confirm-btn yes"
                    onClick={handleConfirmClear}
                    type="button"
                  >
                    예, 삭제합니다
                  </button>
                  <button
                    className="confirm-btn no"
                    onClick={handleCancelClear}
                    type="button"
                  >
                    취소
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="tips-section">
          <h4 className="tips-title">💡 도움말</h4>
          <ul className="tips-list">
            <li>정기적으로 데이터를 백업하는 것을 권장합니다</li>
            <li>다른 기기로 데이터를 옮길 때 백업 파일을 사용하세요</li>
            <li>브라우저 데이터를 삭제하면 저장된 내용이 사라지므로 주의하세요</li>
            <li>백업 파일은 안전한 곳에 보관하세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DataManagement;
