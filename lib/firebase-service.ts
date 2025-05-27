import { db, auth } from "./firebase"
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore"
import type { Workout, Exercise } from "./types"

// Kiểm tra xem chúng ta đang ở môi trường browser hay không
const isBrowser = typeof window !== "undefined"

// Hàm helper để chuyển đổi timestamp an toàn
function convertTimestamp(timestamp: any): string {
  if (!timestamp) {
    return new Date().toISOString()
  }

  // Nếu là Firestore Timestamp
  if (timestamp && typeof timestamp.toDate === "function") {
    try {
      return timestamp.toDate().toISOString()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi Firestore timestamp:", error)
      return new Date().toISOString()
    }
  }

  // Nếu là string ISO
  if (typeof timestamp === "string") {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date string")
      }
      return date.toISOString()
    } catch (error) {
      console.error("Lỗi khi parse date string:", error)
      return new Date().toISOString()
    }
  }

  // Nếu là Date object
  if (timestamp instanceof Date) {
    try {
      if (isNaN(timestamp.getTime())) {
        throw new Error("Invalid Date object")
      }
      return timestamp.toISOString()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi Date object:", error)
      return new Date().toISOString()
    }
  }

  // Nếu là number (timestamp)
  if (typeof timestamp === "number") {
    try {
      const date = new Date(timestamp)
      if (isNaN(date.getTime())) {
        throw new Error("Invalid timestamp number")
      }
      return date.toISOString()
    } catch (error) {
      console.error("Lỗi khi chuyển đổi timestamp number:", error)
      return new Date().toISOString()
    }
  }

  // Fallback
  console.warn("Không thể chuyển đổi timestamp, sử dụng thời gian hiện tại:", timestamp)
  return new Date().toISOString()
}

// Lấy danh sách buổi tập
export async function getWorkouts(): Promise<Workout[]> {
  if (!isBrowser || !db || !auth) {
    console.error("Firebase chưa được khởi tạo hoặc không ở môi trường browser")
    return []
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("Người dùng chưa đăng nhập")
      return []
    }

    const workoutsRef = collection(db, "workouts")
    const q = query(workoutsRef, where("userId", "==", currentUser.uid), orderBy("date", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
        date: convertTimestamp(data.date),
      }
    }) as Workout[]
  } catch (error) {
    console.error("Lỗi khi lấy danh sách buổi tập:", error)
    throw error
  }
}

// Lấy chi tiết buổi tập
export async function getWorkout(id: string): Promise<Workout | null> {
  if (!isBrowser || !db || !auth) {
    console.error("Firebase chưa được khởi tạo hoặc không ở môi trường browser")
    return null
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("Người dùng chưa đăng nhập")
      return null
    }

    const workoutRef = doc(db, "workouts", id)
    const workoutSnap = await getDoc(workoutRef)

    if (workoutSnap.exists()) {
      const data = workoutSnap.data()

      // Kiểm tra xem buổi tập có thuộc về người dùng hiện tại không
      if (data.userId !== currentUser.uid) {
        console.error("Không có quyền truy cập buổi tập này")
        return null
      }

      return {
        id: workoutSnap.id,
        ...data,
        date: convertTimestamp(data.date),
      } as Workout
    } else {
      console.error("Không tìm thấy buổi tập")
      return null
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết buổi tập:", error)
    throw error
  }
}

// Thêm buổi tập mới
export async function addWorkout(workoutData: Omit<Workout, "id">): Promise<string | null> {
  if (!isBrowser || !db || !auth) {
    console.error("Firebase chưa được khởi tạo hoặc không ở môi trường browser")
    return null
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("Người dùng chưa đăng nhập")
      return null
    }

    const workoutsRef = collection(db, "workouts")

    // Đảm bảo date là timestamp hợp lệ
    let processedDate: any
    try {
      if (typeof workoutData.date === "string") {
        processedDate = Timestamp.fromDate(new Date(workoutData.date))
      } else if (workoutData.date instanceof Date) {
        processedDate = Timestamp.fromDate(workoutData.date)
      } else {
        processedDate = serverTimestamp()
      }
    } catch (error) {
      console.error("Lỗi khi xử lý date, sử dụng serverTimestamp:", error)
      processedDate = serverTimestamp()
    }

    const docRef = await addDoc(workoutsRef, {
      ...workoutData,
      date: processedDate,
      userId: currentUser.uid,
      createdAt: serverTimestamp(),
    })

    return docRef.id
  } catch (error) {
    console.error("Lỗi khi thêm buổi tập mới:", error)
    throw error
  }
}

