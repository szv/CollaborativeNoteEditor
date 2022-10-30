import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NzInputModule } from 'ng-zorro-antd/input';

import { EditorComponent } from './components/editor.component';


@NgModule({
  declarations: [
    EditorComponent,
  ],
  imports: [
    CommonModule,
    NzInputModule,
  ],
  exports: [
    EditorComponent,
  ]
})
export class EditorModule { }
