import { MapOptions } from '../../types/types';

export const TOKEN_MAPBOXGL =
  'pk.eyJ1IjoibGlvcmFnYW1pIiwiYSI6ImNramhobHQ5ZTB6dDYycmxvem9rYzJqZjIifQ.uSKeI0cJ9Z1wswq5N3_Evw';

export const TOKEN_MAPTILER = 'SoL71Zyf7SmLrVYWC7fQ';

export const MAP_STYLE_URL =
  'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json';

export const PIN_ICON_URL =
  'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png';

export const defaultMapOptions: MapOptions = {
  center: [-96.7, 32.823],
  zoom: 10,
};

export enum LayerId {
  Pins = 'pins',
  Clusters = 'clusters',
}
