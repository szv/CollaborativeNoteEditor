import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NoteOverviewResponseDto, NotesServiceService } from 'src/libs/api-client';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.less']
})
export class NotesComponent implements OnInit {

  public loading: boolean = false;
  public notes$: Observable<NoteOverviewResponseDto[]> = new Observable();

  constructor(
    private readonly _notesService: NotesServiceService
  ) { }

  ngOnInit(): void {
    this.notes$ = this._notesService.notesGet();
  }

  public deleteNote(note: any): void {

  }
}
