import { Control, Controller, FieldValues, Path } from "react-hook-form"
import { Input } from "./ui/input"

type Props<T extends FieldValues = FieldValues> = {
  name: Path<T>
  control: Control<T>
}

export const MoneyInput = <T extends FieldValues = FieldValues>({
  name,
  control,
}: Props<T>) => {
  const formatNumber = (value: number | string) => {
    if (value === "" || value === null || value === undefined) return ""
    const number = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(number)) return ""
    return number.toLocaleString("uk-UA")
  }

  const parseNumber = (value: string) => {
    return parseFloat(value.replace(/\s/g, "").replace(",", "."))
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Input
          {...field}
          type="text"
          inputMode="decimal"
          placeholder="0"
          className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-6 pr-3 text-sm text-[#18181B] placeholder:text-[#18181B] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0 disabled:opacity-50"
          value={field.value ? formatNumber(field.value) : ""}
          onChange={(e) => {
            const raw = e.target.value
            const parsed = parseNumber(raw)

            field.onChange(isNaN(parsed) ? 0 : parsed)
          }}
        />
      )}
    />
  )
}
