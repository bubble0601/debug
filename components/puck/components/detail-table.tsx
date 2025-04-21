import { ComponentConfig } from "@measured/puck";
import {
  Children,
  ElementType,
  JSX,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

const ForEach = <T extends keyof JSX.IntrinsicElements = "div">({
  as = "div" as T,
  name,
  children,
}: {
  as: T;
  name: string;
  children: ReactNode;
}) => {
  const As = as as ElementType;

  return (
    <As
      ref={(el: Element) => {
        if (el) {
          const startComment = document.createComment(`{{#each ${name}}}`);
          const endComment = document.createComment(`{{/each}}`);
          el.prepend(startComment);
          el.append(endComment);
        }
      }}
    >
      {children}
    </As>
  );
};

const Value = <T extends keyof JSX.IntrinsicElements = "div">({
  as = "div" as T,
  name,
}: {
  as?: T;
  name: string;
} & JSX.IntrinsicElements[T]) => {
  const As = as as ElementType<{ children?: ReactNode }>;

  return <As>{`{{${name}}}`}</As>;
};

const getExample = (type: "date" | "client" | "project") => {
  switch (type) {
    case "date":
      return "2021-01-01";
    case "client":
      return "株式会社ABC";
    case "project":
      return "ビルA";
  }
};

type Props = {
  columns: {
    label: string;
    type: "date" | "client" | "project";
  }[];
};

export const DetailTable: ComponentConfig<Props> = {
  label: "明細表",
  fields: {
    columns: {
      type: "array",
      label: "列",
      arrayFields: {
        type: {
          type: "select",
          label: "種別",
          options: [
            { label: "日付", value: "date" },
            { label: "クライアント", value: "client" },
            { label: "現場", value: "project" },
          ],
        },
        label: {
          type: "text",
          label: "列名",
        },
      },
      getItemSummary: (item) => item.label,
    },
  },
  defaultProps: {
    columns: [
      { type: "date", label: "日付" },
      { type: "client", label: "クライアント" },
      { type: "project", label: "現場" },
    ],
  },
  inline: true,
  render: ({ puck, columns }) => {
    return (
      <table
        ref={puck.dragRef}
        style={{
          width: "100%",
          padding: 16,
          border: "1px solid rgb(0 0 0 / 0.1)",
          borderRadius: 8,
        }}
      >
        <thead
          style={{
            color: "rgb(0 0 0 / 0.5)",
            backgroundColor: "rgb(0 0 0 / 0.05)",
            textAlign: "left",
          }}
        >
          <tr>
            {columns.map((column) => (
              <th key={column.label}>{column.label}</th>
            ))}
          </tr>
        </thead>
        <ForEach as="tbody" name="rows">
          <tr>
            {puck.isEditing
              ? columns.map((column) => (
                  <td key={column.label}>{getExample(column.type)}</td>
                ))
              : columns.map((column) => (
                  <Value key={column.label} as="td" name={column.type} />
                ))}
          </tr>
        </ForEach>
      </table>
    );
  },
};
