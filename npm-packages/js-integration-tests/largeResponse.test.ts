import { ConvexClient } from "convex/browser";
import { api } from "./convex/_generated/api";
import { opts } from "./test_helpers";
import { deploymentUrl } from "./common";

describe("Large query responses", () => {
  let client: ConvexClient;

  beforeEach(() => {
    client = new ConvexClient(deploymentUrl, opts);
  });

  afterEach(async () => {
    await client.close();
  });

  test("query with small response works", async () => {
    const result = await client.query(api.largeResponse.largeArray, {
      bytes: 1000,
    });
    expect(result).toBeDefined();
    expect(Array.isArray(result)).toBe(true);
  });

  test("query with >5MB response", async () => {
    const result = await client.query(api.largeResponse.largeArray, {
      bytes: 6_000_000,
    });
    expect(result).toBeDefined();
    // The result should be close to 6MB
    const resultSize = JSON.stringify(result).length;
    expect(resultSize).toBeGreaterThan(5_000_000);
  }, 30000);
});
