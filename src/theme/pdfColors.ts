import { rgb, type RGB } from "pdf-lib";
import {
  PDF_RGB_BODY,
  PDF_RGB_FOOTER,
  PDF_RGB_HINT,
  PDF_RGB_LABEL,
  PDF_RGB_MUTED,
  PDF_RGB_TITLE,
} from "@/theme/printMedia";

export const pdfColor: Record<"muted" | "label" | "title" | "body" | "hint" | "footer", RGB> = {
  muted: rgb(PDF_RGB_MUTED.r, PDF_RGB_MUTED.g, PDF_RGB_MUTED.b),
  label: rgb(PDF_RGB_LABEL.r, PDF_RGB_LABEL.g, PDF_RGB_LABEL.b),
  title: rgb(PDF_RGB_TITLE.r, PDF_RGB_TITLE.g, PDF_RGB_TITLE.b),
  body: rgb(PDF_RGB_BODY.r, PDF_RGB_BODY.g, PDF_RGB_BODY.b),
  hint: rgb(PDF_RGB_HINT.r, PDF_RGB_HINT.g, PDF_RGB_HINT.b),
  footer: rgb(PDF_RGB_FOOTER.r, PDF_RGB_FOOTER.g, PDF_RGB_FOOTER.b),
};
