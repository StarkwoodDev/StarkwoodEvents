import { defineField, defineType } from "sanity";

export const sponsor = defineType({
  name: "sponsor",
  title: "Sponsor / Partner",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (r) => r.required(),
    }),
    defineField({
      name: "logo",
      title: "Logo",
      type: "image",
      description: "Optional — sponsors without a logo yet render as a text name on the site.",
    }),
    defineField({ name: "url", title: "URL", type: "url" }),
  ],
  preview: {
    select: { title: "name", media: "logo" },
  },
});
