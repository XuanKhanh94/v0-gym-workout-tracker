import { db } from "./firebase"
import { collection, doc, getDoc, setDoc, getDocs, query, where, serverTimestamp, updateDoc } from "firebase/firestore"

export interface UserRole {
  uid: string
  email: string
  displayName?: string
  role: "admin" | "user"
  createdAt: any
  updatedAt?: any
}

// Collection name cho user roles
const USER_ROLES_COLLECTION = "userRoles"
const ADMIN_SETTINGS_COLLECTION = "adminSettings"

// Lấy vai trò của người dùng
export async function getUserRole(uid: string): Promise<UserRole | null> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
    return null
  }

  try {
    const userRoleRef = doc(db, USER_ROLES_COLLECTION, uid)
    const userRoleSnap = await getDoc(userRoleRef)

    if (userRoleSnap.exists()) {
      const data = userRoleSnap.data() as UserRole
      return data
    }

    return null
  } catch (error) {
    console.error("Lỗi khi lấy vai trò người dùng:", error)
    return null
  }
}

// Thiết lập vai trò cho người dùng
export async function setUserRole(userRole: Omit<UserRole, "createdAt" | "updatedAt">): Promise<boolean> {
  if (!db) {
    return false
  }

  try {
    const userRoleRef = doc(db, USER_ROLES_COLLECTION, userRole.uid)
    const existingRole = await getDoc(userRoleRef)

    const roleData: UserRole = {
      ...userRole,
      createdAt: existingRole.exists() ? existingRole.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(userRoleRef, roleData)
    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập vai trò người dùng:", error)
    return false
  }
}

// Kiểm tra người dùng có phải admin không
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    const userRole = await getUserRole(uid)

    if (!userRole) {
      return false
    }

    const isAdmin = userRole?.role === "admin"
    return isAdmin
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra quyền admin:", error)
    return false
  }
}

// Lấy danh sách tất cả người dùng có vai trò
export async function getAllUserRoles(): Promise<UserRole[]> {
  if (!db) {
    return []
  }

  try {
    const userRolesRef = collection(db, USER_ROLES_COLLECTION)
    const querySnapshot = await getDocs(userRolesRef)

    const roles = querySnapshot.docs.map((doc) => doc.data() as UserRole)
    return roles
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vai trò người dùng:", error)
    return []
  }
}

// Thiết lập admin đầu tiên
export async function setupFirstAdmin(email: string, forceReset = false): Promise<boolean> {
  if (!db) {
    return false
  }

  try {
    // Kiểm tra xem đã có admin nào chưa
    const adminQuery = query(collection(db, USER_ROLES_COLLECTION), where("role", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)

    // Nếu đã có admin và không yêu cầu reset
    if (adminSnapshot.docs.length > 0 && !forceReset) {
      return false
    }

    // Nếu yêu cầu reset, xóa tất cả admin cũ
    if (forceReset && adminSnapshot.docs.length > 0) {
      const batch = []
      for (const doc of adminSnapshot.docs) {
        const userRef = doc.ref
        batch.push(
          updateDoc(userRef, {
            role: "user",
            updatedAt: serverTimestamp(),
          }),
        )
      }
      await Promise.all(batch)
    }

    // Lưu email admin đầu tiên
    const adminSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, "firstAdmin")
    await setDoc(adminSettingsRef, {
      email: email,
      createdAt: serverTimestamp(),
    })

    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập admin đầu tiên:", error)
    return false
  }
}

// Kiểm tra và cấp quyền admin đầu tiên khi đăng nhập
export async function checkAndSetupFirstAdmin(user: {
  uid: string
  email: string
  displayName?: string
}): Promise<boolean> {
  if (!db) {
    return false
  }

  try {
    const adminSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, "firstAdmin")
    const adminSettingsSnap = await getDoc(adminSettingsRef)

    if (adminSettingsSnap.exists()) {
      const { email: firstAdminEmail } = adminSettingsSnap.data()

      if (firstAdminEmail === user.email) {
        // Thiết lập người dùng này làm admin
        await setUserRole({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin",
        })

        // Xóa thiết lập admin đầu tiên để không cấp quyền nữa
        await adminSettingsRef.delete()
        return true
      }
    }

    return false
  } catch (error) {
    return false
  }
}

// Reset danh sách admin
export async function resetAdminList(): Promise<boolean> {
  if (!db) {
    return false
  }

  try {
    // Lấy tất cả admin hiện tại
    const adminQuery = query(collection(db, USER_ROLES_COLLECTION), where("role", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)

    // Chuyển tất cả admin thành user
    const batch = []
    for (const doc of adminSnapshot.docs) {
      const userRef = doc.ref
      batch.push(
        updateDoc(userRef, {
          role: "user",
          updatedAt: serverTimestamp(),
        }),
      )
    }
    await Promise.all(batch)

    // Xóa thiết lập admin đầu tiên
    const adminSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, "firstAdmin")
    await adminSettingsRef.delete()
    return true
  } catch (error) {
    console.error("Lỗi khi reset danh sách admin:", error)
    return false
  }
}

// Kiểm tra xem có admin nào trong hệ thống không
export async function hasAnyAdmin(): Promise<boolean> {
  if (!db) {
    return false
  }

  try {
    const adminQuery = query(collection(db, USER_ROLES_COLLECTION), where("role", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)
    return adminSnapshot.docs.length > 0
  } catch (error) {
    return false
  }
}
