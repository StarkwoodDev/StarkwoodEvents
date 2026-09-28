import { describe, it, expect } from "vitest";
import { schemaTypes } from "../index";

/** Narrow shape shared by the `document`-type schemas under test — enough
 * to read field names without depending on Sanity's full (and very large)
 * discriminated `SchemaTypeDefinition` union. */
interface DocumentSchemaShape {
  name: string;
  fields: { name: string }[];
}

function findDocumentSchema(name: string): DocumentSchemaShape {
  const schema = schemaTypes.find((s) => s.name === name);
  if (!schema || !("fields" in schema)) {
    throw new Error(`Expected schema "${name}" to be a document type with fields`);
  }
  return schema as DocumentSchemaShape;
}

describe("sanity schemaTypes", () => {
  it("exports exactly the five expected document types", () => {
    const names = schemaTypes.map((s) => s.name).sort();
    expect(names).toEqual(
      ["event", "service", "siteSettings", "sponsor", "testimonial"].sort(),
    );
  });

  it("event schema requires title, slug, and status", () => {
    const eventSchema = findDocumentSchema("event");
    const fieldNames = eventSchema.fields.map((f) => f.name);
    expect(fieldNames).toEqual(
      expect.arrayContaining([
        "title",
        "slug",
        "status",
        "category",
        "startDate",
        "venue",
        "starkwoodRole",
        "summary",
        "coverImage",
        "gallery",
        "sponsors",
      ]),
    );
  });

  it("service schema has slug and order fields for routing/sorting", () => {
    const serviceSchema = findDocumentSchema("service");
    const fieldNames = serviceSchema.fields.map((f) => f.name);
    expect(fieldNames).toEqual(expect.arrayContaining(["slug", "order"]));
  });
});
