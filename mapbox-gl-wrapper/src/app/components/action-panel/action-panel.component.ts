import { Component } from '@angular/core';
import { MapService } from '../../services/map/map.service';

@Component({
  selector: 'app-action-panel',
  templateUrl: './action-panel.component.html',
  styleUrls: ['./action-panel.component.css'],
})
export class ActionPanelComponent {
  constructor(private mapService: MapService) {}

  handleLoadPins() {
    this.mapService.drawPins();
  }

  handleEnableZoomingToPin() {
    this.mapService.enableZoomingToPin();
  }

  handleCenterMapByPins() {
    this.mapService.centerMapByPins();
  }

  handleEnableChangingPin() {
    this.mapService.enableChangingPin();
  }
}
