import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '@flex-team/core';
import { Role } from 'src/app/core/services/workloads/enums/role.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from 'src/app/core/services/task-service/task.service';
import { ToastrService } from 'ngx-toastr';
import { UserService } from 'src/app/core/services/user-service/user.service';
import { ModalConfirmationComponent, ModalService } from '@design-system/core';
import { UserTaskService } from 'src/app/core/services/user-task-service/user-task-service';

@Component({
  selector: 'fxt-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss']
})
export class TaskDetailComponent implements OnInit {

  task: any = {
    isActive: true
  };

  name = "ng2-ckeditor";
  ckeConfig: any;
  guideline: string;
  log: string = "";
  @ViewChild("myckeditor") ckeditor: any;

  taskDetailForm: FormGroup;
  isEditTask: boolean;
  isDetailTask: boolean;
  isAddTask: boolean;
  canPickTask: boolean;
  currentStatusTask: any = null;
  loading = false;
  taskId: any = null;
  userId: any = null;
  users: any[] = [];
  isAdmin: boolean = false;
  isPickedTask: boolean = false;
  isMyOwnTasks: boolean = false;
  isFinishedTasks: boolean = false;

  canSwitchTask: boolean = false;
 
  originalDocument: any = null;
  linkDocument: any = null;  
  linkYoutube: any = null;

  constructor(private formBuilder: FormBuilder,
              private router: Router,
              protected modalService: ModalService,
              private activatedRoute: ActivatedRoute,
              private taskService: TaskService,
              private userService: UserService,
              private userTaskService: UserTaskService,
              private toastr: ToastrService,
              private authService: AuthenticationService) 
  { 
    const currentUser = this.authService.currentUser;
    this.isAdmin = currentUser.role == Role.Admin;
    const url = this.router.url;
    this.isMyOwnTasks = this.activatedRoute.snapshot.queryParamMap.get('isMyOwnTasks') == 'true';
    this.isFinishedTasks = this.activatedRoute.snapshot.queryParamMap.get('isFinishedTask') == 'true';
    this.isEditTask = url.indexOf("edit-task") != -1 ;
    this.isDetailTask = url.indexOf("detail-task") != -1;
    this.isAddTask = url.indexOf("add-task") != -1;
    this.canSwitchTask = currentUser.role == Role.Admin || currentUser.role == Role.SuperAdmin;
    
    this.taskId = parseInt(this.activatedRoute.snapshot.params.id) || null;

    this.initDetailForm();

    if (this.taskId && (this.isEditTask || this.isDetailTask)) {
      this.getTaskById(this.taskId);
    }

  }

  ngOnInit(): void {
    this.ckeConfig = {
      readOnly: !this.isEditTask && !this.isAddTask,
      extraPlugins:
        "easyimage,dialogui,dialog,a11yhelp,about,basicstyles,bidi,blockquote,clipboard," +
        "button,panelbutton,panel,floatpanel,colorbutton,colordialog,menu," +
        "contextmenu,dialogadvtab,div,elementspath,enterkey,entities,popup," +
        "filebrowser,find,fakeobjects,flash,floatingspace,listblock,richcombo," +
        "font,format,forms,horizontalrule,htmlwriter,iframe,image,indent," +
        "indentblock,indentlist,justify,link,list,liststyle,magicline," +
        "maximize,newpage,pagebreak,pastefromword,pastetext,preview,print," +
        "removeformat,resize,save,menubutton,scayt,selectall,showblocks," +
        "showborders,smiley,sourcearea,specialchar,stylescombo,tab,table," +
        "tabletools,templates,toolbar,undo,wsc,wysiwygarea"
    };
   
    this.getClients();

    this.isPickedTask = this.activatedRoute.snapshot.queryParamMap.get('isMyPickedTasks') == 'true' || this.activatedRoute.snapshot.queryParamMap.get('isMyOwnTasks') == 'true';    
  }

  onEditorChange(event: any) {

  }

  onChange(event: any): void {

  }

  handleInputChange(e: any) {
    var file = e.target.files[0];
    this.linkDocument = file;
  }

  // private handleUpLoadAvatar() {
  //   this.userService
  //     .updateAvatar(this.fileToUpload, "1")
  //     .subscribe(
  //       (data) => {
  //         this.loading = false;
  //         this.user.avatar = data.resultObj;
  //         this.managerMapViewService.currentUser = this.user;
  //         this.toastr.success("Updated avatar successfully.");
  //       },
  //       (error) => {
  //         this.loading = false;
  //         this.toastr.error(error.message);
  //       }
  //     );
  // }

