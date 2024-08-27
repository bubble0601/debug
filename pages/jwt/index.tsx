import { Button, Stack, TextareaAutosize } from "@mui/material";
import { useState } from "react";
import { decode } from "jsonwebtoken";

export default function Page() {
  const [input, setInput] =
    useState(`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c`);
  const [data, setData] = useState<any[]>();

  const handleDecode = () => {
    const decoded = input.split("\n").map((str) => decode(str));
    setData(decoded);
  };

  return (
    <Stack direction="row" width="100%">
      <div style={{ padding: 4, width: "50%" }}>
        <Button onClick={handleDecode} sx={{ display: "block" }}>
          Decode
        </Button>
        <TextareaAutosize
          value={input}
          minRows={50}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: "100%", whiteSpace: "nowrap" }}
        />
      </div>
      <div style={{ padding: 4, width: "50%" }}>
        {data?.map((v) => (
          <div>{JSON.stringify(v, null, 2)}</div>
        ))}
      </div>
    </Stack>
  );
}
