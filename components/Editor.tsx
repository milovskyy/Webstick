"use client"

import { useRef } from "react"
import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Underline from "@tiptap/extension-underline"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"
import Youtube from "@tiptap/extension-youtube"
import { TextStyle } from "@tiptap/extension-text-style"
import Color from "@tiptap/extension-color"
import HorizontalRule from "@tiptap/extension-horizontal-rule"

import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  Heading1,
  Heading2,
} from "lucide-react"
import { PiYoutubeLogo } from "react-icons/pi"

type Props = {
  value?: string
  onChange?: (html: string) => void
}

const MAX_FILE_SIZE = 10 * 1024 * 1024

export function Editor({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false

        const file = files[0]

        uploadImage(file)

        return true
      },

      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false

        for (const item of items) {
          if (item.type.startsWith("image/")) {
            const file = item.getAsFile()
            if (file) {
              uploadImage(file)
              return true
            }
          }
        }

        return false
      },
    },
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image,
      Youtube,
      TextStyle,
      Color,
      HorizontalRule,
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange?.(editor.getHTML())
    },
  })

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Можна завантажувати лише зображення")
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Файл перевищує 10MB")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    })

    if (!res.ok) {
      alert("Помилка завантаження")
      return
    }

    const data = await res.json()

    editor?.chain().focus().setImage({ src: data.url }).run()
  }

  const buttonClass = (active: boolean) =>
    `p-2 rounded-md transition ${
      active ? "bg-gray-200 text-black" : "hover:bg-gray-100 text-gray-600"
    }`

  return (
    <div className="group w-full rounded-md border bg-white focus-within:border-[#2563EB] hover:border-[#2563EB]">
      <div className="flex h-12 flex-wrap items-center gap-1 rounded-t-md border-b bg-gray-50 p-2 group-focus-within:border-[#2563EB] group-hover:border-b-[#2563EB]">
        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 1 }).run()
          }
          className={buttonClass(
            editor?.isActive("heading", { level: 1 }) || false
          )}
        >
          <Heading1 size={16} />
        </button>

        <button
          type="button"
          onClick={() =>
            editor?.chain().focus().toggleHeading({ level: 2 }).run()
          }
          className={buttonClass(
            editor?.isActive("heading", { level: 2 }) || false
          )}
        >
          <Heading2 size={16} />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={buttonClass(editor?.isActive("bold") || false)}
        >
          <Bold size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={buttonClass(editor?.isActive("italic") || false)}
        >
          <Italic size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor?.isActive("underline") || false)}
        >
          <UnderlineIcon size={16} />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor?.isActive("bulletList") || false)}
        >
          <List size={16} />
        </button>

        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor?.isActive("orderedList") || false)}
        >
          <ListOrdered size={16} />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => {
            const url = prompt("Вставте посилання")
            if (url) {
              editor?.chain().focus().setLink({ href: url }).run()
            }
          }}
          className={buttonClass(editor?.isActive("link") || false)}
        >
          <LinkIcon size={16} />
        </button>

        <>
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0]
              if (!file) return
              await uploadImage(file)
            }}
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
          >
            <ImageIcon size={16} />
          </button>
        </>

        <button
          type="button"
          onClick={() => {
            const url = prompt("YouTube URL")
            if (url) {
              editor?.chain().focus().setYoutubeVideo({ src: url }).run()
            }
          }}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <PiYoutubeLogo size={16} color="#18181B" />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300" />

        <button
          type="button"
          onClick={() => editor?.chain().focus().setHorizontalRule().run()}
          className="rounded-md p-2 text-gray-600 hover:bg-gray-100"
        >
          <Minus size={16} />
        </button>
      </div>

      <div className="relative h-[224px] max-h-[600px] resize-y overflow-auto rounded-b-md border outline-none scrollbar-blue">
        <EditorContent editor={editor} className="text-sm outline-none" />
      </div>
    </div>
  )
}
