import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxFloorPlansComponent } from './ngx-floor-plans.component';

describe('NgxFloorPlansComponent', () => {
  let component: NgxFloorPlansComponent;
  let fixture: ComponentFixture<NgxFloorPlansComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxFloorPlansComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxFloorPlansComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
