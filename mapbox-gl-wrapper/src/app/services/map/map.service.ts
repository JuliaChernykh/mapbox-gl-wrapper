import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapOptions } from '../../types/types';
import {
  defaultMapOptions,
  MAP_STYLE_URL,
  TOKEN_MAPBOXGL,
  TOKEN_MAPTILER,
} from './constants';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;

  drawMap(mapElement: HTMLDivElement, options?: MapOptions): void {
    this.map = new mapboxgl.Map({
      accessToken: TOKEN_MAPBOXGL,
      container: mapElement,
      style: `${MAP_STYLE_URL}?key=${TOKEN_MAPTILER}`,
      ...defaultMapOptions,
      ...options,
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  removeMap(): void {
    this.map.remove();
  }
}
