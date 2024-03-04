import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrginalSignaturePadComponent } from './orginal-signature-pad.component';

describe('OrginalSignaturePadComponent', () => {
  let component: OrginalSignaturePadComponent;
  let fixture: ComponentFixture<OrginalSignaturePadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrginalSignaturePadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrginalSignaturePadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
