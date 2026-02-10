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

  const handleConfirm = () => {
    setIsLoading(true)

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
      <DialogContent className="w-[700px] max-w-[700px] border-none p-6 [&>button]:hidden">
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
          <DialogDescription className="text-sm text-[#A1A1AA]">
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
              className="flex h-9 items-center justify-center rounded-md bg-[#DC2626] px-4 py-2 text-sm font-medium text-[#FEF2F2] hover:bg-[#DC2626E6] focus:border-none focus:outline-none"
            >
              {isLoading ? (
                <ClipLoader color="#e3e3e380" size={15} />
              ) : (
                "Видалити"
              )}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    // <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
    //   <DialogContent className="flex w-[300px] flex-col items-center gap-0 overflow-hidden rounded-[5px] bg-[#1A1A1B] p-0">
    //     <DialogTitle className="flex h-[27px] w-[300px] items-center bg-[#262628]">
    //       <p className="ml-[13px] text-[11px] font-medium text-white/90">
    //         Видалення
    //       </p>
    //     </DialogTitle>

    //     <div className="flex w-full flex-1 flex-col p-[13px]">
    //       <p className="mb-3 flex-1 pr-4 text-[13px] font-medium text-white/90">
    //         Ви впевнені, що бажаєте видалити товар?
    //       </p>

    //       <div className="flex w-full justify-end">
    //         <button
    //           disabled={isLoading}
    //           onClick={onCancel}
    //           className="h-9 rounded-[3px] px-4 text-[13px] font-medium text-[#2563EB] hover:bg-[#282828] focus:border-none focus:outline-none"
    //         >
    //           Скасувати
    //         </button>
    //         <button
    //           disabled={isLoading}
    //           onClick={handleConfirm}
    //           className={cn(
    //             "flex w-[70px] items-center justify-center rounded-[3px] px-[14px] text-[13px] font-medium hover:bg-[#282828] focus:border-none focus:outline-none",
    //             confirmColor && `${confirmColor}`
    //           )}
    //         >
    //           {isLoading ? (
    //             <ClipLoader color="#e3e3e380" size={15} />
    //           ) : (
    //             confirmText
    //           )}
    //         </button>
    //       </div>
    //     </div>
    //   </DialogContent>
    // </Dialog>
  )
}
