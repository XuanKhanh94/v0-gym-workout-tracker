"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronLeft } from "lucide-react"
import { addExercise } from "@/lib/firebase-service"
import { useToast } from "@/hooks/use-toast"

export default function NewExercisePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [name, setName] = useState("")
  const [muscleGroup, setMuscleGroup] = useState("")
  const [equipment, setEquipment] = useState("")
  const [difficulty, setDifficulty] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !muscleGroup || !equipment || !difficulty) {
      toast({
        title: "Thiếu thông tin",
        description: "Vui lòng điền đầy đủ thông tin bài tập.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const exerciseData = {
        name,
        muscleGroup,
        equipment,
        difficulty,
        description,
      }

      const exerciseId = await addExercise(exerciseData)

      if (exerciseId) {
        toast({
          title: "Thành công",
          description: "Đã thêm bài tập mới vào thư viện.",
        })
        router.push("/exercises")
      } else {
        throw new Error("Không thể thêm bài tập")
      }
    } catch (error) {
      console.error("Lỗi khi thêm bài tập:", error)
      toast({
        title: "Lỗi",
        description: "Đã xảy ra lỗi khi thêm bài tập. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/exercises">
          <Button variant="ghost" className="pl-0">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Thêm bài tập mới</h1>
        <p className="text-muted-foreground">Thêm bài tập mới vào thư viện</p>
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
                  <SelectItem value="Tay">Tay</SelectItem>
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
              <Link href="/exercises">
                <Button variant="outline" type="button">
                  Hủy
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Đang lưu..." : "Lưu bài tập"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
