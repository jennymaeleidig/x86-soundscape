import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragToSelectModule } from 'ngx-drag-to-select';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DragToSelectModule.forRoot()
  ]
})
export class AppModule { }
