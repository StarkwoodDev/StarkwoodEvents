import { defineField, defineType } from "sanity";

export const service = defineType({
  name: "service",
  title: "Service",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (r) => r.required(),
    }),
    defineField({
      name: "icon",
      title: "Icon",
      type: "string",
      description: "A single emoji used as the service icon.",
    }),
    defineField({
      name: "summary",
      title: "Summary",
      type: "text",
      rows: 2,
      description: "One-line summary shown on the services grid.",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "array",
      of: [{ type: "block" }],
      description: "Full detail shown on the service's own page.",
    }),
    defineField({
      name: "order",
      title: "Order",
      type: "number",
      description: "Controls display order on the services grid.",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "summary" },
  },
});
