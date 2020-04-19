import { TestBed } from '@angular/core/testing';

import { PushapeService } from './pushape.service';

describe('PushapeService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PushapeService = TestBed.get(PushapeService);
    expect(service).toBeTruthy();
  });
});
