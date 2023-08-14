import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { CategoryService } from '../category/category.service';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  products:any = [];

  constructor(private categoryService: CategoryService,
    private toastr: ToastrService,
    protected router: Router) {
  }

  ngOnInit(): void {
    this.getCategories();
  }

  getCategories() {
    this.categoryService
    .getCategories()
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
    let a = 1;
  }
}
