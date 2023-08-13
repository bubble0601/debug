import { Theme, useMediaQuery } from "@mui/material";
import { Child } from "../../components/child";
import { Parent } from "../../components/parent";

const child = <Child />;
export default function Page() {
  return <Parent>{child}</Parent>;
}
