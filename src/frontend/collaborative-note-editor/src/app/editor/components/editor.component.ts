import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
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
import { WebsocketProvider } from 'y-websocket';
import { WebrtcProvider } from 'y-webrtc'
import { ControlValueAccessor } from '@ngneat/reactive-forms';
import { ThisReceiver } from '@angular/compiler';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: EditorComponent, multi: true }
  ]
})
export class EditorComponent extends ControlValueAccessor<string> implements OnInit {
  
  private _firstRun: boolean = false;
  private _value: string | null = null;
  private _setEditorValue?: (value: any) => void;
  private _yJsDoc?: Y.Doc;

  @ViewChild('editorRef') public editorRef!: ElementRef;

  @Input() public collaborationRoomName?: string;

  constructor() {
    super();
  }

  public get value(): string | null {
    return this._value;
  }
  public set value(v: string | null) {
    this._value = v;

    // Prevents firing onChange-event, after initializing Milkdown-Editor-content
    if (this._firstRun)
      this.onChange!(v);
  }

  public get collaboratorCount(): number {
    return this._yJsDoc?.store.clients.size ?? 0;
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit() {
    await this.initEditor();
  }

  writeValue(value: string): void {
    this.value = value;

    if (this.collaboratorCount < 2)
      setTimeout(() => this._setEditorValue?.(value), 0);
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
    
    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
          .bindDoc(this._yJsDoc!)
          .setAwareness(connectionProvider.awareness)
          .connect();
    });

    this._yJsDoc.on("update", (update, origin) => {
      console.debug(update);
      console.debug(origin);
    });
  }
}
