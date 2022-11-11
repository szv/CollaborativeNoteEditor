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
import { WebsocketProvider } from 'y-websocket';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: EditorComponent, multi: true }
  ]
})
export class EditorComponent extends ControlValueAccessor<string> implements OnInit, OnDestroy {

  private _value: string | null = null;
  private _setEditorValue?: (value: any) => void;
  private _yJsDoc?: Y.Doc;
  private _connectionProvider?: WebsocketProvider;

  @ViewChild('editorRef') public editorRef!: ElementRef;

  @Input() public collaborationId?: string;

  constructor() {
    super();
  }

  private get collaborationRoomName(): string | undefined {
    if (!this.collaborationId)
      return undefined;

    return `collaborative-note-editor-szv-${this.collaborationId}`;
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
    this._connectionProvider?.destroy();
  }

  async ngAfterViewInit() {
    await this.initEditor();
  }

  writeValue(value: string): void {
    this.value = value;
    this._setEditorValue?.(value);
  }

  private async initEditor(): Promise<void> {
    const editor = await Editor.make()
      .config((ctx) => {
          ctx.set(rootCtx, this.editorRef!.nativeElement);
          ctx.set(defaultValueCtx, this.value ?? "");
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
    editor.action((ctx) => {
      if (!this.collaborationRoomName) {
        console.warn("collaborationRommName not specified. Collaboration disabled.");
        return;
      }

      this._yJsDoc = new Y.Doc();
      const collaborationService = ctx.get(collabServiceCtx);
      collaborationService.bindDoc(this._yJsDoc!);

      // const connectionProvider = new WebrtcProvider(this.collaborationRoomName!, this._yJsDoc); // eventually set password here
      const connectionProvider = new WebsocketProvider("wss://demos.yjs.dev", this.collaborationRoomName, this._yJsDoc);
      this._connectionProvider = connectionProvider;
      
      collaborationService.setAwareness(connectionProvider.awareness);
      // connectionProvider.on("synced", async (isSynced: { synced: boolean }) => {  // webrtc
      connectionProvider.on("sync", async (isSynced: boolean) => {   // websocket
        if (!isSynced) return;

        collaborationService
          .applyTemplate(this.value ?? "", (remoteNode, templateNode) => {
            console.debug(remoteNode.content.size);
            console.debug(templateNode.content.size);
            return remoteNode.content.size === 0;
          })
          .connect();
      });
    });
  }
}
