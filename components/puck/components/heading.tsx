import { ComponentConfig } from "@measured/puck";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren & {
  align?: "left" | "center" | "right";
};

export const Heading: ComponentConfig<Props> = {
  label: "見出し",
  fields: {
    children: {
      type: "text",
      label: "テキスト",
    },
    align: {
      type: "radio",
      label: "配置",
      options: [
        { label: "左", value: "left" },
        { label: "中央", value: "center" },
        { label: "右", value: "right" },
      ],
    },
  },
  defaultProps: {
    children: "タイトル",
    align: "left",
  },
  inline: true,
  render: ({ puck, children, align }) => {
    return (
      <h1 ref={puck.dragRef} style={{ textAlign: align }}>
        {children}
      </h1>
    );
  },
};
