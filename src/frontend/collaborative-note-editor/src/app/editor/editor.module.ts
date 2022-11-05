import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzInputModule } from 'ng-zorro-antd/input';

import { EditorComponent } from './components/editor.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    EditorComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NzInputModule,
  ],
  exports: [
    EditorComponent,
  ]
})
export class EditorModule { }
