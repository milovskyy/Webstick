"use client"

import { Controller } from "react-hook-form"
import { Input } from "../ui/input"
import { Switch } from "../ui/switch"
import { MoneyInput } from "../MoneyInput"
import type { Control, FieldErrors } from "react-hook-form"
import type { FormValues } from "../../lib/schema"

const labelClass = "text-sm font-medium text-[#18181B]"
const currencySpanClass =
  "pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]"

type ProductFormPricesProps = {
  control: Control<FormValues>
  errors: FieldErrors<FormValues>
  hasDiscount: boolean
  profit: number
  margin: number
  formatNumber: (value: number | string) => string
}

export function ProductFormPrices({
  control,
  errors,
  hasDiscount,
  profit,
  margin,
  formatNumber,
}: ProductFormPricesProps) {
  return (
    <div className="flex flex-col gap-4 bg-white p-4 sm:rounded-2xl sm:border sm:border-[#E4E4E7]">
      <h2 className="text-lg font-semibold text-[#18181B]">Ціни</h2>

      <div className="flex flex-col gap-2">
        <label className={labelClass}>Ціна</label>
        <div className="relative w-full">
          <span className={currencySpanClass}>₴</span>
          <MoneyInput name="price" control={control} />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          control={control}
          name="hasDiscount"
          render={({ field: { value, onChange, ...rest } }) => (
            <Switch
              checked={!!value}
              onCheckedChange={(checked: boolean) => onChange(checked)}
              id="hasDiscount"
              className="data-[state=checked]:bg-[#2563EB]"
              {...rest}
            />
          )}
        />
        <label className={labelClass}>Знижка</label>
      </div>

      {hasDiscount && (
        <div className="flex flex-col gap-2">
          <label
            className={
              errors.discountPrice
                ? "text-sm font-medium text-[#DC2626]"
                : "text-sm font-medium text-[#18181B]"
            }
          >
            Ціна зі знижкою
          </label>
          <div className="relative w-full">
            <span className={currencySpanClass}>₴</span>
            <MoneyInput name="discountPrice" control={control} />
          </div>
          {errors.discountPrice?.message && (
            <p className="text-sm text-[#DC2626]">
              {errors.discountPrice.message}
            </p>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <div className="col-span-2 flex flex-col gap-2 sm:col-span-1">
          <label className={labelClass}>Собівартість</label>
          <div className="relative w-full">
            <span className={currencySpanClass}>₴</span>
            <MoneyInput name="costPrice" control={control} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Прибуток</label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#A1A1AA]">
              ₴
            </span>
            <Input
              id="profit"
              type="text"
              disabled
              placeholder="0"
              className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-6 pr-3 text-sm placeholder:text-[#A1A1AA] disabled:text-[#A1A1AA]"
              value={formatNumber(profit)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className={labelClass}>Маржа</label>
          <Input
            id="margin"
            type="text"
            disabled
            placeholder="0%"
            className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-3 pr-3 text-sm placeholder:text-[#A1A1AA] disabled:text-[#A1A1AA]"
            value={`${margin}%`}
          />
        </div>
      </div>
    </div>
  )
}
