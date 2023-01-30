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
  isLoadDataButtonClicked: boolean = false;
  isEnableZoomingToPinButtonClicked: boolean = false;
  isEnablePopupsButtonClicked: boolean = false;
  isEnableChangingPinButtonClicked: boolean = false;

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
  }

  handleCenterMapByPins(): void {
    this.mapService.centerMapByPins();
  }

  enableZoomingToPin(): void {
    this.mapService.enableZoomingToPin();
    this.isEnableZoomingToPinButtonClicked = true;
  }

  enablePopups(): void {
    this.mapService.enablePopups();
    this.isEnablePopupsButtonClicked = true;
  }

  enableChangingPin(): void {
    this.mapService.enableChangingPin();
    this.isEnableChangingPinButtonClicked = true;
  }
}
