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
    console.log(`🔍 Đang lấy vai trò cho user: ${uid}`)
    const userRoleRef = doc(db, USER_ROLES_COLLECTION, uid)
    const userRoleSnap = await getDoc(userRoleRef)

    if (userRoleSnap.exists()) {
      const data = userRoleSnap.data() as UserRole
      console.log(`✅ Đã tìm thấy vai trò: ${data.role} cho user: ${data.email}`)
      return data
    }

    console.log(`❌ Không tìm thấy vai trò cho user: ${uid}`)
    return null
  } catch (error) {
    console.error("Lỗi khi lấy vai trò người dùng:", error)
    return null
  }
}

// Thiết lập vai trò cho người dùng
export async function setUserRole(userRole: Omit<UserRole, "createdAt" | "updatedAt">): Promise<boolean> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
    return false
  }

  try {
    console.log(`🔧 Đang thiết lập vai trò ${userRole.role} cho user: ${userRole.email}`)
    const userRoleRef = doc(db, USER_ROLES_COLLECTION, userRole.uid)
    const existingRole = await getDoc(userRoleRef)

    const roleData: UserRole = {
      ...userRole,
      createdAt: existingRole.exists() ? existingRole.data().createdAt : serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    await setDoc(userRoleRef, roleData)
    console.log(`✅ Đã thiết lập vai trò ${userRole.role} cho người dùng ${userRole.email}`)
    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập vai trò người dùng:", error)
    return false
  }
}

// Kiểm tra người dùng có phải admin không
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    console.log("🔍 Đang kiểm tra quyền admin cho uid:", uid)
    const userRole = await getUserRole(uid)

    if (!userRole) {
      console.log("❌ Không tìm thấy vai trò cho user:", uid)
      return false
    }

    const isAdmin = userRole?.role === "admin"
    console.log(`${isAdmin ? "✅" : "❌"} User ${userRole.email} ${isAdmin ? "có" : "không có"} quyền admin`)

    return isAdmin
  } catch (error) {
    console.error("❌ Lỗi khi kiểm tra quyền admin:", error)
    return false
  }
}

// Lấy danh sách tất cả người dùng có vai trò
export async function getAllUserRoles(): Promise<UserRole[]> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
    return []
  }

  try {
    console.log("🔍 Đang lấy danh sách tất cả vai trò người dùng")
    const userRolesRef = collection(db, USER_ROLES_COLLECTION)
    const querySnapshot = await getDocs(userRolesRef)

    const roles = querySnapshot.docs.map((doc) => doc.data() as UserRole)
    console.log(`✅ Đã lấy ${roles.length} vai trò người dùng`)
    return roles
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vai trò người dùng:", error)
    return []
  }
}

// Thiết lập admin đầu tiên
export async function setupFirstAdmin(email: string, forceReset = false): Promise<boolean> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
    return false
  }

  try {
    // Kiểm tra xem đã có admin nào chưa
    const adminQuery = query(collection(db, USER_ROLES_COLLECTION), where("role", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)

    console.log(`Số lượng admin hiện tại: ${adminSnapshot.docs.length}`)

    // Nếu đã có admin và không yêu cầu reset
    if (adminSnapshot.docs.length > 0 && !forceReset) {
      console.log("Đã có admin trong hệ thống, không thể thiết lập admin đầu tiên")
      return false
    }

    // Nếu yêu cầu reset, xóa tất cả admin cũ
    if (forceReset && adminSnapshot.docs.length > 0) {
      console.log("Đang reset danh sách admin...")
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
      console.log("Đã reset tất cả admin thành user")
    }

    // Lưu email admin đầu tiên
    const adminSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, "firstAdmin")
    await setDoc(adminSettingsRef, {
      email: email,
      createdAt: serverTimestamp(),
    })

    console.log(`Đã thiết lập ${email} làm admin đầu tiên`)
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
    console.error("Firestore chưa được khởi tạo")
    return false
  }

  try {
    console.log("🔍 Đang kiểm tra admin đầu tiên cho:", user.email)
    const adminSettingsRef = doc(db, ADMIN_SETTINGS_COLLECTION, "firstAdmin")
    const adminSettingsSnap = await getDoc(adminSettingsRef)

    if (adminSettingsSnap.exists()) {
      const { email: firstAdminEmail } = adminSettingsSnap.data()
      console.log("Email admin đầu tiên:", firstAdminEmail)
      console.log("Email người dùng hiện tại:", user.email)

      if (firstAdminEmail === user.email) {
        console.log("Người dùng này là admin đầu tiên, đang cấp quyền admin...")
        // Thiết lập người dùng này làm admin
        await setUserRole({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin",
        })

        // Xóa thiết lập admin đầu tiên để không cấp quyền nữa
        await adminSettingsRef.delete()
        console.log(`✅ Đã cấp quyền admin cho ${user.email}`)
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Lỗi khi kiểm tra và thiết lập admin đầu tiên:", error)
    return false
  }
}

// Reset danh sách admin
export async function resetAdminList(): Promise<boolean> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
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

    console.log("Đã reset danh sách admin và thiết lập admin đầu tiên")
    return true
  } catch (error) {
    console.error("Lỗi khi reset danh sách admin:", error)
    return false
  }
}

// Kiểm tra xem có admin nào trong hệ thống không
export async function hasAnyAdmin(): Promise<boolean> {
  if (!db) {
    console.error("Firestore chưa được khởi tạo")
    return false
  }

  try {
    const adminQuery = query(collection(db, USER_ROLES_COLLECTION), where("role", "==", "admin"))
    const adminSnapshot = await getDocs(adminQuery)
    return adminSnapshot.docs.length > 0
  } catch (error) {
    console.error("Lỗi khi kiểm tra admin:", error)
    return false
  }
}
