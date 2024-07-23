import { getDodges } from "@/src/data";
import { type NextRequest } from "next/server";

// @ts-expect-error: Overriding toJSON method for BigInt
BigInt.prototype.toJSON = function () {
  return this.toString();
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const region = searchParams.get("region");

  if (!region) {
    return Response.json(
      {},
      { status: 400, statusText: "Missing query parameter `region`" },
    );
  }

  const dodges = await getDodges(region, 100, 1);

  return Response.json({
    dodges,
    serverTime: new Date().toISOString(),
  });
}
