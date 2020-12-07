import { TestBed } from '@angular/core/testing';

import { NgxFloorPlansService } from './ngx-floor-plans.service';

describe('NgxFloorPlansService', () => {
  let service: NgxFloorPlansService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxFloorPlansService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
