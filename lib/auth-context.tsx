"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth"
import { auth } from "./firebase"
import { getUserRole, isUserAdmin, checkAndSetupFirstAdmin, setUserRole } from "./firestore-auth"

// Kiểm tra xem chúng ta đang ở môi trường browser hay không
const isBrowser = typeof window !== "undefined"

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  adminLoading: boolean
  adminCheckCompleted: boolean
  adminDebugInfo: any
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  checkAdminStatus: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  adminLoading: true,
  adminCheckCompleted: false,
  adminDebugInfo: null,
  signUp: async () => { },
  signIn: async () => { },
  signInWithGoogle: async () => { },
  logout: async () => { },
  checkAdminStatus: async () => false,
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminLoading, setAdminLoading] = useState(true)
  const [adminCheckCompleted, setAdminCheckCompleted] = useState(false)
  const [adminDebugInfo, setAdminDebugInfo] = useState<any>(null)

  // Kiểm tra quyền admin
  const checkAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false)
      setAdminLoading(false)
      setAdminCheckCompleted(true)
      setAdminDebugInfo({ error: "Người dùng chưa đăng nhập" })
      return false
    }

    try {
      setAdminLoading(true)
      // Lấy vai trò người dùng từ Firestore
      const userRole = await getUserRole(user.uid)
      // Kiểm tra quyền admin
      const isUserAdminResult = await isUserAdmin(user.uid)
      // Lưu thông tin debug
      const debugInfo = {
        uid: user.uid,
        email: user.email,
        userRole,
        isUserAdminResult,
        timestamp: new Date().toISOString(),
      }
      setAdminDebugInfo(debugInfo)

      // Cập nhật trạng thái
      setIsAdmin(isUserAdminResult)
      setAdminCheckCompleted(true)

      // Lưu trạng thái admin vào localStorage để debug
      if (isBrowser) {
        localStorage.setItem(
          "gymtracker_admin_status",
          JSON.stringify({
            isAdmin: isUserAdminResult,
            timestamp: new Date().toISOString(),
            email: user.email,
          }),
        )
      }

      return isUserAdminResult
    } catch (error) {
      setIsAdmin(false)
      setAdminCheckCompleted(true)
      setAdminDebugInfo({ error: String(error) })
      return false
    } finally {
      setAdminLoading(false)
    }
  }

  // Đảm bảo người dùng có bản ghi vai trò
  const ensureUserRole = async (user: User) => {
    try {
      // Kiểm tra xem người dùng có phải là admin đầu tiên không
      const isFirstAdmin = await checkAndSetupFirstAdmin({
        uid: user.uid,
        email: user.email || "",
        displayName: user.displayName || undefined,
      }).catch((err) => {
        console.error("Lỗi khi kiểm tra admin đầu tiên:", err)
        return false
      })
      // Kiểm tra xem người dùng đã có vai trò chưa
      const userRole = await getUserRole(user.uid).catch((err) => {
        return null
      })


      // Nếu chưa có vai trò, tạo vai trò mặc định là user
      if (!userRole) {
        await setUserRole({
          uid: user.uid,
          email: user.email || "",
          displayName: user.displayName || undefined,
          role: "user",
        }).catch((err) => {
          console.error("Lỗi khi thiết lập vai trò người dùng:", err)
        })
      }

      // Luôn kiểm tra quyền admin sau khi xử lý vai trò
      await checkAdminStatus()
    } catch (error) {
      setAdminCheckCompleted(true)
    }
  }

  // Khôi phục trạng thái admin từ localStorage (chỉ để debug)
  useEffect(() => {
    if (isBrowser && user) {
      try {
        const savedAdminStatus = localStorage.getItem("gymtracker_admin_status")
        if (savedAdminStatus) {
          const parsed = JSON.parse(savedAdminStatus)
          // Chỉ khôi phục nếu email trùng khớp và thời gian không quá 1 giờ
          const storedTime = new Date(parsed.timestamp).getTime()
          const currentTime = new Date().getTime()
          const oneHour = 60 * 60 * 1000

          if (parsed.email === user.email && currentTime - storedTime < oneHour) {
            setIsAdmin(parsed.isAdmin)
          }
        }
      } catch (error) {
        console.error("Lỗi khi khôi phục trạng thái admin:", error)
      }
    }
  }, [user])

  useEffect(() => {
    // Chỉ đăng ký listener khi ở browser và auth đã được khởi tạo
    if (isBrowser && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        setUser(user)

        if (user) {
          // Đảm bảo người dùng có bản ghi vai trò và kiểm tra quyền admin
          try {
            await ensureUserRole(user)
          } catch (error) {
            console.error("Lỗi khi xử lý vai trò người dùng:", error)
          }
        } else {
          setIsAdmin(false)
          setAdminLoading(false)
        }

        setLoading(false)
      })

      return () => unsubscribe()
    } else {
      // Nếu không ở browser hoặc auth chưa được khởi tạo, đánh dấu là đã tải xong
      setLoading(false)
      setAdminLoading(false)
    }
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(userCredential.user, { displayName })

      // Tạo vai trò cho người dùng mới
      try {
        await setUserRole({
          uid: userCredential.user.uid,
          email: userCredential.user.email || "",
          displayName: userCredential.user.displayName || undefined,
          role: "user",
        })
      } catch (error) {
        console.error("Lỗi khi tạo vai trò người dùng, nhưng vẫn tiếp tục:", error)
      }
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error)
      throw error
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      const provider = new GoogleAuthProvider()

      // Thêm các scopes nếu cần
      provider.addScope("profile")
      provider.addScope("email")

      // Đặt tham số tùy chỉnh
      provider.setCustomParameters({
        prompt: "select_account",
      })

      const result = await signInWithPopup(auth, provider)
      return result.user
    } catch (error: any) {
      console.error("Lỗi chi tiết khi đăng nhập bằng Google:", error)
      console.error("Error code:", error.code)
      console.error("Error message:", error.message)

      if (error.code === "auth/unauthorized-domain") {
        const currentDomain = window.location.hostname
        console.error(
          `Domain hiện tại "${currentDomain}" không được phép. Vui lòng thêm domain này vào danh sách Authorized domains trong Firebase Console.`,
        )
        throw new Error(
          `Domain "${currentDomain}" chưa được thêm vào danh sách domain được phép trong Firebase Console.`,
        )
      }

      // Xử lý các lỗi khác...
      if (error.code === "auth/popup-closed-by-user") {
        throw new Error("Đăng nhập bị hủy. Vui lòng thử lại.")
      }

      // Ném lại lỗi với thông tin chi tiết hơn
      throw {
        code: error.code,
        message: error.message,
        fullError: error,
      }
    }
  }

  const logout = async () => {
    if (!auth) throw new Error("Auth not initialized")

    try {
      await signOut(auth)
      setIsAdmin(false)

      // Xóa trạng thái admin khỏi localStorage khi đăng xuất
      if (isBrowser) {
        localStorage.removeItem("gymtracker_admin_status")
      }
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    isAdmin,
    adminLoading,
    adminCheckCompleted,
    adminDebugInfo,
    signUp,
    signIn,
    signInWithGoogle,
    logout,
    checkAdminStatus,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
