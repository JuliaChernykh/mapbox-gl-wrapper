import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { MapOptions, Pin } from '../../types/types';
import {
  defaultMapOptions,
  LayerId,
  MAP_STYLE_URL,
  PIN_ICON_URL,
  TOKEN_MAPBOXGL,
  TOKEN_MAPTILER,
} from './constants';
import { HttpService } from '../http/http.service';

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

  drawPins(): void {
    this.httpService.fetchPins().subscribe((data) => {
      // store
      this.pins = data.records.map(({ name, geocode }) => ({
        name,
        coordinates: [Number(geocode.Longitude), Number(geocode.Latitude)],
      }));
      const features = this.pins.map(({ coordinates, name }, idx) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {
          title: name,
        },
        id: idx,
      }));

      this.map.loadImage(PIN_ICON_URL, (error, image) => {
        if (error) throw error;
        this.map.addImage(`${LayerId.Pins}-img`, image as HTMLImageElement, {
          sdf: true,
        });
        this.addSource(LayerId.Pins, 'geojson', 'FeatureCollection', features);
        this.addLayer(
          LayerId.Pins,
          'symbol',
          {
            'icon-image': `${LayerId.Pins}-img`,
          },
          {
            'icon-color': [
              'case',
              ['boolean', ['feature-state', 'selected'], false],
              '#FF8C00',
              '#008000',
            ],
          }
        );

        this.map.on('mouseenter', LayerId.Pins, () => {
          this.map.getCanvas().style.cursor = 'pointer';
        });
        this.map.on('mouseleave', LayerId.Pins, () => {
          this.map.getCanvas().style.cursor = '';
        });
      });
    });
  }

  enableZoomingToPin(): void {
    this.map.on('click', LayerId.Pins, (e: any) => {
      if (!e.features) {
        return;
      }
      this.map.flyTo({
        center: e.features[0].geometry.coordinates,
        zoom: 14,
      });
    });
  }

  enableChangingPin(): void {
    let hoveredStateId: number | string | undefined;

    this.map.on('click', LayerId.Pins, (e) => {
      if (!e.features) {
        return;
      }
      if (hoveredStateId !== undefined) {
        this.map.setFeatureState(
          { source: LayerId.Pins, id: hoveredStateId },
          { selected: false }
        );
      }
      hoveredStateId = e.features[0].id;
      this.map.setFeatureState(
        { source: LayerId.Pins, id: hoveredStateId },
        { selected: true }
      );
    });
  }

  centerMapByPins(): void {
    let [minX, minY] = this.pins[0].coordinates;
    let [maxX, maxY] = this.pins[0].coordinates;
    this.pins.forEach(({ coordinates }) => {
      minX = Math.min(coordinates[0], minX);
      maxX = Math.max(coordinates[0], maxX);
      minY = Math.min(coordinates[1], minY);
      maxY = Math.max(coordinates[1], maxY);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    this.map.flyTo({
      center: [centerX, centerY],
      zoom: 11,
    });
  }

  addLayer(
    id: string,
    type: mapboxgl.AnyLayer['type'],
    layout: any,
    paint: any
  ): void {
    this.map.addLayer({
      id,
      type,
      source: id,
      layout,
      paint,
    } as mapboxgl.AnyLayer);
  }

  addSource(
    id: string,
    type: mapboxgl.AnySourceData['type'],
    dataType: string,
    features: any
  ): void {
    this.map.addSource(id, {
      type,
      data: {
        type: dataType,
        features,
      },
    } as mapboxgl.AnySourceData);
  }

  removeMap(): void {
    this.map.remove();
  }
}
