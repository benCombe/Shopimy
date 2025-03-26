import { TestBed } from '@angular/core/testing';

import { StoreNavService } from './store-nav.service';

describe('StoreNavService', () => {
  let service: StoreNavService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StoreNavService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
