declare module 'node-geocoder' {
  export interface Options {
    provider: string;
    apiKey?: string;
    formatter?: any;
  }

  export interface Geocoder {
    forwardGeocode(params: any): Promise<any>;
  }

  export default function geocoder(options: Options): Geocoder;
}
