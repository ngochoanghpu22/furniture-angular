import { Component, OnInit } from '@angular/core';
import { CategoryService } from './category.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { Slug } from '../core/utils/slug';
import { LocalStorageService } from '../core/service/localStorage.service';
import { AppSettings } from '../core/constant/appSetting';


@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories:any = [];

  constructor(private categoryService: CategoryService,
    private toastr: ToastrService,
    private localStorageService: LocalStorageService,
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
    this.localStorageService.setItem(AppSettings.STORAGE.CategoryId, category.id);
    let categoryName = Slug(category.name);
    this.router.navigate([`/product/${categoryName}`]);
  }
}
