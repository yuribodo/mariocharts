declare module "flubber" {
  interface InterpolateOptions {
    maxSegmentLength?: number;
    string?: boolean;
  }

  type Interpolator = (t: number) => string;

  export function interpolate(
    fromShape: string,
    toShape: string,
    options?: InterpolateOptions
  ): Interpolator;

  export function toCircle(
    fromShape: string,
    cx: number,
    cy: number,
    r: number,
    options?: InterpolateOptions
  ): Interpolator;

  export function toRect(
    fromShape: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options?: InterpolateOptions
  ): Interpolator;

  export function fromCircle(
    cx: number,
    cy: number,
    r: number,
    toShape: string,
    options?: InterpolateOptions
  ): Interpolator;

  export function fromRect(
    x: number,
    y: number,
    width: number,
    height: number,
    toShape: string,
    options?: InterpolateOptions
  ): Interpolator;

  export function separate(
    fromShape: string,
    toShapeList: string[],
    options?: InterpolateOptions
  ): Interpolator[];

  export function combine(
    fromShapeList: string[],
    toShape: string,
    options?: InterpolateOptions
  ): Interpolator[];

  export function interpolateAll(
    fromShapeList: string[],
    toShapeList: string[],
    options?: InterpolateOptions
  ): Interpolator[];

  export function splitPathString(pathString: string): string[];
}
