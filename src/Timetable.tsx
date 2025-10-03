import React, { useState } from 'react';
import { Class } from './types';
import { Trash2, Plus } from 'lucide-react';

interface TimetableProps {
  classes: Class[];
  onAddClass: (day: number, period: number, name: string) => void;
  onUpdateAttendance: (classId: string, status: 'present' | 'absent') => void;
  onDeleteClass: (classId: string) => void;
}

const Timetable: React.FC<TimetableProps> = ({
  classes,
  onAddClass,
  onUpdateAttendance,
  onDeleteClass
}) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [showAddModal, setShowAddModal] = useState<{day: number, period: number} | null>(null);
  const [newClassName, setNewClassName] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const days = ['月', '火', '水', '木', '金', '土'];
  const periods = [
    { number: 1, time: '09:25-10:55' },
    { number: 2, time: '10:55-13:00' },
    { number: 3, time: '13:00-14:30' },
    { number: 4, time: '14:45-16:15' },
    { number: 5, time: '16:30-18:00' },
    { number: 6, time: '18:10-19:40' }
  ];

  const getClassForCell = (day: number, period: number): Class | undefined => {
    return classes.find(c => c.day === day && c.period === period);
  };

  const getAttendanceCounts = (classData: Class) => {
    const present = classData.attendanceRecords.filter(r => r.status === 'present').length;
    const absent = classData.attendanceRecords.filter(r => r.status === 'absent').length;
    return { present, absent };
  };

  const handleCellClick = (day: number, period: number) => {
    const classData = getClassForCell(day, period);
    if (classData) {
      setSelectedClass(classData);
    } else {
      setShowAddModal({ day, period });
    }
  };

  const handleAddClass = () => {
    if (newClassName.trim() && showAddModal) {
      onAddClass(showAddModal.day, showAddModal.period, newClassName.trim());
      setNewClassName('');
      setShowAddModal(null);
    }
  };

  const handleDeleteClass = () => {
    if (selectedClass) {
      onDeleteClass(selectedClass.id);
      setSelectedClass(null);
      setShowDeleteConfirm(false);
    }
  };

  const getPeriodColor = (period: number) => {
    const colors = {
      1: 'bg-blue-50',
      2: 'bg-green-50',
      3: 'bg-yellow-50',
      4: 'bg-purple-50',
      5: 'bg-pink-50',
      6: 'bg-indigo-50'
    };
    return colors[period as keyof typeof colors] || 'bg-gray-50';
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-2 sm:p-4">
      {/* ヘッダー */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">出席管理</h1>
        <div className="text-sm text-gray-600">2025年秋学期</div>
      </div>

      {/* 時間割グリッド */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 bg-gray-100">
          <div className="p-2 sm:p-3 text-center font-semibold text-gray-600 text-xs sm:text-sm">時限</div>
          {days.map((day, index) => (
            <div key={index} className="p-2 sm:p-3 text-center font-semibold text-gray-600 text-xs sm:text-sm">
              {day}
            </div>
          ))}
        </div>

        {/* 時間割本体 */}
        {periods.map((period) => (
          <div key={period.number} className="grid grid-cols-7 border-b border-gray-200">
            {/* 時限・時間 */}
            <div className="p-2 sm:p-3 bg-gray-50 border-r border-gray-200">
              <div className="text-center">
                <div className="text-sm sm:text-lg font-bold text-gray-800">{period.number}</div>
                <div className="text-xs text-gray-600 hidden sm:block">{period.time}</div>
              </div>
            </div>

            {/* 各曜日のセル */}
            {days.map((_, dayIndex) => {
              const classData = getClassForCell(dayIndex, period.number);
              return (
                <div
                  key={dayIndex}
                  className={`p-1 sm:p-2 min-h-[60px] sm:min-h-[80px] cursor-pointer hover:bg-gray-100 transition-colors ${getPeriodColor(period.number)}`}
                  onClick={() => handleCellClick(dayIndex, period.number)}
                >
                  {classData ? (
                    <div className="h-full flex flex-col justify-between">
                      <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1 truncate">
                        {classData.name}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateAttendance(classData.id, 'present');
                          }}
                          className="px-1 sm:px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                        >
                          出
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateAttendance(classData.id, 'absent');
                          }}
                          className="px-1 sm:px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                        >
                          欠
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <Plus size={16} className="sm:hidden" />
                      <Plus size={20} className="hidden sm:block" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 授業詳細モーダル */}
      {selectedClass && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-2 sm:mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{selectedClass.name}</h3>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-600">出席回数:</span>
                <span className="font-semibold text-green-600">
                  {getAttendanceCounts(selectedClass).present}回
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">欠席回数:</span>
                <span className="font-semibold text-red-600">
                  {getAttendanceCounts(selectedClass).absent}回
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSelectedClass(null)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-2 sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">確認</h3>
            <p className="text-gray-600 mb-6">本当にこの授業を削除しますか？</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                いいえ
              </button>
              <button
                onClick={handleDeleteClass}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                はい
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 授業追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-2 sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">授業を追加</h3>
            <input
              type="text"
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              placeholder="授業名を入力してください"
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAddModal(null);
                  setNewClassName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleAddClass}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                追加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timetable;
