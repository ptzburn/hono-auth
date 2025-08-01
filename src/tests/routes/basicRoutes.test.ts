/*import { describe, it } from "@std/testing/bdd";
import { assertEquals } from "@std/assert";
import app from "../../main.ts";

describe("GET to invalid route", () => {
  it("should result in 404 error", async () => {
    const req = new Request("https://localhost:8000");
    const res = await app.fetch(req);
    const json = await res.json();
    assertEquals(res.status, 404);
    assertEquals(json, { success: false, message: "Not Found" });
  });
});*/
