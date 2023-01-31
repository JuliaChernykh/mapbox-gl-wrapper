import { MapOptions } from '../../types/types';

export const TOKEN_MAPBOXGL =
  'pk.eyJ1IjoibGlvcmFnYW1pIiwiYSI6ImNramhobHQ5ZTB6dDYycmxvem9rYzJqZjIifQ.uSKeI0cJ9Z1wswq5N3_Evw';

export const TOKEN_MAPTILER = 'SoL71Zyf7SmLrVYWC7fQ';

export const MAP_STYLE_URL =
  'https://api.maptiler.com/maps/eef16200-c4cc-4285-9370-c71ca24bb42d/style.json';

const DEFAULT_ZOOM_VALUE = 10;
export const MEDIUM_ZOOM_VALUE = 11;
export const LARGE_ZOOM_VALUE = 14;

export const MAP_OPTIONS: MapOptions = {
  center: [-96.7, 32.823],
  zoom: DEFAULT_ZOOM_VALUE,
};

export const CLUSTER_SOURCE_OPTIONS = {
  cluster: true,
  clusterMaxZoom: 14,
  clusterRadius: 50,
};

export enum SourceId {
  Clusters = 'clusters',
}

export enum LayerId {
  UnclusteredPoints = 'unclusteredPoints',
  ClusterCount = 'clusterCount',
  Clusters = 'clusters',
}

export enum DataView {
  IndividualPins = 'individualPins',
  Clusters = 'clusters',
}
