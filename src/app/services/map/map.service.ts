import { Injectable } from '@angular/core';
import * as mapboxgl from 'mapbox-gl';
import { Pin } from '../../types/types';
import {
  CLUSTER_SOURCE_OPTIONS,
  DataView,
  LARGE_ZOOM_VALUE,
  LayerId,
  MAP_OPTIONS,
  MAP_STYLE_URL,
  MEDIUM_ZOOM_VALUE,
  SourceId,
  TOKEN_MAPBOXGL,
  TOKEN_MAPTILER,
} from './constants';
import { HttpService } from '../http/http.service';
import { Store } from '@ngrx/store';
import { MapStoreState } from '../../models/map/types';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;
  pins: Pin[] = [];
  pinsOnScreen: { [key: number]: mapboxgl.Marker } = {};
  selectedPinEl: HTMLElement | null = null;
  dataView: DataView;

  constructor(
    private httpService: HttpService,
    private store: Store<{ mapStore: MapStoreState }>
  ) {
    this.store
      .select((state) => state.mapStore.pins)
      .subscribe((pins) => {
        this.pins = pins;
        this.drawPins();
      });
    this.store
      .select((state) => state.mapStore.selectedDataView)
      .subscribe((dataView) => {
        this.dataView = dataView;
        this.redrawPins();
      });
  }

  drawMap(mapElement: HTMLDivElement): void {
    this.map = new mapboxgl.Map({
      accessToken: TOKEN_MAPBOXGL,
      container: mapElement,
      style: `${MAP_STYLE_URL}?key=${TOKEN_MAPTILER}`,
      ...MAP_OPTIONS,
    });
    this.map.addControl(new mapboxgl.NavigationControl());
  }

  drawPins(): void {
    if (this.dataView === DataView.Clusters) {
      this.drawClusteredPins();
    } else {
      this.drawIndividualPins();
    }
  }

  redrawPins(): void {
    this.clearMap();
    this.drawPins();
  }

  drawIndividualPins(): void {
    if (this.pins.length === 0) return;

    for (const pin of this.pins) {
      const coords = pin.geometry.coordinates;
      const id = pin.id;

      const el = document.createElement('div');
      el.className = 'pin';
      if (pin.properties.favorite) {
        el.classList.add('favorite');
      }
      if (pin.properties.selected) {
        el.classList.add('selected');
      }
      const marker = new mapboxgl.Marker({
        element: el,
      }).setLngLat(coords);

      this.pinsOnScreen[id] = marker;
      marker.addTo(this.map);
    }
  }

  drawClusteredPins(): void {
    if (this.pins.length === 0) return;

    this.map.addSource(SourceId.Clusters, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.pins as any,
      },
      ...CLUSTER_SOURCE_OPTIONS,
    });

    this.map.addLayer({
      id: LayerId.Clusters,
      type: 'circle',
      source: SourceId.Clusters,
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#476A6F',
          5,
          '#7EB09B',
          20,
          '#C5C9A4',
        ],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 30, 20, 40],
      },
    });

    this.map.addLayer({
      id: LayerId.ClusterCount,
      type: 'symbol',
      source: SourceId.Clusters,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });

    this.map.addLayer({
      id: LayerId.UnclusteredPoints,
      type: 'circle',
      source: SourceId.Clusters,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': [
          'case',
          ['boolean', ['feature-state', 'selected'], false],
          '#8D86C9',
          '#476A6F',
        ],
        'circle-radius': 8,
      },
    });

    this.setZoomingOnCluster();
    this.setCursorOnLayer(LayerId.Clusters);
    this.setCursorOnLayer(LayerId.UnclusteredPoints);
  }

  clearMap(): void {
    if (this.dataView === DataView.Clusters) {
      this.removeIndividualPins();
    } else {
      this.removeClusteredPins();
    }
  }

  removeClusteredPins(): void {
    if (!this.map || !this.map.getSource(SourceId.Clusters)) return;
    this.map.removeLayer(LayerId.UnclusteredPoints);
    this.map.removeLayer(LayerId.ClusterCount);
    this.map.removeLayer(LayerId.Clusters);
    this.map.removeSource(SourceId.Clusters);
  }

  removeIndividualPins(): void {
    for (const key in this.pinsOnScreen) {
      this.pinsOnScreen[key].remove();
    }
  }

  enableZoomingToPin(): void {
    if (this.dataView === DataView.Clusters) {
      this.enableZoomingToClusteredPin();
    } else {
      this.enableZoomingToIndividualPin();
    }
  }

  enableZoomingToIndividualPin(): void {
    for (const key in this.pinsOnScreen) {
      const el = this.pinsOnScreen[key].getElement();
      el.addEventListener('click', () => {
        const lngLat = this.pinsOnScreen[key].getLngLat();
        this.map.flyTo({
          center: [lngLat['lng'], lngLat['lat']],
          zoom: LARGE_ZOOM_VALUE,
        });
      });
    }
  }

  enableZoomingToClusteredPin(): void {
    this.map.on('click', LayerId.UnclusteredPoints, (e) => {
      if (
        !e.features ||
        !('coordinates' in e.features[0].geometry) ||
        this.map.getZoom() >= LARGE_ZOOM_VALUE
      )
        return;
      this.map.flyTo({
        center: e.features[0].geometry.coordinates as mapboxgl.LngLatLike,
        zoom: LARGE_ZOOM_VALUE,
      });
    });
  }

  enableChangingPin(): void {
    if (this.dataView === DataView.Clusters) {
      this.enableChangingClusteredPin();
    } else {
      this.enableChangingIndividualPin();
    }
  }

  enableChangingClusteredPin(): void {
    let clickedStateId: number | string | undefined;

    this.map.on('click', LayerId.UnclusteredPoints, (e) => {
      if (!e.features) return;
      if (clickedStateId !== undefined) {
        this.map.setFeatureState(
          { source: SourceId.Clusters, id: clickedStateId },
          { selected: false }
        );
      }
      clickedStateId = e.features[0].id;
      this.map.setFeatureState(
        { source: SourceId.Clusters, id: clickedStateId },
        { selected: true }
      );
    });
  }

  enableChangingIndividualPin(): void {
    for (const key in this.pinsOnScreen) {
      const el = this.pinsOnScreen[key].getElement();
      el.addEventListener('click', () => {
        if (this.selectedPinEl) {
          this.selectedPinEl.classList.remove('selected');
        }
        el.classList.add('selected');
        this.selectedPinEl = el;
      });
    }
  }

  enablePopups(): void {
    if (this.dataView === DataView.Clusters) {
      this.enablePopupForClusteredPin();
    } else {
      this.enablePopupForIndividualPin();
    }
  }

  enablePopupForClusteredPin(): void {
    this.map.on('click', LayerId.UnclusteredPoints, (e: any) => {
      if (!e.features) return;

      const coordinates = e.features[0].geometry.coordinates.slice();
      const { name, photo, streetAddress } = e.features[0].properties;

      const description = `<p>${name}</p><p>${streetAddress}</p><img src="${photo}"/>`;

      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(description)
        .addTo(this.map);
    });
  }

  enablePopupForIndividualPin(): void {
    for (const pin of this.pins) {
      if (!this.pinsOnScreen[pin.id]) return;

      const el = this.pinsOnScreen[pin.id].getElement();
      el.addEventListener('click', () => {
        const { name, photo, streetAddress } = pin.properties;

        const description = `<p>${name}</p><p>${streetAddress}</p><img src="${photo}" alt=""/>`;

        this.pinsOnScreen[pin.id]
          .setPopup(new mapboxgl.Popup().setHTML(description))
          .addTo(this.map);
      });
    }
  }

  drawLocationList() {
    for (const pin of this.pins) {
      const listings = document.getElementById('listings');
      if (!listings) return;
      const listing = listings.appendChild(document.createElement('div'));
      listing.id = `listing-${pin.id}`;
      listing.className = 'item';

      const link = listing.appendChild(document.createElement('a'));
      link.href = '#';
      link.className = 'title';
      link.id = `link-${pin.id}`;
      link.innerHTML = `${pin.properties.name}`;

      const details = listing.appendChild(document.createElement('div'));
      details.innerHTML = `${pin.properties.streetAddress}`;

      const el = this.pinsOnScreen[pin.id].getElement();
      link.addEventListener('click', () => {
        el.click();
      });

      el.addEventListener('click', () => {
        const activeItem = document.getElementsByClassName('active');
        if (activeItem[0]) {
          activeItem[0].classList.remove('active');
        }
        const listing = document.getElementById(`listing-${pin.id}`);
        listing?.classList.add('active');
      });
    }
  }

  centerMapByPins(): void {
    const coordinates = this.getCenterCoordinates();

    this.map.flyTo({
      center: coordinates,
      zoom: MEDIUM_ZOOM_VALUE,
    });
  }

  getCenterCoordinates(): [number, number] {
    let [minX, minY] = this.pins[0].geometry.coordinates;
    let [maxX, maxY] = this.pins[0].geometry.coordinates;
    this.pins.forEach(({ geometry }) => {
      const { coordinates } = geometry;
      minX = Math.min(coordinates[0], minX);
      maxX = Math.max(coordinates[0], maxX);
      minY = Math.min(coordinates[1], minY);
      maxY = Math.max(coordinates[1], maxY);
    });

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    return [centerX, centerY];
  }

  setCursorOnLayer(layerId: LayerId): void {
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  setZoomingOnCluster(): void {
    this.map.on('click', SourceId.Clusters, (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [SourceId.Clusters],
      }) as any;
      const clusterId = features[0].properties?.['cluster_id'];
      const source = this.map.getSource(
        SourceId.Clusters
      ) as mapboxgl.GeoJSONSource;

      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: features[0].geometry?.coordinates as mapboxgl.LngLatLike,
          zoom: zoom,
        });
      });
    });
  }

  removeMap(): void {
    this.map.remove();
  }
}
