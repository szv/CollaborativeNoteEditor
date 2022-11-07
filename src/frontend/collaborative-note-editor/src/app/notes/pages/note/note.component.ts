import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  public readonly form: FormGroup;

  constructor(
    private readonly _activatedRoute: ActivatedRoute,
    private readonly _notesService: NotesServiceService,
    private readonly _router: Router,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      title: [null, [Validators.required, Validators.maxLength(200)]],
      username: [null, [Validators.maxLength(200)]],
      content: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this._activatedRoute.paramMap.subscribe(params => { 
      const id: string | null = params.get('id');

      if (!id)
        this.back();

      this.id = id;
      this.load();
    });
  }

  public back(): void {
    this._router.navigateByUrl("/notes");
  }

  private async load(): Promise<void> {
    if (!this.id) {
      console.error("No note id");
      return;
    }

    this.loading = true;
    this.note = await firstValueFrom(this._notesService.notesIdGet(this.id))
      .finally(() => this.loading = false);
    this.form.patchValue(this.note);
  }

  public async save(): Promise<void> {
    this.markInvalidControls();

    if (this.form.invalid) {
      console.error("Form invalid. Cannot save note.");
      return;
    }

    this.saving = true;
    const updateData: UpdateNoteRequestDto = {
      title: this.form.value.title,
      content: this.form.value.content,
      username: this.form.value.username
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

  public hasError(formControlName: string): boolean {
    const control = this.form.get(formControlName);

    if (!control)
      return false;

    return control.invalid && control.dirty
  }

  private showSavedTooltip(): void {
    this.savedTooltipVisible = true;
    setTimeout(() => this.savedTooltipVisible = false, 3000);
  }

  private markInvalidControls(): void {
    Object.values(this.form.controls).forEach(control => {
      if (control.invalid) {
        control.markAsDirty();
        control.updateValueAndValidity({ onlySelf: true });
      }
    });
  }
}
