import * as pdfLib from "@pdfme/pdf-lib";
import { GenerateProps } from "@pdfme/common";

import * as fontkit from "fontkit";
import type {
  GeneratorOptions,
  Template,
  PDFRenderProps,
  Plugin,
} from "@pdfme/common";
import type { Schema, Plugins } from "@pdfme/common";
import { builtInPlugins } from "@pdfme/schemas";
import {
  PDFPage,
  PDFDocument,
  PDFEmbeddedPage,
  TransformationMatrix,
} from "@pdfme/pdf-lib";
import { getB64BasePdf, BasePdf } from "@pdfme/common";

type EmbedPdfBox = {
  mediaBox: { x: number; y: number; width: number; height: number };
  bleedBox: { x: number; y: number; width: number; height: number };
  trimBox: { x: number; y: number; width: number; height: number };
};

export const getEmbeddedPagesAndEmbedPdfBoxes = async (arg: {
  pdfDoc: PDFDocument;
  basePdf: BasePdf;
}) => {
  const { pdfDoc, basePdf } = arg;
  let embeddedPages: PDFEmbeddedPage[] = [];
  let embedPdfBoxes: EmbedPdfBox[] = [];
  const willLoadPdf =
    typeof basePdf === "string" ? await getB64BasePdf(basePdf) : basePdf;
  const embedPdf = await PDFDocument.load(willLoadPdf);
  const embedPdfPages = embedPdf.getPages();

  embedPdfBoxes = embedPdfPages.map((p) => ({
    mediaBox: p.getMediaBox(),
    bleedBox: p.getBleedBox(),
    trimBox: p.getTrimBox(),
  }));

  const boundingBoxes = embedPdfPages.map((p) => {
    const { x, y, width, height } = p.getMediaBox();

    return { left: x, bottom: y, right: width, top: height + y };
  });

  const transformationMatrices = embedPdfPages.map(
    () => [1, 0, 0, 1, 0, 0] as TransformationMatrix
  );

  embeddedPages = await pdfDoc.embedPages(
    embedPdfPages,
    boundingBoxes,
    transformationMatrices
  );

  return { embeddedPages, embedPdfBoxes };
};

export const drawEmbeddedPage = (arg: {
  page: PDFPage;
  embeddedPage: PDFEmbeddedPage;
  embedPdfBox: EmbedPdfBox;
}) => {
  const { page, embeddedPage, embedPdfBox } = arg;
  page.drawPage(embeddedPage);
  const { mediaBox: mb, bleedBox: bb, trimBox: tb } = embedPdfBox;
  page.setMediaBox(mb.x, mb.y, mb.width, mb.height);
  page.setBleedBox(bb.x, bb.y, bb.width, bb.height);
  page.setTrimBox(tb.x, tb.y, tb.width, tb.height);
};

export const preprocessing = async (arg: {
  template: Template;
  userPlugins: Plugins;
}) => {
  const { template, userPlugins } = arg;
  const { basePdf } = template;

  const pdfDoc = await pdfLib.PDFDocument.create();
  // @ts-ignore
  pdfDoc.registerFontkit(fontkit);

  const pagesAndBoxes = await getEmbeddedPagesAndEmbedPdfBoxes({
    pdfDoc,
    basePdf,
  });
  const { embeddedPages, embedPdfBoxes } = pagesAndBoxes;

  const pluginValues = (
    Object.values(userPlugins).length > 0
      ? Object.values(userPlugins)
      : Object.values(builtInPlugins)
  ) as Plugin<Schema>[];

  const schemaTypes = template.schemas.flatMap((schemaObj) =>
    Object.values(schemaObj).map((schema) => schema.type)
  );

  const renderObj = schemaTypes.reduce((acc, type) => {
    const render = pluginValues.find(
      (pv) => pv.propPanel.defaultSchema.type === type
    );

    if (!render) {
      throw new Error(`[@pdfme/generator] Renderer for type ${type} not found.
Check this document: https://pdfme.com/docs/custom-schemas`);
    }
    return { ...acc, [type]: render.pdf };
  }, {} as Record<string, (arg: PDFRenderProps<Schema>) => Promise<void>>);

  return { pdfDoc, embeddedPages, embedPdfBoxes, renderObj };
};

export const postProcessing = (props: {
  pdfDoc: pdfLib.PDFDocument;
  options: GeneratorOptions;
}) => {
  const { pdfDoc, options } = props;
  const {
    author = "unknown",
    creationDate = new Date(),
    creator = "unknown",
    keywords = [],
    language = "en-US",
    modificationDate = new Date(),
    producer = "unknown",
    subject = "",
    title = "",
  } = options;
  pdfDoc.setAuthor(author);
  pdfDoc.setCreationDate(creationDate);
  pdfDoc.setCreator(creator);
  pdfDoc.setKeywords(keywords);
  pdfDoc.setLanguage(language);
  pdfDoc.setModificationDate(modificationDate);
  pdfDoc.setProducer(producer);
  pdfDoc.setSubject(subject);
  pdfDoc.setTitle(title);
};

export const generate = async (props: Omit<GenerateProps, "inputs">) => {
  const { template, options = {}, plugins: userPlugins = {} } = props;

  const { pdfDoc, embeddedPages, embedPdfBoxes, renderObj } =
    await preprocessing({
      template,
      userPlugins,
    });

  const _cache = new Map();

  const keys = template.schemas.flatMap((schema) => Object.keys(schema));
  for (let j = 0; j < embeddedPages.length; j += 1) {
    const embeddedPage = embeddedPages[j];
    const { width: pageWidth, height: pageHeight } = embeddedPage;
    const embedPdfBox = embedPdfBoxes[j];

    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    drawEmbeddedPage({ page, embeddedPage, embedPdfBox });
    for (let l = 0; l < keys.length; l += 1) {
      const key = keys[l];
      const schemaObj = template.schemas[j];
      const schema = schemaObj[key];

      if (!schema) {
        continue;
      }

      const render = renderObj[schema.type];
      if (!render) {
        continue;
      }

      await render({
        key,
        value: "",
        schema,
        pdfLib,
        pdfDoc,
        page,
        options,
        _cache,
      });
    }
  }

  postProcessing({ pdfDoc, options });

  return pdfDoc.save();
};
