import { mutation } from "./_generated/server.js";
import { query } from "./_generated/server.js";
import { Doc } from "./_generated/dataModel.js";

export const list = query(async (ctx): Promise<Doc<"messages">[]> => {
  return await ctx.db.query("messages").collect();
});

export const send = mutation(
  async (ctx, { body, author }: { body: string; author: string }) => {
    const message = { body, author };
    await ctx.db.insert("messages", message);
  },
);

export const typeTest = query(async (ctx) => {
  const stuff = await ctx.db.query("typeTestMessages").collect();

  // (noUncheckedIndexedAccess)
  const doc = stuff[0]!;

  // exactOptionalPropertyTypes isn't any different when you access this
  const optionalField: undefined | string = doc.optionalString;
  console.log(optionalField);

  const {
    _id,
    _creationTime,
    body: _body,
    author: _author,
    objectWithOptionalString,
    ...justOptional
  } = doc;

  if ("optionalString" in justOptional) {
    // @ts-expect-error since exactOptionalPropertyTypes is not set, this should fail
    const exists: string = justOptional.optionalString;
    console.log(exists);
  } else {
    // @ts-expect-error since exactOptionalPropertyTypes is not set, this should fail
    const dne: undefined = justOptional.optionalString;
    // @ts-expect-error undefined is not assignable to string
    const exists: string = justOptional.optionalString;
    console.log(dne, exists);
  }

  if ("optionalString" in objectWithOptionalString) {
    // @ts-expect-error since exactOptionalPropertyTypes is not set, this should fail
    const exists: string = justOptional.optionalString;
    console.log(exists);
  } else {
    // @ts-expect-error since exactOptionalPropertyTypes is not set, this should fail
    const dne: undefined = justOptional.optionalString;
    // @ts-expect-error since exactOptionalPropertyTypes is not set, this should fail
    const exists: string = justOptional.optionalString;
    console.log(dne, exists);
  }
});
