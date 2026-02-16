"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { useState } from "react"
import { FaXmark } from "react-icons/fa6"
import { ClipLoader } from "react-spinners"

type Props = {
  onCancel: () => void
  onConfirm: () => void
  isDeleteModalOpen: boolean
  setIsDeleteModalOpen: (isDeleteModalOpen: boolean) => void
}

export function DeleteProductModal({
  onCancel,
  onConfirm,
  isDeleteModalOpen,
  setIsDeleteModalOpen,
}: Props) {
  const [isLoading, setIsLoading] = useState(false)

  const handleConfirm = async () => {
    setIsLoading(!isLoading)

    try {
      onConfirm()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog
      open={isDeleteModalOpen}
      onOpenChange={(open) => !open && setIsDeleteModalOpen(false)}
    >
      <DialogContent className="w-[342px] max-w-[342px] rounded-lg border-none p-4 md:w-[700px] md:max-w-[700px] md:p-6 [&>button]:hidden">
        <DialogHeader className="gap-[6px] space-y-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="my-1 text-sm text-[#18181B]">
              Видалення
            </DialogTitle>
            <div
              className="flex h-5 w-5 cursor-pointer items-center justify-center"
              onClick={onCancel}
            >
              <FaXmark size={16} />
            </div>
          </div>
          <DialogDescription className="text-start text-sm text-[#A1A1AA]">
            Ви впевнені, що бажаєте видалити товар?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <div className="flex w-full justify-end gap-2">
            <button
              disabled={isLoading}
              onClick={onCancel}
              className="flex h-9 items-center justify-center rounded-md border border-[#2563EB] bg-white px-4 py-2 text-sm font-medium text-[#2563EB] hover:bg-[#EFF6FF] focus:border-[#2563EB] focus:outline-none"
            >
              Скасувати
            </button>
            <button
              disabled={isLoading}
              onClick={handleConfirm}
              className="flex h-9 min-w-[100px] items-center justify-center rounded-md bg-[#DC2626] px-4 py-2 text-sm font-medium text-[#FEF2F2] hover:bg-[#DC2626E6] focus:border-none focus:outline-none"
            >
              {isLoading ? (
                <ClipLoader color="#FEF2F2" size={15} />
              ) : (
                "Видалити"
              )}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
