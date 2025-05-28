"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface ExerciseSet {
    reps: string
    weight: string
}

interface AddSetModalProps {
    onAddSets: (sets: ExerciseSet[]) => void
    currentSetCount: number
}

export function AddSetModal({ onAddSets, currentSetCount }: AddSetModalProps) {
    const [open, setOpen] = useState(false)
    const [sets, setSets] = useState<ExerciseSet[]>([{ reps: "", weight: "" }])

    const addSet = () => {
        setSets([...sets, { reps: "", weight: "" }])
    }

    const removeSet = (index: number) => {
        if (sets.length > 1) {
            setSets(sets.filter((_, i) => i !== index))
        }
    }

    const updateSet = (index: number, field: "reps" | "weight", value: string) => {
        setSets(sets.map((set, i) => (i === index ? { ...set, [field]: value } : set)))
    }


    const handleSubmit = () => {
        // Lọc ra các set hợp lệ (có cả reps và weight)
        const validSets = sets.filter(set => set.reps.trim() && set.weight.trim())

        if (validSets.length === 0) {
            return // Không có set nào hợp lệ
        }

        // Gọi callback với tất cả valid sets
        onAddSets(validSets)

        // Reset form và đóng modal
        setSets([{ reps: "", weight: "" }])
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button type="button" variant="ghost" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> Thêm Set
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <DialogTitle>Thêm Sets (hiện có: {currentSetCount})</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="flex justify-between items-center mb-2">
                        <Label>Danh sách Sets</Label>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={addSet}
                            aria-label="Thêm set mới"
                        >
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>

                    {sets.map((set, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <div className="w-8 text-center text-sm font-medium">{index + 1}</div>
                            <Input
                                type="number"
                                placeholder="Reps"
                                value={set.reps}
                                onChange={(e) => updateSet(index, "reps", e.target.value)}
                                className="flex-1"
                                min="1"
                            />
                            <Input
                                type="number"
                                placeholder="Kg"
                                value={set.weight}
                                onChange={(e) => updateSet(index, "weight", e.target.value)}
                                className="flex-1"
                                min="0"
                                step="0.5"
                            />
                            {sets.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSet(index)}
                                    aria-label="Xóa set"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            )}
                        </div>
                    ))}

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => {
                            setSets([{ reps: "", weight: "" }])
                            setOpen(false)
                        }}>
                            Hủy
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={!sets.some(s => s.reps.trim() && s.weight.trim())}
                        >
                            Thêm {sets.filter(s => s.reps.trim() && s.weight.trim()).length} Sets
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}