import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { AuthenticationService, ManagerMapViewService } from '@flex-team/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';

@Component({
  selector: 'fxt-avatar',
  templateUrl: './avatar.component.html',
  styleUrls: ['./avatar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent implements OnInit {

  @Input() imageSrc: string;
  @Input() shadow: boolean;
  @Input() size: number;
  @Input() id: any;
  

  private _destroyed: Subject<void> = new Subject<void>();

  // @HostBinding('attr.title')
  @Input() initial: string;

  @HostBinding('class.highlight') @Input() highlight: boolean;
  @HostBinding('class.is-current-user') @Input() isCurrentUser: boolean;

  constructor(
               private managerMapViewService: ManagerMapViewService,
               private authenticationService: AuthenticationService,
               private cd: ChangeDetectorRef
             ) 
  { }

  ngOnInit() {
    this.managerMapViewService.currentUser$.pipe(takeUntil(this._destroyed)).subscribe(currentUser => {
      if (currentUser ) {
        const storedUser = this.authenticationService.currentUser;
        if (currentUser.id == storedUser.id == this.id) {
          this.imageSrc = currentUser.avatar;
          this.cd.detectChanges();
        }
      }
    });
  }
}
