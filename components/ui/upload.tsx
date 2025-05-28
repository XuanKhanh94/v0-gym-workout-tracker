"use client"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface UploadProps {
    multiple?: boolean
    accept?: string
    maxFiles?: number
    onUpload: (files: File[]) => void
}

export function Upload({ multiple = false, accept, maxFiles, onUpload }: UploadProps) {
    const [files, setFiles] = useState<File[]>([])

    const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files)
            if (maxFiles && selectedFiles.length > maxFiles) {
                alert(`Chỉ được chọn tối đa ${maxFiles} ảnh`)
                return
            }
            setFiles(selectedFiles)
            onUpload(selectedFiles)
        }
    }, [maxFiles, onUpload])

    return (
        <div className="flex items-center gap-2">
            <Input
                type="file"
                multiple={multiple}
                accept={accept}
                onChange={handleFileChange}
                className="hidden"
                id="upload-input"
            />
            <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('upload-input')?.click()}
            >
                Chọn ảnh
            </Button>
            {files.length > 0 && (
                <span className="text-sm text-muted-foreground">
                    Đã chọn {files.length} ảnh
                </span>
            )}
        </div>
    )
}