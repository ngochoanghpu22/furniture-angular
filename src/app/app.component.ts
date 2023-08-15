import { Component, OnInit } from '@angular/core';
import { NavigationEnd, NavigationStart, Router } from '@angular/router';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { filter } from 'rxjs';
import { AppSettings } from './core/constant/appSetting';
import { LocalStorageService } from './core/service/localStorage.service';

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
    private router: Router,
    private localStorageService: LocalStorageService,
  ) {
    router.events.pipe(
      filter(event => event instanceof NavigationEnd)  
    ).subscribe((event: any) => {
      this.highLightHyperLink(event.url);
      this.updateShoppingCart();
    });
  }

  updateShoppingCart() {
    let totalItemInCart = 0;
    let cart:any = this.localStorageService.getItem(AppSettings.STORAGE.Cart);
    
    if (cart) {
      // count total item in cart
      cart = JSON.parse(cart);

      cart.forEach((item: any) => {
        totalItemInCart += item.quantity;
      });
    }
    
    $(".shopping-cart").attr("value", totalItemInCart);
  }

  highLightHyperLink(url: any) {
    if (!url || url == "/") {
      url = AppSettings.ROUTE.Product;
    }

    url = url.toLowerCase().replace("/", "");
    $("a.nav-link").removeClass("nav-link_active");
    $(`a.nav-link.${url}`).addClass("nav-link_active");
  }
}
