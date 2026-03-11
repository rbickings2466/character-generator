declare module 'imagetracerjs' {
  interface ImageTracerOptions {
    // Tracing
    corsenabled?: boolean;
    ltres?: number;
    qtres?: number;
    pathomit?: number;
    rightangleenhance?: boolean;

    // Color quantization
    colorsampling?: number;
    numberofcolors?: number;
    mincolorratio?: number;
    colorquantcycles?: number;

    // Layering
    layering?: number;

    // SVG rendering
    strokewidth?: number;
    linefilter?: boolean;
    scale?: number;
    roundcoords?: number;
    viewbox?: boolean;
    desc?: boolean;
    lcpr?: number;
    qcpr?: number;

    // Blur
    blurradius?: number;
    blurdelta?: number;
  }

  export function imageToSVG(
    url: string,
    callback: (svgString: string) => void,
    options?: ImageTracerOptions | string
  ): void;

  export function imagedataToSVG(
    imgd: ImageData,
    options?: ImageTracerOptions | string
  ): string;
}
