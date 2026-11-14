/** Responsive derivatives of the original screenshots, which remain available on product pages. */
export function previewImage(source: string, sizes: string, widths: readonly number[] = [160, 320, 448]) {
  const name = source.replace(/^\/apps\//, '').replace(/\//g, '-').replace(/\.[^.]+$/, '');
  const path = (width: number) => `/apps/previews/${name}-${width}.webp`;
  return {
    src: path(widths.includes(320) ? 320 : widths[0]),
    srcSet: widths.map((width) => `${path(width)} ${width}w`).join(', '),
    sizes,
  };
}
