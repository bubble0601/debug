// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<undefined>
) {
  const origin = req.headers.referer
    ? new URL(req.headers.referer).origin
    : undefined;
  console.log((origin ?? "/") + "/qr?close=1");
  res.redirect((origin ?? "/") + "/qr?close=1");
}
