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
import { ActionPanelComponent } from '../../components/action-panel/action-panel.component';

@Injectable({
  providedIn: 'root',
})
export class MapService {
  map: mapboxgl.Map;
  pins: Pin[];
  features: any[];
  markers: any = {};
  markersOnScreen: any = {};
  selectedPin: any = null;

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
      this.pins = data.records.map(
        ({
          name,
          favorite,
          streetAddress,
          photo,
          listID,
          propertyID,
          geocode,
        }) => ({
          name,
          coordinates: [Number(geocode.Longitude), Number(geocode.Latitude)],
          listID,
          propertyID,
          favorite,
          streetAddress,
          photo,
        })
      );

      this.features = this.pins.map(
        (
          {
            coordinates,
            name,
            favorite,
            streetAddress,
            photo,
            listID,
            propertyID,
          },
          idx
        ) => ({
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates,
          },
          properties: {
            name,
            favorite,
            streetAddress,
            photo,
            listID,
            propertyID,
          },
          id: idx,
        })
      );

      // this.map.loadImage(PIN_ICON_URL, (error, image) => {
      //   if (error) throw error;
      //   this.map.addImage(`${LayerId.Pins}-img`, image as HTMLImageElement, {
      //     sdf: true,
      //   });
      this.addSource(
        LayerId.Pins,
        'geojson',
        'FeatureCollection',
        this.features
      );
      //   this.addLayer(
      //     LayerId.Pins,
      //     'symbol',
      //     {
      //       'icon-image': `${LayerId.Pins}-img`,
      //     },
      //     {
      //       'icon-color': [
      //         'case',
      //         ['boolean', ['feature-state', 'selected'], false],
      //         '#7EB09B',
      //         '#8D86C9',
      //       ],
      //     }
      //   );
      //   this.setCursorOnLayer(LayerId.Pins);
      // });

      this.map.on('render', () => {
        if (!this.map.isSourceLoaded(LayerId.Pins)) return;
        this.updateMarkers();
      });
    });
  }

  updateMarkers(): void {
    const newMarkers: any = {};
    // const features = this.map.querySourceFeatures(LayerId.Pins) as any;
    // console.log(features);

    // for every cluster on the screen, create an HTML marker for it (if we didn't yet),
    // and add it to the map if it's not there already
    for (const feature of this.features) {
      const coords = feature.geometry.coordinates;
      // const props = feature.properties;
      // if (!props.cluster) continue;
      const id = feature.id;

      let marker = this.markers[id];
      if (!marker) {
        const el = document.createElement('div');
        el.className = 'pin';
        if (feature.properties.favorite) {
          el.classList.add('favorite');
        }
        if (feature.properties.selected) {
          el.classList.add('selected');
        }
        marker = this.markers[id] = new mapboxgl.Marker({
          element: el,
        }).setLngLat(coords);
      }
      newMarkers[id] = marker;

      if (!this.markersOnScreen[id]) marker.addTo(this.map);
    }
    // for every marker we've added previously, remove those that are no longer visible
    for (const id in this.markersOnScreen) {
      if (!newMarkers[id]) this.markersOnScreen[id].remove();
    }
    this.markersOnScreen = newMarkers;
  }

  drawClusters(): void {
    this.map.setLayoutProperty(LayerId.Pins, 'visibility', 'none');
    this.map.addSource(LayerId.Clusters, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: this.features,
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    });
    this.map.addLayer({
      id: LayerId.Clusters,
      type: 'circle',
      source: LayerId.Clusters,
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
      id: 'cluster-count',
      type: 'symbol',
      source: LayerId.Clusters,
      filter: ['has', 'point_count'],
      layout: {
        'text-field': ['get', 'point_count_abbreviated'],
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
    });

    this.map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: LayerId.Clusters,
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#476A6F',
        'circle-radius': 8,
      },
    });

    this.map.on('click', LayerId.Clusters, (e) => {
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: [LayerId.Clusters],
      }) as any;
      const clusterId = features[0].properties?.['cluster_id'];
      const source = this.map.getSource(
        LayerId.Clusters
      ) as mapboxgl.GeoJSONSource;
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err) return;
        this.map.easeTo({
          center: features[0].geometry?.coordinates as mapboxgl.LngLatLike,
          zoom: zoom,
        });
      });
    });
    this.setCursorOnLayer(LayerId.Clusters);
  }

  enableZoomingToPin(): void {
    for (const key in this.markersOnScreen) {
      const el = this.markersOnScreen[key].getElement();
      el.addEventListener('click', () => {
        const coordinates = this.markersOnScreen[key].getLngLat();
        const lng = coordinates['lng'];
        const lat = coordinates['lat'];
        this.map.flyTo({
          center: [lng, lat],
          zoom: 14,
        });
      });
    }
    // this.map.on('click', LayerId.Pins, (e) => {
    //   if (!e.features || !('coordinates' in e.features[0].geometry)) return;
    //   this.map.flyTo({
    //     center: e.features[0].geometry.coordinates as mapboxgl.LngLatLike,
    //     zoom: 14,
    //   });
    // });
  }

  enableChangingPin(): void {
    for (const key in this.markersOnScreen) {
      const el = this.markersOnScreen[key].getElement();
      el.addEventListener('click', () => {
        if (this.selectedPin) {
          this.selectedPin.classList.remove('selected');
        }
        el.classList.add('selected');
        this.selectedPin = el;
      });
    }
    // let clickedStateId: number | string | undefined;
    //
    // this.map.on('click', LayerId.Pins, (e) => {
    //   if (!e.features) return;
    //   if (clickedStateId !== undefined) {
    //     this.map.setFeatureState(
    //       { source: LayerId.Pins, id: clickedStateId },
    //       { selected: false }
    //     );
    //   }
    //   clickedStateId = e.features[0].id;
    //   this.map.setFeatureState(
    //     { source: LayerId.Pins, id: clickedStateId },
    //     { selected: true }
    //   );
    // });
  }

  enablePopups(): void {
    for (const feature of this.features) {
      if (!this.markersOnScreen[feature.id]) return;

      const el = this.markersOnScreen[feature.id].getElement();
      el.addEventListener('click', () => {
        const { name, photo, streetAddress, favorite } = feature.properties;

        const description = `<button id="toggleAddToFavorites">${
          favorite ? 'Dislike' : 'Like'
        }</button><p>${name}</p><p>${streetAddress}</p><img src="${photo}"/>`;
        this.markersOnScreen[feature.id]
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }) // add popups
              .setHTML(description)
          )
          .addTo(this.map);
      });
    }
    // this.map.on('click', LayerId.Pins, (e: any) => {
    //   if (!e.features) return;
    //
    //   const coordinates = e.features[0].geometry.coordinates.slice();
    //   const { name, photo, streetAddress, favorite, listID, propertyID } =
    //     e.features[0].properties;
    //   console.log(listID, propertyID);
    //
    //   const description = `<button id="toggleAddToFavorites">${
    //     favorite ? 'Dislike' : 'Like'
    //   }</button><p>${name}</p><p>${streetAddress}</p><img src="${photo}"/>`;
    //
    //   while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
    //     coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
    //   }
    //
    //   new mapboxgl.Popup()
    //     .setLngLat(coordinates)
    //     .setHTML(description)
    //     .addTo(this.map);
    //
    //   document
    //     ?.getElementById('toggleAddToFavorites')
    //     ?.addEventListener('click', (event) => {
    //       this.toggleAddToFavorites(listID, propertyID, !favorite);
    //       e.features[0].properties.favorite = !favorite;
    //     });
    // });
  }

  toggleAddToFavorites(
    listID: number,
    propertyID: number,
    favorite: boolean
  ): void {
    this.httpService.updateFavorites(listID, propertyID, favorite);
  }

  centerMapByPins(): void {
    const coordinates = this.getCenterCoordinates();

    this.map.flyTo({
      center: coordinates,
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

  getCenterCoordinates(): [number, number] {
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

    return [centerX, centerY];
  }

  setCursorOnLayer(layerId: LayerId) {
    this.map.on('mouseenter', layerId, () => {
      this.map.getCanvas().style.cursor = 'pointer';
    });
    this.map.on('mouseleave', layerId, () => {
      this.map.getCanvas().style.cursor = '';
    });
  }

  removeMap(): void {
    this.map.remove();
  }
}
