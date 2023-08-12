/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { OnboardingViewService } from './onboarding-view.service';

describe('Service: OnboardingView', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OnboardingViewService]
    });
  });

  it('should ...', inject([OnboardingViewService], (service: OnboardingViewService) => {
    expect(service).toBeTruthy();
  }));
});
