import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { AppSettings } from './core/constant/appSetting';

declare var $:any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'furniture';

  ngOnInit(): void {
    let a = 1;
  }

  constructor(
    private router: Router
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)  
    ).subscribe((event: any) => {
      this.highLightHyperLink(event.url);
    });
  }

  highLightHyperLink(url: any) {
    if (!url) {
      url = AppSettings.ROUTE.Product;
    }

    url = url.toLowerCase().replace("/", "");
    if (AppSettings.ROUTE.SignIn == url || AppSettings.ROUTE.Product == url) {
      $("a.nav-link").removeClass("nav-link_active");
      $(`a.nav-link.${url}`).addClass("nav-link_active");
    }
  }
}
