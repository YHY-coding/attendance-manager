import React, { useState, useEffect } from 'react';
import Timetable from './Timetable';
import { Class } from './types';
import { FirebaseService } from './services/firebaseService';

function App() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Firebaseからデータを取得
    const unsubscribe = FirebaseService.subscribeToClasses((fetchedClasses) => {
      setClasses(fetchedClasses);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleAddClass = async (day: number, period: number, name: string) => {
    try {
      const newClass: Omit<Class, 'id'> = {
        name,
        day,
        period,
        attendanceRecords: []
      };
      await FirebaseService.addClass(newClass);
    } catch (error) {
      console.error('Error adding class:', error);
      alert('授業の追加に失敗しました');
    }
  };

  const handleUpdateAttendance = async (classId: string, status: 'present' | 'absent') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const record = {
        id: Date.now().toString(),
        date: today,
        status
      };
      await FirebaseService.updateAttendance(classId, record);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('出席記録の更新に失敗しました');
    }
  };

  const handleDeleteClass = async (classId: string) => {
    try {
      await FirebaseService.deleteClass(classId);
    } catch (error) {
      console.error('Error deleting class:', error);
      alert('授業の削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Timetable
        classes={classes}
        onAddClass={handleAddClass}
        onUpdateAttendance={handleUpdateAttendance}
        onDeleteClass={handleDeleteClass}
      />
    </div>
  );
}

export default App;
