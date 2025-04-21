import { ComponentConfig, DropZone } from "@measured/puck";
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
  gap: number;
}>;

export const TwoColumn: ComponentConfig<Props> = {
  label: "2カラム",
  fields: {
    gap: {
      type: "number",
      label: "間隔",
    },
  },
  defaultProps: {
    gap: 16,
  },
  render: ({ gap }: Props) => {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap }}>
        <DropZone zone="two-column-1" disallow={["TwoColumn"]} />
        <DropZone zone="two-column-2" disallow={["TwoColumn"]} />
      </div>
    );
  },
};
