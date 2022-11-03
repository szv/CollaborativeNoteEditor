import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { observable, Observable } from 'rxjs';
import { NoteResponseDto, NotesServiceService } from 'src/libs/api-client';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.less']
})
export class NoteComponent implements OnInit {

  public id: string | undefined | null;
  public note$: Observable<NoteResponseDto> = new Observable();

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _notesService: NotesServiceService
  ) { }

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe(params => { 
      this.id = params.get('id');
      this.note$ = this._notesService.notesIdGet(this.id!);
    });
  }
}
