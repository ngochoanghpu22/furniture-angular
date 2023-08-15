import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { OrderService } from './order.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ConvertToVND } from '../core/utils/currency';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.css']
})
export class OrderComponent implements OnInit {
  orders:any = [];
  orderDetail: any = {};
  title = "";

  constructor(private orderService: OrderService,
    private toastr: ToastrService,
    private modalService: NgbModal,
    protected router: Router) {
  }

  ngOnInit(): void {
      this.getOders();
  }

  getOders() {
    this.orderService
    .getOrders()
    .subscribe(
      (data: any) => {
        if (data.isSuccessed) {
          this.orders = data.resultObj;
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

  getOrderDetail(order: any) {
    this.orderService
    .getOrderDetail(order.id)
    .subscribe(
      (data: any) => {
        if (data.isSuccessed) {
          this.orderDetail = data.resultObj;
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

  open(content: any, event: any, order: any, currentIndex: any) {
    this.title = currentIndex + 1;
    this.getOrderDetail(order);
    this.modalService.open(content, { size: 'lg', backdrop: 'static' }).result.then((result) => {
      
    });
  }

  formatPrice(price: any) {
    return ConvertToVND(price);
  }
}
