import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';
import { Class, AttendanceRecord } from '../types';

export class FirebaseService {
  private static readonly CLASSES_COLLECTION = 'classes';
  private static readonly ATTENDANCE_COLLECTION = 'attendance';

  // クラス一覧を取得
  static async getClasses(): Promise<Class[]> {
    try {
      const classesSnapshot = await getDocs(collection(db, this.CLASSES_COLLECTION));
      const classes: Class[] = [];
      
      for (const classDoc of classesSnapshot.docs) {
        const classData = classDoc.data() as Omit<Class, 'id'>;
        const attendanceSnapshot = await getDocs(
          collection(db, this.CLASSES_COLLECTION, classDoc.id, this.ATTENDANCE_COLLECTION)
        );
        
        const attendanceRecords: AttendanceRecord[] = attendanceSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as AttendanceRecord[];

        classes.push({
          id: classDoc.id,
          ...classData,
          attendanceRecords
        });
      }
      
      return classes;
    } catch (error) {
      console.error('Error getting classes:', error);
      return [];
    }
  }

  // クラス一覧のリアルタイム監視
  static subscribeToClasses(callback: (classes: Class[]) => void): () => void {
    const unsubscribe = onSnapshot(
      collection(db, this.CLASSES_COLLECTION),
      async (snapshot) => {
        const classes: Class[] = [];
        
        for (const classDoc of snapshot.docs) {
          const classData = classDoc.data() as Omit<Class, 'id'>;
          const attendanceSnapshot = await getDocs(
            collection(db, this.CLASSES_COLLECTION, classDoc.id, this.ATTENDANCE_COLLECTION)
          );
          
          const attendanceRecords: AttendanceRecord[] = attendanceSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as AttendanceRecord[];

          classes.push({
            id: classDoc.id,
            ...classData,
            attendanceRecords
          });
        }
        
        callback(classes);
      }
    );
    
    return unsubscribe;
  }

  // クラスを追加
  static async addClass(classData: Omit<Class, 'id'>): Promise<string> {
    try {
      const { attendanceRecords, ...classInfo } = classData;
      const docRef = await addDoc(collection(db, this.CLASSES_COLLECTION), classInfo);
      
      // 出席記録を追加
      for (const record of attendanceRecords) {
        await addDoc(
          collection(db, this.CLASSES_COLLECTION, docRef.id, this.ATTENDANCE_COLLECTION),
          record
        );
      }
      
      return docRef.id;
    } catch (error) {
      console.error('Error adding class:', error);
      throw error;
    }
  }

  // クラスを更新
  static async updateClass(classId: string, classData: Partial<Class>): Promise<void> {
    try {
      const { attendanceRecords, ...classInfo } = classData;
      await updateDoc(doc(db, this.CLASSES_COLLECTION, classId), classInfo);
      
      // 出席記録を更新（必要に応じて）
      if (attendanceRecords) {
        // 既存の出席記録を削除
        const existingRecords = await getDocs(
          collection(db, this.CLASSES_COLLECTION, classId, this.ATTENDANCE_COLLECTION)
        );
        
        for (const recordDoc of existingRecords.docs) {
          await deleteDoc(recordDoc.ref);
        }
        
        // 新しい出席記録を追加
        for (const record of attendanceRecords) {
          await addDoc(
            collection(db, this.CLASSES_COLLECTION, classId, this.ATTENDANCE_COLLECTION),
            record
          );
        }
      }
    } catch (error) {
      console.error('Error updating class:', error);
      throw error;
    }
  }

  // クラスを削除
  static async deleteClass(classId: string): Promise<void> {
    try {
      // 出席記録を削除
      const attendanceSnapshot = await getDocs(
        collection(db, this.CLASSES_COLLECTION, classId, this.ATTENDANCE_COLLECTION)
      );
      
      for (const recordDoc of attendanceSnapshot.docs) {
        await deleteDoc(recordDoc.ref);
      }
      
      // クラスを削除
      await deleteDoc(doc(db, this.CLASSES_COLLECTION, classId));
    } catch (error) {
      console.error('Error deleting class:', error);
      throw error;
    }
  }

  // 出席記録を追加/更新
  static async updateAttendance(classId: string, record: AttendanceRecord): Promise<void> {
    try {
      // 同じ日付の記録があるかチェック
      const attendanceSnapshot = await getDocs(
        collection(db, this.CLASSES_COLLECTION, classId, this.ATTENDANCE_COLLECTION)
      );
      
      const existingRecord = attendanceSnapshot.docs.find(
        doc => doc.data().date === record.date
      );
      
      if (existingRecord) {
        // 既存の記録を更新
        await updateDoc(existingRecord.ref, { status: record.status });
      } else {
        // 新しい記録を追加
        await addDoc(
          collection(db, this.CLASSES_COLLECTION, classId, this.ATTENDANCE_COLLECTION),
          record
        );
      }
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }
}
