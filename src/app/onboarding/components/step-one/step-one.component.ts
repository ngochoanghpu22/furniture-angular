import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { OnboardingViewService } from '../../services';
import { BaseStepComponent } from '../base-step.component';
import { AuthenticationService } from '@flex-team/core';
import { TranslocoService } from '@ngneat/transloco';
import { combineLatest, forkJoin } from 'rxjs';

@Component({
  selector: 'fxt-step-one',
  templateUrl: './step-one.component.html',
  styleUrls: ['./step-one.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StepOneComponent extends BaseStepComponent {

  public ownerFullName: string = '';
  public ownerEmail: string = '';

  public sender = 'simon@flexteam.fr';
  public emailToText = '';

  constructor(
    private authService: AuthenticationService,
    private viewService: OnboardingViewService,
    private translocoService: TranslocoService,
    private cd: ChangeDetectorRef) {
    super(authService, viewService);
    this.step = 1;

  }

  ngOnInit() {
    super.ngOnInit();
    this._viewService.onboarding$.subscribe(data => {
      this.ownerFullName = data.owner.firstName;
      this.ownerEmail = data.owner.email;
      this.initEmailNotToMeContent();
      this.cd.markForCheck();
    });

  }

  private initEmailNotToMeContent() {
    const link = location.href;
    const body$ = this.translocoService.selectTranslate('onboarding.mail_not_me_content', { name: this.ownerFullName, link: link });
    const subject$ = this.translocoService.selectTranslate('onboarding.mail_not_me_subject');
    const sub = combineLatest([body$, subject$]).subscribe(([body, subject]) => {
      this.emailToText = `mailto:${this.sender}?subject=${subject}&body=${body}`;
    }, error => {
      console.error('error', error)
    })

    if (sub) sub.unsubscribe();
  }

}
