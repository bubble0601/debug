import { Button, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    if (router.query.close) {
      window.close();
    }
  }, [router.query.close]);

  return (
    <Stack p={1} spacing={1}>
      <QRCodeSVG value={`http://192.168.1.7:3001/qr`} />
      <QRCodeSVG value={`http://192.168.1.7:3001/qr?close=1`} />
      <Button onClick={() => window.close()}>Close</Button>
      <Button
        onClick={() => {
          location.href = "http://192.168.1.7:3001/api/redirect";
        }}
      >
        Redirect
      </Button>
    </Stack>
  );
}
