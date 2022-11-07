import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NotesRoutingModule } from './notes-routing.module';
import { NotesComponent } from './pages/notes/notes.component';
import { NoteComponent } from './pages/note/note.component';

import { IconsProviderModule } from '../icons-provider.module';
import { NzListModule } from 'ng-zorro-antd/list';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzPopconfirmModule } from 'ng-zorro-antd/popconfirm';
import { NzPageHeaderModule } from 'ng-zorro-antd/page-header';
import { NzDescriptionsModule } from 'ng-zorro-antd/descriptions';
import { NzSpaceModule } from 'ng-zorro-antd/space';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { EditorModule } from '../editor/editor.module';
import { FormsModule } from '@angular/forms';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@NgModule({
  declarations: [
    NotesComponent,
    NoteComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NotesRoutingModule,
    IconsProviderModule,
    EditorModule,
    NzListModule,
    NzButtonModule,
    NzPopconfirmModule,
    NzPageHeaderModule,
    NzDescriptionsModule,
    NzSpaceModule,
    NzToolTipModule,
    NzInputModule,
    NzSpinModule,
  ]
})
export class NotesModule { }
