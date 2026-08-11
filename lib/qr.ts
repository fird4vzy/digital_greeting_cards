import QRCode from 'qrcode';

/**
 * QR generation.
 *
 * QR is the bridge, not the product — so the code is rendered as SVG (crisp at
 * any print size, no raster assets) and styled to sit inside the card design
 * rather than looking like a payment terminal.
 *
 * Error correction is deliberately 'M': these codes are printed small, on
 * matte stock, and get handled by people carrying flowers. 'M' tolerates ~15%
 * damage while keeping the module grid coarse enough to scan from 20cm in the
 * bad lighting of a shop counter.
 */

export type QrOptions = {
  dark?: string;
  light?: string;
  /** Quiet-zone modules. 1 is the minimum that still scans reliably. */
  margin?: number;
  width?: number;
};

export async function qrSvg(url: string, options: QrOptions = {}): Promise<string> {
  const { dark = '#191512', light = '#00000000', margin = 1, width = 512 } = options;

  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin,
    width,
    color: { dark, light },
  });
}

export async function qrDataUrl(url: string, options: QrOptions = {}): Promise<string> {
  const { dark = '#191512', light = '#ffffff', margin = 1, width = 512 } = options;

  return QRCode.toDataURL(url, {
    errorCorrectionLevel: 'M',
    margin,
    width,
    color: { dark, light },
  });
}

/** The public URL a scan resolves to. */
export function cardUrl(origin: string, code: string): string {
  return `${origin.replace(/\/$/, '')}/c/${code}`;
}
