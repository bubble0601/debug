import { ClientOnly } from "../../components/client-only";
import { PdfDesigner } from "../../components/pdf/pdf-designer";

export default () => {
  return (
    <ClientOnly>
      <PdfDesigner />
    </ClientOnly>
  );
};
