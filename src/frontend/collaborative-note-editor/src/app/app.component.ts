import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CreateNoteRequestDto, NotesServiceService } from 'src/libs/api-client';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.less']
})
export class AppComponent {
  public isCollapsed: boolean = false;
  public creatingNote: boolean = false;

  constructor(
    private readonly _notesService: NotesServiceService,
    private readonly _router: Router,
  ) {
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
