"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "@tiptap/extension-link"
import Underline from "@tiptap/extension-underline"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"

import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import HorizontalRule from "@tiptap/extension-horizontal-rule"
import { useRouter } from "next/navigation"
import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import {
  ArrowLeft,
  Bold,
  Italic,
  Loader2,
  Save,
  Underline as UIcon,
} from "lucide-react"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Editor } from "./Editor"

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
  costPrice: z.coerce.number().optional(),
  hasDiscount: z.boolean().optional(),
  image: z.any().optional(),
})

type FormValues = z.infer<typeof schema>

export function ProductForm() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      shortDescription: "",
      description: "",
      price: 0,
      costPrice: 0,
      hasDiscount: false,
    },
  })

  const watchTitle = form.watch("title") || ""
  const watchShort = form.watch("shortDescription") || ""
  const watchDesc = form.watch("description") || ""
  const watchPrice = form.watch("price") || 0
  const watchCost = form.watch("costPrice") || 0

  const profit = watchPrice - watchCost
  const margin = watchPrice > 0 ? ((profit / watchPrice) * 100).toFixed(0) : 0

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,

      Link.configure({
        openOnClick: false,
      }),
      Image,
      Youtube,
      TextStyle,
      Color,
      HorizontalRule,
    ],
    content: "",
    onUpdate({ editor }) {
      form.setValue("description", editor.getHTML())
    },
  })

  const onSubmit = async (values: FormValues) => {
    // setIsSubmitting(true)

    console.log("values", values)

    const formData = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString())
      }
    })

    await fetch("/api/products", {
      method: "POST",
      body: formData,
    })

    setIsSubmitting(false)
    router.push("/products")
  }

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
              {watchTitle.length}/{MAX_TITLE}
            </span>
          </div>

          <Input
            {...form.register("title")}
            id="title"
            type="text"
            maxLength={MAX_TITLE}
            placeholder="Назва товару"
            className="w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2.5 text-sm text-[#18181B] placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0 disabled:opacity-50"
          />
        </div>

        {/* Короткий опис */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm text-[#18181B]">Короткий опис</label>
            <span className="text-sm text-[#A1A1AA]">
              {watchShort.length}/{MAX_SHORT}
            </span>
          </div>
          <Textarea
            {...form.register("shortDescription")}
            maxLength={MAX_SHORT}
            className="h-[98px] w-full rounded-md border border-[#E4E4E7] bg-white px-3 py-2 text-sm text-[#18181B] scrollbar-blue placeholder:text-[#A1A1AA] hover:border-[#2563EB] focus:border-[#2563EB] focus:outline-none focus:ring-1 focus:ring-[#2563EB] focus-visible:ring-0 disabled:opacity-50"
          />
        </div>

        {/* Опис */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <label className="text-sm text-[#18181B]">Опис</label>
            <span className="text-sm text-[#A1A1AA]">
              {getPlainTextLength(watchDesc)}/{MAX_DESC}
            </span>
          </div>

          <Editor
            value={watchDesc}
            onChange={(value) => form.setValue("description", value)}
          />
        </div>
      </div>

      {/* Зображення */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 font-semibold">Зображення</h2>

        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 text-center">
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
            className="cursor-pointer rounded-md border bg-gray-100 px-4 py-2 hover:bg-gray-200"
          >
            Завантажити
          </label>

          <p className="mt-4 text-sm text-muted-foreground">
            Ви можете завантажити зображення до 10 Mb, відео до 100 Mb або медіа
            файли за посиланням
          </p>
        </div>

        {preview && <img src={preview} className="mt-4 h-32 rounded-md" />}
      </div>

      {/* Ціни */}
      <div className="space-y-6 rounded-xl border bg-white p-6">
        <h2 className="font-semibold">Ціни</h2>

        <div>
          <label className="mb-1 block">Ціна</label>
          <input
            type="number"
            step="0.01"
            {...form.register("price")}
            className="w-full rounded-md border p-2"
          />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" {...form.register("hasDiscount")} />
          <label>Знижка</label>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>Собівартість</label>
            <input
              type="number"
              {...form.register("costPrice")}
              className="w-full rounded-md border p-2"
            />
          </div>

          <div>
            <label>Прибуток</label>
            <input
              value={profit}
              disabled
              className="w-full rounded-md border bg-gray-100 p-2"
            />
          </div>

          <div>
            <label>Маржа</label>
            <input
              value={`${margin}%`}
              disabled
              className="w-full rounded-md border bg-gray-100 p-2"
            />
          </div>
        </div>
      </div>
    </form>
  )
}
