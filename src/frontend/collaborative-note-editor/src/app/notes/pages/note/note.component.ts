import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  public savedTooltipVisible: boolean = false;

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _notesService: NotesServiceService,
    private readonly _router: Router
  ) { }

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe(params => { 
      this.id = params.get('id');
      this.load();
    });
  }

  public back(): void {
    this._router.navigateByUrl("/notes");
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
      .then(() => this.showSavedTooltip())
      .finally(() => this.saving = false);
  }

  public async delete(): Promise<void> {
    this.deleting = true;
    await firstValueFrom(this._notesService.notesIdDelete(this.id!))
      .then(() => this.back())
      .finally(() => this.deleting = false);
  }

  private showSavedTooltip(): void {
    this.savedTooltipVisible = true;
    setTimeout(() => this.savedTooltipVisible = false, 3000);
  }
}
