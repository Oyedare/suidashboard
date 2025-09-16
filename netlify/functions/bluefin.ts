export const handler = async (event: any) => {
  const path = event.path.replace("/.netlify/functions/bluefin", "");
  const url = `https://spot.api.sui-prod.bluefin.io${path}${event.rawQuery ? `?${event.rawQuery}` : ""}`;

  const res = await fetch(url, {
    method: event.httpMethod,
    headers: {
      "x-api-key": process.env.VITE_COIN_API_KEY || "",
      "content-type": event.headers["content-type"] || "application/json",
    },
    body: ["POST", "PUT", "PATCH"].includes(event.httpMethod)
      ? event.body
      : undefined,
  });

  const body = await res.text();
  return {
    statusCode: res.status,
    headers: {
      "content-type":
        (res.headers as any).get("content-type") || "application/json",
    },
    body,
  };
};
