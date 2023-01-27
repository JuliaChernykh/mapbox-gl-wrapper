export type MapOptions = {
  center: [number, number];
  zoom: number;
};

export type MapItems = {
  records: Record[];
};

type Record = {
  name: string;
  geocode: {
    Latitude: string;
    Longitude: string;
  };
};

export type Pin = {
  name: string;
  coordinates: [number, number];
};
