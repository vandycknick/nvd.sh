import { defineCollection, reference, z } from "astro:content"
import { glob } from "astro/loaders"

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      date: z.date(),
      category: z.string(),
      tags: z.array(z.string()).optional().default([]),
      cover: image(),
      draft: z.boolean().default(false),
      relatedPosts: z.array(reference("blog")).optional(),
    }),
})

export const collections = {
  blog,
}
