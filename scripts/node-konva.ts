#!/usr/bin/env node
import { writeFile } from "fs";
import { JSDOM } from "jsdom";
import konva from "konva";

const { window } = new JSDOM(
  `<!DOCTYPE html><html><body><div id="container"></div></body></html>`
);
globalThis.document = window.document;

const stage = konva.Node.create(
  {
    attrs: {
      width: 1392,
      height: 194,
    },
    className: "Stage",
    children: [
      {
        attrs: {
          listening: false,
        },
        className: "Layer",
        children: [
          {
            attrs: {
              x: 627.3396674584324,
              width: 137.3206650831354,
              height: 194,
              perfectDrawEnabled: false,
              shadowForStrokeEnabled: false,
              hitStrokeWidth: 0,
              visible: false,
            },
            className: "Image",
          },
        ],
      },
      {
        attrs: {},
        className: "Layer",
        children: [
          {
            attrs: {
              strokeWidth: 1,
              stroke: "#000000",
              points: [
                661, 68.1328125, 661, 68.1328125, 663, 68.1328125, 665,
                68.1328125, 670, 68.1328125, 675, 68.1328125, 681, 68.1328125,
                686, 70.1328125, 693, 73.1328125, 694, 73.1328125, 699,
                75.1328125, 701, 77.1328125, 704, 79.1328125, 708, 81.1328125,
                708, 83.1328125, 709, 84.1328125, 712, 87.1328125, 712,
                88.1328125, 713, 88.1328125, 713, 90.1328125, 715, 91.1328125,
                716, 92.1328125, 717, 94.1328125, 718, 95.1328125, 719,
                97.1328125, 720, 98.1328125, 721, 100.1328125, 723, 101.1328125,
                724, 102.1328125, 725, 103.1328125, 725, 103.1328125, 725,
                103.1328125,
              ],
              tension: 0.5,
              lineCap: "round",
              lineJoin: "round",
              perfectDrawEnabled: false,
              shadowForStrokeEnabled: false,
              hitStrokeWidth: 0,
            },
            className: "Line",
          },
        ],
      },
    ],
  },
  "container"
) as konva.Node;

const dataURL = stage.toDataURL();
const b64 = dataURL.split(",")[1];
const buffer = Buffer.from(b64, "base64");
writeFile("test.png", buffer, () => {
  console.log("done");
});
