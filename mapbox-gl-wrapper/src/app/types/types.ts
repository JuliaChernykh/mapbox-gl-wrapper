import * as mapboxgl from 'mapbox-gl';

export type MapOptions = {
  center: [number, number];
  zoom: number;
};

export type PinsData = {
  records: Record[];
};

type Record = {
  name: string;
  listID: number;
  propertyID: number;
  geocode: {
    Latitude: string;
    Longitude: string;
  };
  favorite: boolean;
  streetAddress: string;
  photo: string;
};

export type Pin = {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    listID: number;
    propertyID: number;
    name: string;
    favorite: boolean;
    streetAddress: string;
    photo: string;
    selected?: boolean;
  };
  id: number;
};
