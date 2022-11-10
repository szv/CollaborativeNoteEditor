import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CreateNoteRequestDto, NoteOverviewResponseDto, NotesServiceService } from 'src/libs/api-client';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.less']
})
export class NotesComponent implements OnInit {

  public loading: boolean = false;
  public deletingIds: string[] = [];
  public creatingNote: boolean = false;
  public notes: NoteOverviewResponseDto[] = [];

  constructor(
    private readonly _notesService: NotesServiceService,
    private readonly _router: Router,
  ) { }

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  public isDeleting(noteId?: string): boolean {
    if (!noteId) return false;
    return this.deletingIds.indexOf(noteId) !== -1;
  }

  public async load(): Promise<void> {
    this.loading = true;
    this.notes = await firstValueFrom(this._notesService.notesGet())
      .finally(() => this.loading = false);
  }

  public async deleteNote(note: any): Promise<void> {
    this.deletingIds.push(note.id);
    await firstValueFrom(this._notesService.notesIdDelete(note.id))
      .then(async () => await this.load())
      .finally(() => this.deletingIds = this.deletingIds.filter(x => x !== note.id));
  }

  public async newNote(): Promise<void> {
    this.creatingNote = true;
    const createData: CreateNoteRequestDto = { content: "" };
    await firstValueFrom(this._notesService.notesPost(createData))
      .then(async (result) => {
        if (!result?.id) return;
        await this.navigateToCreatedNote(result.id);
      })
      .finally(() => this.creatingNote = false);
  }

  private async navigateToCreatedNote(createdNoteId: string): Promise<void> {
    await this._router.navigate(["/notes", createdNoteId]);
  }
}
