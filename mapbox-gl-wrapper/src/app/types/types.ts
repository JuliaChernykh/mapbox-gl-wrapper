import * as mapboxgl from 'mapbox-gl';

export type MapOptions = {
  center: [number, number];
  zoom: number;
};

export type MapItems = {
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
  listID: number;
  propertyID: number;
  name: string;
  coordinates: [number, number];
  favorite: boolean;
  streetAddress: string;
  photo: string;
};
