/** Colors for print/PDF outputs (outside Mantine runtime). */

export const PRINT_BODY_TEXT = "#111111";
export const PRINT_MUTED = "#666666";
export const PRINT_SUBTEXT = "#444444";
export const PRINT_BORDER = "#dddddd";
export const PRINT_SURFACE = "#ffffff";
export const PRINT_CANVAS = "#eeeeee";
export const PRINT_FAINT = "#999999";

export const PDF_RGB_MUTED = { r: 0.45, g: 0.45, b: 0.45 } as const;
export const PDF_RGB_LABEL = { r: 0.35, g: 0.35, b: 0.35 } as const;
export const PDF_RGB_TITLE = { r: 0.2, g: 0.2, b: 0.2 } as const;
export const PDF_RGB_BODY = { r: 0.4, g: 0.4, b: 0.4 } as const;
export const PDF_RGB_HINT = { r: 0.5, g: 0.5, b: 0.5 } as const;
export const PDF_RGB_FOOTER = { r: 0.6, g: 0.6, b: 0.6 } as const;

export const PARTNER_QR_PRINT_CSS = `
    @page { size: A5 portrait; margin: 12mm; }
    * { box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; margin: 0; color: ${PRINT_BODY_TEXT}; }
    .page {
      width: 148mm;
      min-height: 210mm;
      padding: 10mm;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
    }
    .page:last-child { page-break-after: auto; }
    .brand { font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: ${PRINT_MUTED}; margin: 0; }
    h1 { font-size: 20px; margin: 8px 0 4px; max-width: 120mm; }
    .sub { font-size: 11px; color: ${PRINT_SUBTEXT}; margin: 0 0 12px; max-width: 120mm; }
    .qr-wrap { padding: 8px; border: 1px solid ${PRINT_BORDER}; border-radius: 8px; background: ${PRINT_SURFACE}; }
    .hint { font-size: 10px; color: ${PRINT_MUTED}; margin-top: 10px; }
    .id { font-size: 9px; color: ${PRINT_FAINT}; margin-top: 4px; }
    @media screen {
      body { background: ${PRINT_CANVAS}; padding: 16px; }
      .page { margin: 0 auto 16px; box-shadow: 0 2px 12px rgba(0,0,0,.12); background: ${PRINT_SURFACE}; }
    }
`;
