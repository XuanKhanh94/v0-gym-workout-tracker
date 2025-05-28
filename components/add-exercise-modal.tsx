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

interface ExerciseData {
    name: string
    sets: ExerciseSet[]
}

interface AddExerciseModalProps {
    onAddExercise: (exercise: ExerciseData) => void
    exerciseLibrary: any[]
}

export function AddExerciseModal({ onAddExercise, exerciseLibrary }: AddExerciseModalProps) {
    const [open, setOpen] = useState(false)
    const [exerciseName, setExerciseName] = useState("")
    const [sets, setSets] = useState<ExerciseSet[]>([{ reps: "", weight: "" }])
    const [showSuggestions, setShowSuggestions] = useState(false)

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
        if (!exerciseName.trim()) {
            return
        }

        const hasValidSets = sets.some((set) => set.reps && set.weight)
        if (!hasValidSets) {
            return
        }

        const validSets = sets.filter((set) => set.reps && set.weight)

        onAddExercise({
            name: exerciseName,
            sets: validSets,
        })

        // Reset form
        setExerciseName("")
        setSets([{ reps: "", weight: "" }])
        setOpen(false)
    }

    const handleSelectSuggestion = (name: string) => {
        setExerciseName(name)
        setShowSuggestions(false)
    }

    const filteredExercises = exerciseLibrary.filter((exercise) =>
        exercise.name.toLowerCase().includes(exerciseName.toLowerCase()),
    )

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm bài tập
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Thêm bài tập mới</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <div>
                        <Label htmlFor="exercise-name">Tên bài tập</Label>
                        <div className="relative">
                            <Input
                                id="exercise-name"
                                placeholder="Tìm kiếm bài tập..."
                                value={exerciseName}
                                onChange={(e) => {
                                    setExerciseName(e.target.value)
                                    setShowSuggestions(true)
                                }}
                                onFocus={() => setShowSuggestions(true)}
                            />

                            {showSuggestions && exerciseName.trim() && (
                                <div className="absolute z-10 top-full mt-1 w-full bg-white border border-gray-200 rounded shadow-md max-h-48 overflow-auto">
                                    {filteredExercises.length === 0 ? (
                                        <div className="px-4 py-2 text-muted-foreground">Bài tập không tìm thấy</div>
                                    ) : (
                                        filteredExercises.map((exercise) => (
                                            <div
                                                key={exercise.id}
                                                onClick={() => handleSelectSuggestion(exercise.name)}
                                                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                                            >
                                                {exercise.name}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label>Sets</Label>
                            <Button type="button" variant="ghost" size="sm" onClick={addSet}>
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
                                />
                                <Input
                                    type="number"
                                    placeholder="Kg"
                                    value={set.weight}
                                    onChange={(e) => updateSet(index, "weight", e.target.value)}
                                    className="flex-1"
                                />
                                {sets.length > 1 && (
                                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSet(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handleSubmit}>Thêm bài tập</Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
