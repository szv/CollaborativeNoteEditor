import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import * as Y from 'yjs';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { replaceAll } from '@milkdown/utils';
import { commonmark, doc } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { getNord } from '@milkdown/theme-nord';
import { menu } from '@milkdown/plugin-menu';
import { collaborative, collabServiceCtx } from '@milkdown/plugin-collaborative';
import { WebrtcProvider } from 'y-webrtc'
import { ControlValueAccessor } from '@ngneat/reactive-forms';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: EditorComponent, multi: true }
  ]
})
export class EditorComponent extends ControlValueAccessor<string> implements OnInit, OnDestroy {
  
  private _firstRun: boolean = true;
  private _value: string | null = null;
  private _setEditorValue?: (value: any) => void;
  private _yJsDoc?: Y.Doc;
  private _requestedSettingEditorValue: boolean = false;
  private _destroyConnectionProvider?: () => void;

  @ViewChild('editorRef') public editorRef!: ElementRef;

  @Input() public collaborationRoomName?: string;

  constructor() {
    super();

    // A hack to prevent overriding peer-data with db-loaded data
    const interval = setInterval(() => {
      if (!this._requestedSettingEditorValue || !this._setEditorValue)
        return;

      this._setEditorValue(this.value);
      clearInterval(interval);
    }, 50);
  }

  public get value(): string | null {
    return this._value;
  }
  public set value(v: string | null) {
    this._value = v;
    this.onChange!(v);
  }

  public get collaboratorCount(): number {
    return this._yJsDoc?.store.clients.size ?? -1;
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this._destroyConnectionProvider?.();
  }

  async ngAfterViewInit() {
    await this.initEditor();
  }

  writeValue(value: string): void {
    this.value = value;

    if (this.collaboratorCount !== -1 && this.collaboratorCount < 2) {
      setTimeout(() => this._setEditorValue?.(value), 0);
    } else if (this.collaboratorCount === -1) {
      this._requestedSettingEditorValue = true;
    }
  }

  private async initEditor(): Promise<void> {
    const editor = await Editor.make()
      .config((ctx) => {
          ctx.set(rootCtx, this.editorRef!.nativeElement);
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
            this.value = markdown;
        });
      })
      .use(listener)
      .use(commonmark)
      .use(gfm)
      .use(getNord(false))  // .use(nord) equals .use(getNord(true))
      .use(menu)
      .use(collaborative)
      .create();

    this.initializeCollaboration(editor);
    this._setEditorValue = (value: any) => editor.action(replaceAll(value));
  }

  private initializeCollaboration(editor: Editor): void {
    if (!this.collaborationRoomName) {
      console.warn("collaborationRommName not specified. Collaboration disabled.");
      return;
    }

    this._yJsDoc = new Y.Doc();
    // const connectionProvider = new WebsocketProvider('<YOUR_WS_HOST>', 'milkdown', this._yJsDoc);
    const connectionProvider = new WebrtcProvider(this.collaborationRoomName, this._yJsDoc!); // eventually set password here
    this._destroyConnectionProvider = connectionProvider.destroy;

    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
          .bindDoc(this._yJsDoc!)
          .setAwareness(connectionProvider.awareness)
          .connect();
    });
  }
}
