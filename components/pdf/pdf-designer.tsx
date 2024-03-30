import { Button, GlobalStyles, Toolbar } from "@mui/material";
import { styled } from "@mui/material/styles";
import { BLANK_PDF, Template } from "@pdfme/common";
import * as pdfLib from "@pdfme/pdf-lib";
import { image, text } from "@pdfme/schemas";
import { Designer } from "@pdfme/ui";
import { ChangeEvent, useEffect, useRef } from "react";
import { generate } from "./custom-generate";
import { textField } from "./pdf-text-field";
import { rgb2hex } from "./helper";

const VisuallyHiddenInput = styled("input")({
  clip: "rect(0 0 0 0)",
  clipPath: "inset(50%)",
  height: 1,
  overflow: "hidden",
  position: "absolute",
  bottom: 0,
  left: 0,
  whiteSpace: "nowrap",
  width: 1,
});

const template: Template = {
  basePdf: BLANK_PDF,
  schemas: [
    {
      a: {
        type: "textField",
        position: { x: 0, y: 0 },
        width: 10,
        height: 10,
      },
      b: {
        type: "textField",
        position: { x: 10, y: 10 },
        width: 10,
        height: 10,
      },
      c: {
        type: "textField",
        position: { x: 20, y: 20 },
        width: 10,
        height: 10,
      },
    },
  ],
};

type Props = {};

export const PdfDesigner = ({}: Props) => {
  const designerRef = useRef<HTMLDivElement>(null);
  const designer = useRef<Designer | null>(null);
  useEffect(() => {
    if (designerRef.current) {
      designer.current = new Designer({
        domContainer: designerRef.current,
        template,
        plugins: {
          Text: text,
          Image: image,
          TextField: textField,
        },
        options: {
          lang: "ja",
        },
      });
    }

    return () => {
      if (designer.current) {
        designer.current.destroy();
      }
    };
  }, []);

  const handleLoadPdf = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const buffer = reader.result as ArrayBuffer;
      const pdf = new Uint8Array(buffer);
      const pdfDoc = await pdfLib.PDFDocument.load(pdf);
      const fields = pdfDoc.getForm().getFields();
      const pages = pdfDoc.getPages();
      const schemas: Template["schemas"] = Array(pages.length)
        .fill(null)
        .map(() => ({}));
      for (const field of fields) {
        if (!(field instanceof pdfLib.PDFTextField)) {
          continue;
        }
        const widget = field.acroField.getWidgets()[0];
        if (!widget) {
          continue;
        }
        const { x, y, width, height } = widget.getRectangle();
        const textColor = (() => {
          const matched = field.acroField
            .getDefaultAppearance()
            ?.match(/(\d+)\s(\d+)\s(\d+)\srg/);
          if (!matched) {
            return undefined;
          }
          return rgb2hex(
            Number(matched[1]),
            Number(matched[2]),
            Number(matched[3])
          );
        })();
        const backgroundColorRGB = widget
          .getAppearanceCharacteristics()
          ?.getBackgroundColor();
        const fontSize = (() => {
          const matched = field.acroField
            .getDefaultAppearance()
            ?.match(/\/\S*\s(\d+)\sTf/);
          if (!matched) {
            return undefined;
          }
          return Number(matched[1]);
        })();
        const alignment = field.getAlignment();
        const i = widget.P()?.objectNumber ?? 0;
        schemas[i][field.getName()] = {
          type: "textField",
          position: { x, y },
          width,
          height,
          alignment:
            alignment === pdfLib.TextAlignment.Left
              ? "left"
              : alignment === pdfLib.TextAlignment.Center
              ? "center"
              : "right",
          textColor,
          backgroundColor:
            backgroundColorRGB && backgroundColorRGB.length === 3
              ? rgb2hex(
                  backgroundColorRGB[0],
                  backgroundColorRGB[1],
                  backgroundColorRGB[2]
                )
              : undefined,
          fontSize: fontSize != null && fontSize > 0 ? fontSize : undefined,
        };
      }
      console.log(schemas);
      designer.current?.updateTemplate({
        basePdf: `data:application/pdf;base64,${btoa(
          String.fromCharCode.apply(null, Array.from(pdf))
        )}`,
        schemas,
      });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleGenerate = async () => {
    const template = designer.current?.getTemplate();
    if (!template) {
      return;
    }

    const pdf = await generate({
      template,
      plugins: {
        Text: text,
        Image: image,
        TextField: textField,
      },
    });
    const blob = new Blob([pdf.buffer], { type: "application/pdf" });
    window.open(URL.createObjectURL(blob));
  };

  return (
    <div>
      <GlobalStyles styles={{ body: { overscrollBehavior: "none" } }} />
      <Toolbar sx={{ gap: 1 }}>
        <div style={{ flexGrow: 1 }} />
        <Button component="label" variant="outlined">
          PDF読込
          <VisuallyHiddenInput
            type="file"
            accept="application/pdf"
            onChange={handleLoadPdf}
          />
        </Button>
        <Button variant="contained" onClick={handleGenerate}>
          エクスポート
        </Button>
      </Toolbar>
      <div ref={designerRef} style={{ height: "calc(100dvh - 64px)" }} />
    </div>
  );
};