// Cập nhật buổi tập
export async function updateWorkout(id: string, workoutData: Partial<Workout>): Promise<boolean> {
  if (!isBrowser || !db || !auth) {
    console.error("Firebase chưa được khởi tạo hoặc không ở môi trường browser")
    return false
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("Người dùng chưa đăng nhập")
      return false
    }

    // Kiểm tra xem buổi tập có thuộc về người dùng hiện tại không
    const workoutRef = doc(db, "workouts", id)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      console.error("Không tìm thấy buổi tập")
      return false
    }

    const existingData = workoutSnap.data()
    if (existingData.userId !== currentUser.uid) {
      console.error("Không có quyền cập nhật buổi tập này")
      return false
    }

    // Xử lý date nếu có
    const updateData: any = { ...workoutData }
    if (workoutData.date) {
      try {
        if (typeof workoutData.date === "string") {
          updateData.date = Timestamp.fromDate(new Date(workoutData.date))
        } else if (workoutData.date instanceof Date) {
          updateData.date = Timestamp.fromDate(workoutData.date)
        }
      } catch (error) {
        console.error("Lỗi khi xử lý date trong update:", error)
        // Giữ nguyên date cũ nếu có lỗi
        delete updateData.date
      }
    }

    // Cập nhật buổi tập
    await updateDoc(workoutRef, {
      ...updateData,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Lỗi khi cập nhật buổi tập:", error)
    throw error
  }
}

// Xóa buổi tập
export async function deleteWorkout(id: string): Promise<boolean> {
  if (!isBrowser || !db || !auth) {
    return false
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return false
    }

    // Kiểm tra xem buổi tập có thuộc về người dùng hiện tại không
    const workoutRef = doc(db, "workouts", id)
    const workoutSnap = await getDoc(workoutRef)

    if (!workoutSnap.exists()) {
      return false
    }

    const workoutData = workoutSnap.data()
    if (workoutData.userId !== currentUser.uid) {
      return false
    }

    // Xóa buổi tập
    await deleteDoc(workoutRef)
    return true
  } catch (error) {
    console.error("Lỗi khi xóa buổi tập:", error)
    throw error
  }
}

// Lấy danh sách bài tập
export async function getExerciseLibrary(): Promise<Exercise[]> {
  if (!isBrowser || !db) {
    return []
  }

  try {
    const exercisesRef = collection(db, "exercises")
    const querySnapshot = await getDocs(exercisesRef)
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Exercise[]
  } catch (error) {
    console.error("Lỗi khi lấy danh sách bài tập:", error)
    throw error
  }
}

// Thêm bài tập mới
export async function addExercise(exerciseData: Omit<Exercise, "id">): Promise<string | null> {
  if (!isBrowser || !db || !auth) {

    return null
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      console.error("Người dùng chưa đăng nhập")
      return null
    }

    const exercisesRef = collection(db, "exercises")
    const docRef = await addDoc(exercisesRef, {
      ...exerciseData,
      createdBy: currentUser.uid,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (error) {
    console.error("Lỗi khi thêm bài tập mới:", error)
    throw error
  }
}

// Lấy chi tiết bài tập
export async function getExercise(id: string): Promise<Exercise | null> {
  if (!isBrowser || !db) {
    return null
  }

  try {
    const exerciseRef = doc(db, "exercises", id)
    const exerciseSnap = await getDoc(exerciseRef)

    if (exerciseSnap.exists()) {
      return {
        id: exerciseSnap.id,
        ...exerciseSnap.data(),
      } as Exercise
    } else {
      return null
    }
  } catch (error) {
    console.error("Lỗi khi lấy chi tiết bài tập:", error)
    throw error
  }
}

// Cập nhật bài tập
export async function updateExercise(id: string, exerciseData: Partial<Exercise>): Promise<boolean> {
  if (!isBrowser || !db || !auth) {
    return false
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return false
    }

    const exerciseRef = doc(db, "exercises", id)
    await updateDoc(exerciseRef, {
      ...exerciseData,
      updatedBy: currentUser.uid,
      updatedAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    throw error
  }
}

// Xóa bài tập
export async function deleteExercise(id: string): Promise<boolean> {
  if (!isBrowser || !db || !auth) {
    return false
  }

  try {
    const currentUser = auth.currentUser
    if (!currentUser) {
      return false
    }

    const exerciseRef = doc(db, "exercises", id)
    await deleteDoc(exerciseRef)
    return true
  } catch (error) {
    throw error
  }
}
