import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { NoteResponseDto, NotesServiceService, UpdateNoteRequestDto } from 'src/libs/api-client';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.less']
})
export class NoteComponent implements OnInit {

  public id: string | undefined | null;
  public note?: NoteResponseDto;
  public error?: any;
  public loading: boolean = false;
  public saving: boolean = false;
  public deleting: boolean = false;

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _notesService: NotesServiceService
  ) { }

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe(params => { 
      this.id = params.get('id');
      this.load();
    });
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.note = await firstValueFrom(this._notesService.notesIdGet(this.id!))
      .finally(() => this.loading = false);
  }

  public async save(): Promise<void> {
    this.saving = true;
    const updateData: UpdateNoteRequestDto = {
      content: this.note?.content
    };
    await firstValueFrom(this._notesService.notesIdPut(this.id!, updateData))
      .finally(() => this.saving = false);
  }

  public async delete(): Promise<void> {
    this.deleting = true;
    await firstValueFrom(this._notesService.notesIdDelete(this.id!))
      .finally(() => this.deleting = false);
  }
}
