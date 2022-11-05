import { Component, OnInit } from '@angular/core';
import { Observable, firstValueFrom } from 'rxjs';
import { NoteOverviewResponseDto, NotesServiceService } from 'src/libs/api-client';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.less']
})
export class NotesComponent implements OnInit {

  public loading: boolean = false;
  public deletingId?: string;
  public notes: NoteOverviewResponseDto[] = [];

  constructor(
    private readonly _notesService: NotesServiceService
  ) { }

  ngOnInit(): void {
    this.load();
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.notes = await firstValueFrom(this._notesService.notesGet())
      .finally(() => this.loading = false);
  }

  public async deleteNote(note: any): Promise<void> {
    this.deletingId = note.id;
    await firstValueFrom(this._notesService.notesIdDelete(note.id))
      .then(async () => await this.load())
      .finally(() => this.deletingId = undefined);
  }
}
