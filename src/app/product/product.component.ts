import { Component, OnInit } from '@angular/core';
import { CategoryService } from './product.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  categories:any = [];

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
          this.categories = data.resultObj;
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

  getProductList(category: any) {
    let a = 1;
  }
}
