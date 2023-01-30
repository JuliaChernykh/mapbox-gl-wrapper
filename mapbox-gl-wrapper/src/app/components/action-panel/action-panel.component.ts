import { Component } from '@angular/core';
import { MapService } from '../../services/map/map.service';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.css'],
})
export class ActionPanelComponent {
  constructor(private mapService: MapService) {}

  handleLoadPins(): void {
    this.mapService.drawPins();
  }

  handleEnableZoomingToPin(): void {
    this.mapService.enableZoomingToPin();
  }

  handleCenterMapByPins(): void {
    this.mapService.centerMapByPins();
  }

  handleDrawClusters(): void {
    this.mapService.drawClusters();
  }

  handleEnablePopups(): void {
    this.mapService.enablePopups();
  }

  handleEnableChangingPin(): void {
    this.mapService.enableChangingPin();
  }
}
