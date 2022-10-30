import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NoteComponent } from './pages/note/note.component';
import { NotesComponent } from './pages/notes/notes.component';

const routes: Routes = [
  { path: '', component: NotesComponent },
  { path: ':id', component: NoteComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotesRoutingModule { }
