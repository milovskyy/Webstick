"use client"

import { zodResolver } from "@hookform/resolvers/zod"

import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm, Controller, useWatch } from "react-hook-form"
import { z } from "zod"

import { ArrowLeft, Loader2, Save } from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { FormDescription } from "./FormDescription"
import { Switch } from "./ui/switch"
import { MoneyInput } from "./MoneyInput"

const MAX_TITLE = 200
const MAX_SHORT = 300
const MAX_DESC = 5000

function getPlainTextLength(html: string): number {
  if (!html) return 0
  const text = html.replace(/<[^>]*>/g, "")
  return text.length
}

const schema = z.object({
  title: z.string().min(1).max(MAX_TITLE),
  shortDescription: z.string().max(MAX_SHORT).optional(),
  description: z.string().max(MAX_DESC).optional(),
  price: z.coerce.number().min(0),
  discountPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0),

  hasDiscount: z.boolean().optional(),
  image: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProductForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: 0,
      discountPrice: 0,
      costPrice: 0,
      hasDiscount: false,
    },
  })

  // const watchTitle = form.watch("title") || ""
  // const watchShort = form.watch("shortDescription") || ""
  // const watchDesc = form.watch("description") || ""
  // const watchHasDiscount = form.watch("hasDiscount") || false
  // const profit = watchPrice - watchCost
  // const margin = watchPrice > 0 ? ((profit / watchPrice) * 100).toFixed(2) : 0

  const price = useWatch({ control: form.control, name: "price" }) ?? 0
  const cost = useWatch({ control: form.control, name: "costPrice" }) ?? 0
  const description =
    useWatch({ control: form.control, name: "description" }) ?? ""
  const shortDescription =
    useWatch({ control: form.control, name: "shortDescription" }) ?? ""
  const title = useWatch({ control: form.control, name: "title" }) ?? ""
  const hasDiscount =
    useWatch({ control: form.control, name: "hasDiscount" }) ?? false

  const { profit, margin } = useMemo(() => {
    const profit = price - cost
    const margin = price > 0 ? Number(((profit / price) * 100).toFixed(2)) : 0

    return { profit, margin }
  }, [price, cost])

  const onSubmit = async (values: FormValues) => {
    // setIsSubmitting(true)

    const finalData = {
      ...values,
      profit,
      margin: Number(margin),
    }
    console.log("finalData", finalData)

    // const formData = new FormData()
    // Object.entries(finalData).forEach(([key, value]) => {
    //   if (value !== undefined && value !== null) {
    //     formData.append(key, value.toString())
    //   }
    // })

    // await fetch("/api/products", {
    //   method: "POST",
    //   body: formData,
    // })

    // try {
    //   const res = await fetch("/api/products", {
    //     method: "POST",
    //     body: formData,
    //   })
    //   if (!res.ok) throw new Error()

    //   router.push("/products")
    // } catch (err) {
    //   console.error(err)
    // } finally {
    //   setIsSubmitting(false)
    // }
  }

  const formatNumber = (value: number | string) => {
    if (value === "" || value === null || value === undefined) return ""
    const number = typeof value === "string" ? parseFloat(value) : value
    if (isNaN(number)) return ""
    return number.toLocaleString("uk-UA")
  }

  // const parseNumber = (value: string) => {
  //   return parseFloat(value.replace(/\s/g, "").replace(",", "."))
  // }

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="flex h-full w-[1090px] flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div
            className="flex h-7 w-7 cursor-pointer items-center justify-center"
            onClick={() => router.push("/products")}
          >
            <ArrowLeft size={16} />
          </div>
          <h1 className="text-xl font-semibold text-[#3F3F46]">Новий товар</h1>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex h-9 min-w-[121px] items-center justify-center gap-2 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-[#F8F9FB] hover:bg-[#3A72ED] focus:border-none focus:outline-none"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Зберегти
        </button>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
        {/* Назва */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm text-[#18181B]">
              Назва <span className="text-[#DC2626]">*</span>
            </label>
            <span className="text-sm text-[#A1A1AA]">
              {title.length}/{MAX_TITLE}
            </span>
          </div>

          <Controller
            control={form.control}
            name="title"
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                maxLength={MAX_TITLE}
                className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
              />
            )}
          />
        </div>

        {/* Короткий опис */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm text-[#18181B]">Короткий опис</label>
            <span className="text-sm text-[#A1A1AA]">
              {shortDescription.length}/{MAX_SHORT}
            </span>
          </div>

          <Controller
            control={form.control}
            name="shortDescription"
            render={({ field }) => (
              <Textarea
                {...field}
                maxLength={MAX_SHORT}
                className="h-[98px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] scrollbar-blue placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
              />
            )}
          />
        </div>

        {/* Опис */}

        <FormDescription
          value={description}
          onChange={(value) => form.setValue("description", value)}
        />
      </div>

      {/* Зображення */}
      <div className="h-[208px] rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <h2 className="mb-6 text-lg font-semibold text-[#18181B]">
          Зображення
        </h2>

        {/* ТУТ СДЕЛАТЬ ВОЗМЛЖНО ДРАГ ДРОП ФОТКИ НА ВСЁ ПОЛЕ. А НЕ ТОК НА КРОПКУ */}

        <div className="box-border flex h-[124px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed bg-[#F8F9FB] p-8 text-center hover:border-none hover:bg-[#E2E2E2]">
          <input
            type="file"
            className="hidden"
            id="image"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) {
                setPreview(URL.createObjectURL(file))
              }
            }}
          />
          <label
            htmlFor="image"
            className="box-border cursor-pointer rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-xs font-medium text-[#18181B] hover:bg-[#F8F9FB]"
          >
            Завантажити
          </label>

          <p className="mt-4 text-sm text-[#3F3F46]">
            Ви можете завантажити зображення до 10 Mb, відео до 100 Mb або медіа
            файли за посиланням
          </p>
        </div>

        {preview && <img src={preview} className="mt-4 h-32 rounded-md" />}
      </div>

      {/* Ціни */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[#E4E4E7] bg-white p-4">
        <h2 className="text-lg font-semibold text-[#18181B]">Ціни</h2>

        <div className="flex flex-col gap-2">
          <label className="text-sm text-[#18181B]">Ціна</label>
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
              ₴
            </span>

            <MoneyInput name="price" control={form.control} />

            {/* <Controller
              control={form.control}
              name="price"
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
            /> */}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Controller
            control={form.control}
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

          <label className="text-sm font-medium text-[#18181B]">Знижка</label>
        </div>

        {hasDiscount && (
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#18181B]">Ціна зі знижкою</label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
                ₴
              </span>

              <MoneyInput name="discountPrice" control={form.control} />

              {/* <Controller
                control={form.control}
                name="discountPrice"
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
              /> */}
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#18181B]">Собівартість</label>
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#18181B]">
                ₴
              </span>

              <MoneyInput name="costPrice" control={form.control} />

              {/* <Controller
                control={form.control}
                name="costPrice"
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    inputMode="decimal"
                    placeholder="0"
                    className="w-full rounded-md border border-[#E4E4E7] bg-white py-2 pl-6 pr-3 text-sm text-[#18181B] placeholder:text-[#18181B] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0"
                    value={field.value ? formatNumber(field.value) : ""}
                    onChange={(e) => {
                      const raw = e.target.value
                      const parsed = parseNumber(raw)

                      field.onChange(isNaN(parsed) ? 0 : parsed)
                    }}
                  />
                )}
              /> */}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm text-[#18181B]">Прибуток</label>
            <div className="relative w-full">
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
            <label className="text-sm text-[#18181B]">Маржа</label>
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
    </form>
  )
}
