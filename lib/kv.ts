import { kv } from "@vercel/kv"

export interface UserRole {
  uid: string
  email: string
  displayName?: string
  role: "admin" | "user"
  createdAt: number
  updatedAt?: number
}

// Prefix cho các key trong KV store
const USER_ROLE_PREFIX = "user_role:"
const ADMIN_LIST_KEY = "admin_list"

// Kiểm tra xem Vercel KV có khả dụng không
const isKVAvailable = async (): Promise<boolean> => {
  if (!kv) return false

  try {
    // Thử một thao tác đơn giản để kiểm tra kết nối
    await kv.ping()
    return true
  } catch (error) {
    console.error("Vercel KV không khả dụng:", error)
    return false
  }
}

// Lưu trữ vai trò người dùng tạm thời trong bộ nhớ khi KV không khả dụng
const memoryRoles: Record<string, UserRole> = {}
const memoryAdmins: Set<string> = new Set()
let firstAdminEmail: string | null = null

// Lấy vai trò của người dùng
export async function getUserRole(uid: string): Promise<UserRole | null> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      const role = await kv.get<UserRole>(`${USER_ROLE_PREFIX}${uid}`)
      return role
    } else {
      // Fallback sang bộ nhớ
      return memoryRoles[uid] || null
    }
  } catch (error) {
    console.error("Lỗi khi lấy vai trò người dùng:", error)
    // Fallback sang bộ nhớ
    return memoryRoles[uid] || null
  }
}

// Thiết lập vai trò cho người dùng
export async function setUserRole(userRole: Omit<UserRole, "createdAt" | "updatedAt">): Promise<boolean> {
  try {
    const now = Date.now()
    const existingRole = await getUserRole(userRole.uid)

    const roleData: UserRole = {
      ...userRole,
      createdAt: existingRole?.createdAt || now,
      updatedAt: now,
    }

    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      await kv.set(`${USER_ROLE_PREFIX}${userRole.uid}`, roleData)

      // Nếu là admin, thêm vào danh sách admin
      if (userRole.role === "admin") {
        await kv.sadd(ADMIN_LIST_KEY, userRole.uid)
      } else {
        // Nếu không phải admin, xóa khỏi danh sách admin (nếu có)
        await kv.srem(ADMIN_LIST_KEY, userRole.uid)
      }
    } else {
      // Fallback sang bộ nhớ
      memoryRoles[userRole.uid] = roleData

      if (userRole.role === "admin") {
        memoryAdmins.add(userRole.uid)
      } else {
        memoryAdmins.delete(userRole.uid)
      }
    }

    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập vai trò người dùng:", error)

    // Fallback sang bộ nhớ
    try {
      const now = Date.now()
      const existingRole = memoryRoles[userRole.uid]

      const roleData: UserRole = {
        ...userRole,
        createdAt: existingRole?.createdAt || now,
        updatedAt: now,
      }

      memoryRoles[userRole.uid] = roleData

      if (userRole.role === "admin") {
        memoryAdmins.add(userRole.uid)
      } else {
        memoryAdmins.delete(userRole.uid)
      }

      return true
    } catch (fallbackError) {
      console.error("Lỗi khi fallback sang bộ nhớ:", fallbackError)
      return false
    }
  }
}

// Kiểm tra người dùng có phải admin không
export async function isUserAdmin(uid: string): Promise<boolean> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      const userRole = await getUserRole(uid)
      return userRole?.role === "admin"
    } else {
      // Fallback sang bộ nhớ
      return memoryAdmins.has(uid) || memoryRoles[uid]?.role === "admin"
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra quyền admin:", error)
    // Fallback sang bộ nhớ
    return memoryAdmins.has(uid) || memoryRoles[uid]?.role === "admin"
  }
}

// Lấy danh sách tất cả người dùng có vai trò
export async function getAllUserRoles(): Promise<UserRole[]> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      // Lấy tất cả key có prefix USER_ROLE_PREFIX
      const keys = await kv.keys(`${USER_ROLE_PREFIX}*`)
      if (keys.length === 0) return []

      // Lấy dữ liệu cho tất cả key
      const roles = await Promise.all(keys.map((key) => kv.get<UserRole>(key)))

      // Lọc ra các giá trị không null
      return roles.filter((role) => role !== null) as UserRole[]
    } else {
      // Fallback sang bộ nhớ
      return Object.values(memoryRoles)
    }
  } catch (error) {
    console.error("Lỗi khi lấy danh sách vai trò người dùng:", error)
    // Fallback sang bộ nhớ
    return Object.values(memoryRoles)
  }
}

