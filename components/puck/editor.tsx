import { Config, Puck } from "@measured/puck";
import "@measured/puck/puck.css";
import { Article } from "@mui/icons-material";
import { Tooltip } from "@mui/material";
import { Heading } from "./components/heading";
import { TwoColumn } from "./components/two-column";
import { ExportButton } from "./export-button";
import { DetailTable } from "./components/detail-table";

// Create Puck component config
const config = {
  root: {
    fields: {},
  },
  components: {
    TwoColumn,
    Heading,
    DetailTable,
  },
  categories: {
    layout: {
      title: "レイアウト",
      components: ["TwoColumn"],
    },
    typography: {
      title: "テキスト",
      components: ["Heading"],
    },
    data: {
      title: "データ",
      components: ["DetailTable"],
    },
  },
} satisfies Config;

const initialData = {};

export function Editor() {
  return (
    <>
      <Puck
        config={config}
        data={initialData}
        viewports={[
          {
            width: 842,
            label: "A4",
            icon: (
              <Tooltip title="A4">
                <Article />
              </Tooltip>
            ),
          },
          {
            width: 729,
            label: "B5",
            icon: (
              <Tooltip title="B5">
                <Article />
              </Tooltip>
            ),
          },
        ]}
        overrides={{
          headerActions: () => <ExportButton />,
        }}
      />
    </>
  );
}
