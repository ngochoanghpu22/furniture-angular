import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { LocalStorageService } from '../core/service/localStorage.service';
import { AppSettings } from '../core/constant/appSetting';
import { Slug } from '../core/utils/slug';
import { ConvertToVND } from '../core/utils/currency';
import { ProductService } from './order.service';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  products:any = [];

  constructor(private productService: ProductService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
    protected router: Router) {
  }

  ngOnInit(): void {
    const categoryId = this.localStorageService.getItem(AppSettings.STORAGE.CategoryId);
    if (categoryId) {
      this.getProducts(categoryId);
    }
  }

  getProducts(categoryId: any) {
    this.productService
    .getProducts(categoryId)
    .subscribe(
      (data: any) => {
        if (data.isSuccessed) {
          this.products = data.resultObj;
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

  getProductDetail(product: any) {
    this.localStorageService.setItem(AppSettings.STORAGE.ProductId, product.id);
    let productName = Slug(product.name);
    this.router.navigate([`/product-detail/${productName}`]);
  }

  formatPrice(price: any) {
    return ConvertToVND(price);
  }
}
