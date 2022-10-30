import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { NotesComponent } from './pages/notes/notes.component';
import { NoteComponent } from './pages/note/note.component';

import { IconsProviderModule } from '../icons-provider.module';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { EditorModule } from '../editor/editor.module';

@NgModule({
  declarations: [
    NotesComponent,
    NoteComponent,
  ],
  imports: [
    CommonModule,
    NotesRoutingModule,
    IconsProviderModule,
    EditorModule,
    NzListModule,
    NzButtonModule,
    NzPopconfirmModule,
  ]
})
export class NotesModule { }
