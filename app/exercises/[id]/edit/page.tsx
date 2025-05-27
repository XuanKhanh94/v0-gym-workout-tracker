"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Firebase imports
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Types
interface Exercise {
  id: string
  name: string
  muscleGroup: string
  equipment: string
  difficulty: string
  description?: string
  createdAt: Date
  updatedAt: Date
}

export default function EditExercisePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [equipment, setEquipment] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      if (!params.id) return

      try {
        const exerciseRef = doc(db, "exercises", params.id as string)
        const exerciseSnap = await getDoc(exerciseRef)

        if (exerciseSnap.exists()) {
          const data = exerciseSnap.data() as Omit<Exercise, "id">
          setName(data.name || "")
          setMuscleGroup(data.muscleGroup || "")
          setEquipment(data.equipment || "")
          setDifficulty(data.difficulty || "")
          setDescription(data.description || "")
        } else {
          toast({
            title: "Lỗi",
            description: "Không tìm thấy bài tập.",
            variant: "destructive",
          })
          router.push("/exercises")
        }
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài tập:", error)
        toast({
          title: "Lỗi",
          description: "Đã xảy ra lỗi khi lấy thông tin bài tập.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [params.id, router, toast])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    console.log("Form submitted - starting save process")

    if (!name || !muscleGroup || !equipment || !difficulty) {
      console.log("Validation failed - missing required fields")
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bài tập.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    console.log("Setting saving state to true")

    try {
      console.log("Starting Firebase update...")
      const exerciseRef = doc(db, "exercises", params.id as string)

      await updateDoc(exerciseRef, {
        name,
        muscleGroup,
        equipment,
        difficulty,
        description,
        updatedAt: new Date(),
      })

      console.log("Firebase update successful!")

      toast({
        title: "Thành công",
        description: "Đã cập nhật bài tập.",
      })

      console.log("Toast displayed, attempting redirect...")

      // Try multiple redirect methods
      try {
        console.log("Trying router.push...")
        router.push("/exercises")

        // Fallback with window.location
        // setTimeout(() => {
        //   console.log("Fallback redirect with window.location...")
        //   if (typeof window !== "undefined") {
        //     window.location.href = "/exercises"
        //   }
        // }, 1000)
        router.push("/exercises")

      } catch (redirectError) {
        console.error("Router.push failed:", redirectError)
        // Force redirect with window.location
        if (typeof window !== "undefined") {
          console.log("Using window.location as fallback...")
          window.location.href = "/exercises"
        }
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật bài tập:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi cập nhật bài tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      console.log("Setting saving state to false")
      setSaving(false)
    }
  }


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Đang tải...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href={`/exercises/${params.id}`}>
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Chỉnh sửa bài tập</h1>
        <p className="text-muted-foreground">Cập nhật thông tin bài tập</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Thông tin bài tập</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Tên bài tập</Label>
              <Input
                id="name"
                placeholder="Ví dụ: Bench Press"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="muscle-group">Nhóm cơ</Label>
              <Select value={muscleGroup} onValueChange={setMuscleGroup} required>
                <SelectTrigger id="muscle-group">
                  <SelectValue placeholder="Chọn nhóm cơ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ngực">Ngực</SelectItem>
                  <SelectItem value="Lưng">Lưng</SelectItem>
                  <SelectItem value="Vai">Vai</SelectItem>
                  <SelectItem value="Chân">Chân</SelectItem>
                  <SelectItem value="Tay trước">Tay trước</SelectItem>
                  <SelectItem value="Tay sau">Tay sau</SelectItem>
                  <SelectItem value="Bụng">Bụng</SelectItem>
                  <SelectItem value="Toàn thân">Toàn thân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="equipment">Thiết bị</Label>
              <Select value={equipment} onValueChange={setEquipment} required>
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="Chọn thiết bị" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Barbell">Barbell</SelectItem>
                  <SelectItem value="Dumbbell">Dumbbell</SelectItem>
                  <SelectItem value="Machine">Machine</SelectItem>
                  <SelectItem value="Cable">Cable</SelectItem>
                  <SelectItem value="Bodyweight">Bodyweight</SelectItem>
                  <SelectItem value="Kettlebell">Kettlebell</SelectItem>
                  <SelectItem value="Resistance Band">Resistance Band</SelectItem>
                  <SelectItem value="Other">Khác</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty} required>
                <SelectTrigger id="difficulty">
                  <SelectValue placeholder="Chọn độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dễ">Dễ</SelectItem>
                  <SelectItem value="Trung bình">Trung bình</SelectItem>
                  <SelectItem value="Khó">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                placeholder="Mô tả về bài tập, cách thực hiện, lợi ích..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
              />
            </div>

            <div className="flex justify-end gap-4">
              <Link href={`/exercises/${params.id}`}>
                <Button variant="outline" type="button">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={saving}>
                {saving ? "Đang lưu..." : "Lưu thay đổi"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