// Thay đổi hàm setupFirstAdmin để thêm thông tin gỡ lỗi và cho phép reset
export async function setupFirstAdmin(email: string, forceReset = false): Promise<boolean> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      // Kiểm tra xem đã có admin nào chưa
      const adminCount = await kv.scard(ADMIN_LIST_KEY)

      // Nếu đã có admin và không yêu cầu reset
      if (adminCount > 0 && !forceReset) {
        return false
      }

      // Nếu yêu cầu reset, xóa danh sách admin cũ
      if (forceReset) {
        await kv.del(ADMIN_LIST_KEY)
      }

      // Lưu email admin đầu tiên để xử lý khi người dùng đăng nhập
      await kv.set("first_admin_email", email)
    } else {
      // Fallback sang bộ nhớ
      if (memoryAdmins.size > 0 && !forceReset) {
        return false
      }

      if (forceReset) {
        memoryAdmins.clear()
      }

      firstAdminEmail = email
    }

    return true
  } catch (error) {
    console.error("Lỗi khi thiết lập admin đầu tiên:", error)

    // Fallback sang bộ nhớ
    try {
      if (memoryAdmins.size > 0 && !forceReset) {
        return false
      }

      if (forceReset) {
        memoryAdmins.clear()
      }

      firstAdminEmail = email
      return true
    } catch (fallbackError) {
      console.error("Lỗi khi fallback sang bộ nhớ:", fallbackError)
      return false
    }
  }
}

// Kiểm tra và cấp quyền admin đầu tiên khi đăng nhập
export async function checkAndSetupFirstAdmin(user: {
  uid: string
  email: string
  displayName?: string
}): Promise<boolean> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      const firstAdminEmail = await kv.get<string>("first_admin_email")

      if (firstAdminEmail && firstAdminEmail === user.email) {
        // Thiết lập người dùng này làm admin
        await setUserRole({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin",
        })

        // Xóa email admin đầu tiên để không cấp quyền nữa
        await kv.del("first_admin_email")
        return true
      }
    } else {
      // Fallback sang bộ nhớ
      if (firstAdminEmail && firstAdminEmail === user.email) {
        await setUserRole({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin",
        })

        firstAdminEmail = null
        return true
      }
    }

    return false
  } catch (error) {
    console.error("Lỗi khi kiểm tra và thiết lập admin đầu tiên:", error)

    // Fallback sang bộ nhớ
    try {
      if (firstAdminEmail && firstAdminEmail === user.email) {
        memoryRoles[user.uid] = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: "admin",
          createdAt: Date.now(),
        }

        memoryAdmins.add(user.uid)
        firstAdminEmail = null
        return true
      }

      return false
    } catch (fallbackError) {
      console.error("Lỗi khi fallback sang bộ nhớ:", fallbackError)
      return false
    }
  }
}

// Thêm hàm mới để reset danh sách admin
export async function resetAdminList(): Promise<boolean> {
  try {
    // Kiểm tra KV có khả dụng không
    if (await isKVAvailable()) {
      await kv.del(ADMIN_LIST_KEY)
      await kv.del("first_admin_email")
    } else {
      // Fallback sang bộ nhớ
      memoryAdmins.clear()
      firstAdminEmail = null

      // Xóa vai trò admin trong bộ nhớ
      Object.keys(memoryRoles).forEach((uid) => {
        if (memoryRoles[uid].role === "admin") {
          memoryRoles[uid] = {
            ...memoryRoles[uid],
            role: "user",
            updatedAt: Date.now(),
          }
        }
      })

    }

    return true
  } catch (error) {
    console.error("Lỗi khi reset danh sách admin:", error)

    // Fallback sang bộ nhớ
    try {
      memoryAdmins.clear()
      firstAdminEmail = null

      // Xóa vai trò admin trong bộ nhớ
      Object.keys(memoryRoles).forEach((uid) => {
        if (memoryRoles[uid].role === "admin") {
          memoryRoles[uid] = {
            ...memoryRoles[uid],
            role: "user",
            updatedAt: Date.now(),
          }
        }
      })

      return true
    } catch (fallbackError) {
      console.error("Lỗi khi fallback sang bộ nhớ:", fallbackError)
      return false
    }
  }
}
