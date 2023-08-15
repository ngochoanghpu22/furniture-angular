import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

import { LocalStorageService } from '../core/service/localStorage.service';
import { AppSettings } from '../core/constant/appSetting';
import { ProductService } from '../product/product.service';
import { ConvertToVND } from '../core/utils/currency';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

declare var $:any;

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product:any = {};
  quantityOrder = 1;
  currentPrice = 0;

  constructor(private productService: ProductService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    private modalService: NgbModal,
    protected router: Router) {
  }

  ngOnInit(): void {
    const productId = this.localStorageService.getItem(AppSettings.STORAGE.ProductId);
    if (productId) {
      this.getProductDetail(productId);
    }
    else {
      this.backToList();
    }
  }

  getProductDetail(productId: any) {
    this.productService
    .getProductDetail(productId)
    .subscribe(
      (data: any) => {
        if (data.isSuccessed) {
          this.currentPrice = data.resultObj.price;
          this.product = data.resultObj;
        }
        else {
          this.toastr.error(data.message);
        }
      },
      (error: any) => {
        this.toastr.error(error.error.message);
      }
    );
  }

  addToCart() {
    let myCart:any = [];
    let cart:any = this.localStorageService.getItem(AppSettings.STORAGE.Cart);    
    
    if (this.quantityOrder > 0) {
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
            // existed product in cart => update quantity
            if (item.productId == this.product.id) {
              isExistedProductInCart = true;
              myCart.push({
                productId: item.productId,
                quantity: item.quantity + this.quantityOrder
              });
            }
            else {
              myCart.push({
                productId: item.productId,
                quantity: item.quantity
              });
            }
          });
  
          // add new product into cart
          if (!isExistedProductInCart) {
            myCart.push({
              productId: this.product.id,
              quantity: this.quantityOrder
            });
          }
        }
      }
    }
    else {
      if (cart) {
        cart = JSON.parse(cart);

        // remove item in cart
        cart.forEach((item: any) => {
          if (item.productId != this.product.id) {
            myCart.push({
              productId: item.productId,
              quantity: item.quantity + this.quantityOrder
            });
          }
        });
      }
    }

    if (myCart.length > 0) {
      this.localStorageService.setItem(AppSettings.STORAGE.Cart, myCart);
    }
    else {
      this.localStorageService.removeItem(AppSettings.STORAGE.Cart);
    }

    // count total item in cart
    let totalItemInCart = 0;

    myCart.forEach((item: any) => {
      totalItemInCart += item.quantity;
    });

    $(".shopping-cart").attr("value", totalItemInCart);
  }

  clearCart() {
    this.localStorageService.removeItem(AppSettings.STORAGE.Cart);
    $(".shopping-cart").attr("value", 0);
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

      if (products?.length == 0) {
        this.toastr.error("There is no any product in cart. Please select product before purchase");
        return;
      }

      this.productService
      .createOrder(products)
      .subscribe(
        (data: any) => {
          if (data.isSuccessed) {
            this.localStorageService.removeItem(AppSettings.STORAGE.Cart);
            $(".shopping-cart").attr("value", 0);
            this.backToList();
            this.toastr.success("purchase order successfully");
          }
          else {
            this.toastr.error(data.message);
          }
        },
        (error: any) => {
          this.toastr.error(error.error.message);
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

  backToList() {
    this.router.navigate(["/product"]);
  }

  onChange(value: any) {
    if (!value) {
      value = 0
    }

    const price = this.product.price;
    this.currentPrice = value * price;
  }

  open(content: any, event: any) {    
    this.modalService.open(content, { size: 'md', backdrop: 'static' }).result.then((result) => {
      
    });
  }
}
