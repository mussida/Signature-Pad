import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';
import { OrginalSignaturePadComponent } from '../orginal-signature-pad/orginal-signature-pad.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SignaturePadComponent, OrginalSignaturePadComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {}
