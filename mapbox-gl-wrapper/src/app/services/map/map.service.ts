import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapOptions } from '../../types/types';
import {
  defaultMapOptions,
  MAP_STYLE_URL,
  TOKEN_MAPBOXGL,
  TOKEN_MAPTILER,
} from './constants';
import { HttpService, Pin } from '../http/http.service';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;
  pins: Pin[];

  constructor(private httpService: HttpService) {}

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

  addPins() {
    this.httpService.fetchPins().subscribe((data) => {
      this.pins = data.records.map((record: any) => ({
        latitude: record.geocode.Latitude,
        longitude: record.geocode.Longitude,
      }));
      console.log(this.pins);
      for (const pin of this.pins) {
        const el = document.createElement('div');
        el.className = 'pin';

        new mapboxgl.Marker(el)
          .setLngLat([Number(pin.longitude), Number(pin.latitude)])
          .addTo(this.map);
      }
    });
  }

  removeMap(): void {
    this.map.remove();
  }
}