  getClients() {
    this.userService
      .getClients()
      .subscribe(
        (data: any) => {
          this.loading = false;
          this.users = data.resultObj;
        },
        (error: { message: string; }) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }

  get f() {
    return this.taskDetailForm.controls;
  }

  eventCheck(event: any) {
    //this.isPickedTask = event.target.checked;
    var message = event.target.checked ? "Are you sure you want to pick this task?" : "Are you sure you want to un-pick this task?" ;

   
      const modalRef = this.modalService.open(ModalConfirmationComponent, {
        width: 'auto',
        disableClose: true,
        data: {
          message: message
        }
      });
  
      modalRef.afterClosed$.subscribe((ok) => {
        if (ok) {
          const params = {
            taskId: this.taskId,
            isPickedTask: event.target.checked
          };

          this.userService
            .pickTask(params)
            .subscribe(
              (data: any) => {
                this.loading = false;

                if (data.isSuccessed) {
                  this.toastr.success("You picked task succesfully.")
                }
                else {
                  this.toastr.error(data.message);
                }

                this.gotoListTask();
              },
              (error: { message: string; }) => {
                this.loading = false;
                this.toastr.error(error.message);
              }
            );
        }
        else {
          this.isPickedTask = !this.isPickedTask;
        }
      });
  }

  getTaskById(id: any) {
    const params = {
        id: id
    };

    this.taskService
      .getTaskById(params)
      .subscribe(
        (data: any) => {
          this.loading = false;
          const task = data.body.resultObj;
          this.initDetailForm(task);
          //this.isDisablePickTask = this.activatedRoute.snapshot.queryParamMap.get('isMyPickedTasks') == 'true' || this.activatedRoute.snapshot.queryParamMap.get('isMyOwnTasks') == 'true';
        },
        (error: { message: string; }) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }

  initDetailForm(currentTask: any = null) {

    this.guideline = currentTask?.guideline;
    this.originalDocument = currentTask?.document;
    this.linkDocument = currentTask?.document;
    this.linkYoutube = currentTask?.linkYoutube;
    this.currentStatusTask = currentTask?.isActive;

    this.taskDetailForm = this.formBuilder.group({
      id: [ currentTask == null ? null : currentTask.id, []],
      averageCompletionTime: 0,
      //averageCompletionTime: [{value: currentTask == null ? null : currentTask.averageCompletionTime, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      name: [{value: currentTask == null ? null : currentTask.name, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      ownerBy: [{value: currentTask == null ? null : currentTask.ownerBy, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      bidPerTaskCompletion: [{value: currentTask == null ? null : currentTask.bidPerTaskCompletion, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      budget: [{value: currentTask == null ? null : currentTask.budget, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      document: [{value: currentTask == null ? null : currentTask.document, disabled: !this.isEditTask && !this.isAddTask }, []],
      linkYoutube: [{value: currentTask == null ? null : currentTask.linkYoutube, disabled: !this.isEditTask && !this.isAddTask }, []],
      //guideline: [{value: currentTask == null ? null : currentTask.guideline, disabled: !this.isEditTask }, [Validators.required]],
      linkPage: [{value: currentTask == null ? null : currentTask.linkPage, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]],
      durationOnPage: [{value: currentTask == null ? null : currentTask.durationOnPage, disabled: !this.isEditTask && !this.isAddTask }, [Validators.required]]
    });

    //this.taskDetailForm.controls.name.setValue('task 1');
  }

  onupdateStatus(row: any) {
    this.currentStatusTask = !this.currentStatusTask;
  }

  gotoListTask() {
    this.router.navigate(['/manager/list-task']);
  }

  editTask() {
    this.loading = true;

    let taskDto: any = {};
    taskDto.id = this.taskId;
    taskDto.ownerBy = this.taskDetailForm.controls.ownerBy.value;
    taskDto.name = this.taskDetailForm.controls.name.value;
    taskDto.averageCompletionTime = parseInt(this.taskDetailForm.controls.averageCompletionTime.value);
    taskDto.bidPerTaskCompletion = parseFloat(this.taskDetailForm.controls.bidPerTaskCompletion.value);
    taskDto.budget = parseFloat(this.taskDetailForm.controls.budget.value);
    taskDto.document = this.linkDocument;
    taskDto.linkYoutube = this.taskDetailForm.controls.linkYoutube.value;
    taskDto.guideline = this.guideline;
    taskDto.linkPage = this.taskDetailForm.controls.linkPage.value;
    taskDto.durationOnPage = parseInt(this.taskDetailForm.controls.durationOnPage.value);
    taskDto.currentStatusTask = this.currentStatusTask

    this.taskService
      .createTask_v2(this.linkDocument, taskDto)
      .subscribe(
        (data: { resultObj: any; }) => {
          this.loading = false;
          if (!taskDto.id) {
            //this.authService.currentUser = data.resultObj;
            //this.managerMapViewService.currentUser = data.resultObj;
            this.toastr.success("Create task successfully.");
          }
          else {
            this.toastr.success("Update task successfully.");
          }
          
          this.gotoListTask();
        },
        (error: { message: string; }) => {
          this.loading = false;
          this.toastr.error(error.message);
        }
      );
  }
}
