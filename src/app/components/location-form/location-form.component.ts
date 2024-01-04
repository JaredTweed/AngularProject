import { Component, EventEmitter, Output } from '@angular/core';
import { ReportLocation } from '../../models/report.model';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import L from 'leaflet';
import { Router } from '@angular/router';

@Component({
  selector: 'app-location-form',
  templateUrl: './location-form.component.html',
  styleUrl: './location-form.component.css'
})
export class LocationFormComponent {
  map!: L.Map;
  form: FormGroup; 
  currentMarker!: L.Marker<any>;
  @Output() locationCreated = new EventEmitter<ReportLocation>();
  @Output() close = new EventEmitter<void>();
  
  constructor(private router: Router) {
    let formControls = {
      name: new FormControl("", [Validators.required]),
      longitude: new FormControl("", [Validators.required]),
      latitude: new FormControl("", [Validators.required, Validators.min(-90), Validators.max(90)]),
    };
    this.form = new FormGroup(formControls);
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  onSubmit(newLocation: ReportLocation) {
    // console.log(newLocation);
    this.form.reset();
    // console.log("Prev longitude: ", newLocation.longitude);
    // while (newLocation.longitude < -180) {newLocation.longitude += 360;}
    // newLocation.longitude = ((newLocation.longitude + 180) % 360) - 180;
    // this.form.patchValue({longitude: newLocation.longitude});
    // console.log("Post longitude: ", newLocation.longitude);
    this.locationCreated.emit(newLocation);
    // this.router.navigate(['']);
    this.closePopup();
  }

  closePopup() {
    this.close.emit();
  }

  initMap() {
    this.map = L.map('mapContainer', {center: [49.2, -122.7], zoom: 9.7});
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
    }).addTo(this.map);
    this.map.on('click', (e: any) => {
      this.form.controls['longitude'].setValue(e.latlng.lng.toFixed(4));
      this.form.controls['latitude'].setValue(e.latlng.lat.toFixed(4));
    });

    // Update the marker when the user changes the coordinates
    this.form.controls['longitude'].valueChanges.subscribe(value => {
      this.updateMarker(this.form.controls['latitude'].value, value);
    });
    this.form.controls['latitude'].valueChanges.subscribe(value => {
      this.updateMarker(value, this.form.controls['longitude'].value);
    });
  }

  updateMarker(latitude: number, longitude: number) {
    if (latitude && longitude) {
      if (this.currentMarker) {
        this.map!.removeLayer(this.currentMarker);
      }
      this.currentMarker = L.marker([latitude, longitude]);
      this.currentMarker.addTo(this.map!);
      this.map!.flyTo([latitude, longitude], 14);
    }
  }

  // closeOverlay() {
  //   this.map.closePopup();
  // }
}
