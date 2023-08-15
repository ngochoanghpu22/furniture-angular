import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { LocalStorageService } from '../core/service/localStorage.service';
import { AppSettings } from '../core/constant/appSetting';
import { ProductService } from '../product/product.service';
import { ConvertToVND } from '../core/utils/currency';

declare var $:any;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product:any = {};
  quantityOrder = 1;

  constructor(private productService: ProductService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    protected router: Router) {
  }

  ngOnInit(): void {
    const productId = this.localStorageService.getItem(AppSettings.STORAGE.ProductId);
    if (productId) {
      this.getProductDetail(productId);
    }
  }

  getProductDetail(productId: any) {
    this.productService
    .getProductDetail(productId)
    .subscribe(
      (data: any) => {
        if (data.isSuccessed) {
          this.product = data.resultObj;
        }
        else {
          this.toastr.error(data.message);
        }
      },
      (error: { message: string; }) => {
        this.toastr.error(error.message);
      }
    );
  }

  addToCart() {
    const totalItemInCart = parseInt($(".shopping-cart").attr("value"));
    $(".shopping-cart").attr("value", totalItemInCart + this.quantityOrder);

    let myCart:any = [];
    let cart:any = this.localStorageService.getItem(AppSettings.STORAGE.Cart);
    if (!cart) {
      myCart.push({
        productId: this.product.id,
        quantity: this.quantityOrder
      })
    }
    else {
      cart = JSON.parse(cart);
      let isExistedProductInCart = false;
      if (cart) {
        cart.forEach((item: any) => {
          if (item.id == this.product.id) {
            isExistedProductInCart = true;
            myCart.push({
              productId: item.id,
              quantity: item.quantity + this.quantityOrder
            });
          }
          else {
            myCart.push({
              productId: item.id,
              quantity: item.quantity
            });
          }
        });

        if (!isExistedProductInCart) {
          myCart.push({
            productId: this.product.id,
            quantity: this.quantityOrder
          });
        }
      }
    }

    if (myCart.length > 0) {
      this.localStorageService.setItem(AppSettings.STORAGE.Cart, myCart);
    }
  }

  purchaseOrder() {
    const currentUser = this.localStorageService.getItem(AppSettings.STORAGE.Profile);
    if (!currentUser) {
      this.toastr.error("Please sign in to purchase order");
      return;
    }

    let products = this.localStorageService.getItem(AppSettings.STORAGE.Cart);
    if (products) {
      products = JSON.parse(products);

      this.productService
      .createOrder(products)
      .subscribe(
        (data: any) => {
          if (data.isSuccessed) {
            this.localStorageService.removeItem(AppSettings.STORAGE.Cart);
            $(".shopping-cart").attr("value", 0);
            this.router.navigate(["/product"]);
            this.toastr.success("purchase order successfully");
          }
          else {
            this.toastr.error(data.message);
          }
        },
        (error: { message: string; }) => {
          this.toastr.error(error.message);
        }
      );
    }
  }  

  formatPrice(price: any) {
    return ConvertToVND(price);
  }

  numberOnly(event: { which: any; keyCode: any; }): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }

    return true;
  }
}
