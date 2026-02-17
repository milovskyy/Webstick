import { z } from "zod"
import { MAX_TITLE, MAX_SHORT, MAX_DESC } from "./constants"

export const schema = z
  .object({
    title: z.string().min(1).max(MAX_TITLE),
    shortDescription: z.string().max(MAX_SHORT).optional(),
    description: z.string().max(MAX_DESC).optional(),
    price: z.coerce.number().min(0),
    discountPrice: z.coerce.number().min(0).optional(),
    costPrice: z.coerce.number().min(0),
    hasDiscount: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.discountPrice == null ||
      data.discountPrice === 0 ||
      data.discountPrice <= data.price,
    {
      message: "Ціна зі знижкою не може бути вищою за звичайну ціну",
      path: ["discountPrice"],
    }
  )

export type FormValues = z.infer<typeof schema>
