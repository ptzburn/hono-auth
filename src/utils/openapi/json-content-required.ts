import { ZodSchema } from "../../types.ts";
import jsonContent from "./json-content.ts";

const jsonContentRequired = <
  T extends ZodSchema,
>(schema: T, description: string) => {
  return {
    ...jsonContent(schema, description),
    required: true,
  };
};

export default jsonContentRequired;
