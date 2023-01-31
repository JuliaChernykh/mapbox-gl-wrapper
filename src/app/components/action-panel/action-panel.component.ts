import { Component, OnInit } from '@angular/core';
import { MapService } from '../../services/map/map.service';
import { DataView } from '../../services/map/constants';
import { MapStoreState } from '../../models/map/types';
import { Store } from '@ngrx/store';
import { setSelectedDataView } from '../../models/map/map.actions';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.scss'],
})
export class ActionPanelComponent implements OnInit {
  selectedDataView$: DataView;
  pinsLoadedSuccessfully$: boolean;
  isLoadDataButtonClicked: boolean = false;
  isEnableZoomingToPinButtonClicked: boolean = false;
  isEnablePopupsButtonClicked: boolean = false;
  isEnableChangingPinButtonClicked: boolean = false;
  isAddLocationsListButtonClicked: boolean = false;

  constructor(
    private mapService: MapService,
    private store: Store<{ mapStore: MapStoreState }>
  ) {}

  get DataView() {
    return DataView;
  }

  ngOnInit() {
    this.store
      .select((state) => state.mapStore.selectedDataView)
      .subscribe((dataView) => {
        this.selectedDataView$ = dataView;
      });
    this.store
      .select((state) => state.mapStore.pinsLoadedSuccessfully)
      .subscribe((loadedSuccessfully) => {
        this.pinsLoadedSuccessfully$ = loadedSuccessfully;
      });
  }

  handleLoadData(): void {
    this.store.dispatch({ type: '[Action Panel] Load Data' });
    this.isLoadDataButtonClicked = true;
  }

  setSelected(view: DataView): void {
    this.store.dispatch(setSelectedDataView({ dataView: view }));
    this.isEnablePopupsButtonClicked = false;
    this.isEnableZoomingToPinButtonClicked = false;
    this.isEnableChangingPinButtonClicked = false;
    this.isAddLocationsListButtonClicked = false;
  }

  handleCenterMapByPins(): void {
    if (!this.pinsLoadedSuccessfully$) return;
    this.mapService.centerMapByPins();
  }

  enableZoomingToPin(): void {
    if (!this.pinsLoadedSuccessfully$) return;
    this.mapService.enableZoomingToPin();
    this.isEnableZoomingToPinButtonClicked = true;
  }

  enablePopups(): void {
    if (!this.pinsLoadedSuccessfully$) return;
    this.mapService.enablePopups();
    this.isEnablePopupsButtonClicked = true;
  }

  enableChangingPin(): void {
    if (!this.pinsLoadedSuccessfully$) return;
    this.mapService.enableChangingPin();
    this.isEnableChangingPinButtonClicked = true;
  }

  addLocationsLis(): void {
    if (!this.pinsLoadedSuccessfully$) return;
    this.mapService.drawLocationList();
    this.isAddLocationsListButtonClicked = true;
  }
}
