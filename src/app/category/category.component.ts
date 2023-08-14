import { Component, OnInit } from '@angular/core';
import { CategoryService } from './category.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
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
