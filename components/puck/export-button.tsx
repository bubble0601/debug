import { Puck, Render, usePuck } from "@measured/puck";
import { Button, Portal } from "@mui/material";
import { useState } from "react";

// const ExportDialog = ({
//   open,
//   onClose,
// }: {
//   open: boolean;
//   onClose: () => void;
// }) => {
//   const { appState, config } = usePuck();
//   const [html, setHtml] = useState("");

//   return (
//     <Dialog open={open} onClose={onClose}>
//       <DialogTitle>Export</DialogTitle>
//       <DialogContent>
//         <p>データ</p>
//         <pre>{JSON.stringify(appState.data, null, 2)}</pre>
//         <p>HTML</p>
//         <pre style={{ whiteSpace: "pre-wrap", wordBreak: "keep-all" }}>
//           {html}
//         </pre>
//         <div
//           ref={(el) => {
//             if (el) {
//               setHtml(el.innerHTML);
//             }
//           }}
//           style={{ display: "none" }}
//         >
//           <Render config={config} data={appState.data} />
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

export const ExportView = () => {
  const { appState, config } = usePuck();
  const [html, setHtml] = useState("");
  return (
    <div>
      <p>データ</p>
      <pre>{JSON.stringify(appState.data, null, 2)}</pre>
      <p>HTML</p>
      <pre style={{ whiteSpace: "pre-wrap", wordBreak: "keep-all" }}>
        {html}
      </pre>
      <Puck config={config} data={appState.data}>
        <div
          ref={(el) => {
            if (el) {
              setHtml(el.innerHTML);
            }
          }}
          style={{ display: "none" }}
        >
          <Render config={config} data={appState.data} />
        </div>
      </Puck>
    </div>
  );
};

export const ExportButton = () => {
  // const [open, setOpen] = useState(false);
  const [containerEl, setContainerEl] = useState<HTMLElement | null>(null);
  const handleExport = () => {
    const newWindow = window.open("about:blank", "_blank");
    if (newWindow) {
      setContainerEl(newWindow.document.body);
      newWindow.addEventListener("beforeunload", () => {
        setContainerEl(null);
        console.log("beforeunload");
      });
      newWindow.addEventListener("unload", () => {
        setContainerEl(null);
        console.log("unload");
      });
    } else {
      console.error("Failed to open new window");
    }
  };

  return (
    <>
      <Button color="inherit" variant="outlined" onClick={handleExport}>
        Export
      </Button>
      {/* <ExportDialog open={open} onClose={() => setOpen(false)} /> */}
      {containerEl && (
        <Portal container={containerEl}>
          <ExportView />
        </Portal>
      )}
    </>
  );
};
