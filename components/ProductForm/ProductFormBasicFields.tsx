"use client"

import { Controller } from "react-hook-form"
import type { Control, FieldErrors } from "react-hook-form"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { ProductFormDescription } from "./ProductFormDescription"
import { cn } from "@/lib/utils"
import { MAX_TITLE, MAX_SHORT } from "@/lib/constants"
import type { FormValues } from "@/lib/schema"

const inputClassName =
  "w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"

type ProductFormBasicFieldsProps = {
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  title: string
  shortDescription: string
  description: string
  onDescriptionChange: (value: string) => void
}

export function ProductFormBasicFields({
  control,
  errors,
  title,
  shortDescription,
  description,
  onDescriptionChange,
}: ProductFormBasicFieldsProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:rounded-2xl sm:border sm:border-[#E4E4E7]">
      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <label
            className={cn(
              "text-sm font-medium",
              errors.title ? "text-[#DC2626]" : "text-[#18181B]"
            )}
          >
            Назва <span className="text-[#DC2626]">*</span>
          </label>
          <span className="text-sm text-[#A1A1AA]">
            {title.length}/{MAX_TITLE}
          </span>
        </div>
        <Controller
          control={control}
          name="title"
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              maxLength={MAX_TITLE}
              placeholder="Назва товару"
              className={inputClassName}
            />
          )}
        />
        {errors.title && (
          <p className="text-sm text-[#DC2626]">{errors.title.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex justify-between">
          <label className="text-sm font-medium text-[#18181B]">
            Короткий опис
          </label>
          <span className="text-sm text-[#A1A1AA]">
            {shortDescription.length}/{MAX_SHORT}
          </span>
        </div>
        <Controller
          control={control}
          name="shortDescription"
          render={({ field }) => (
            <Textarea
              {...field}
              maxLength={MAX_SHORT}
              className={cn("h-[98px] w-full scrollbar-blue", inputClassName)}
            />
          )}
        />
      </div>

      <ProductFormDescription
        value={description}
        onChange={onDescriptionChange}
      />
    </div>
  )
}
