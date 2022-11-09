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
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { encode as base64Encode, decode as base64Decode } from 'base64-arraybuffer';

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

  constructor(private readonly _http: HttpClient) {
    super();
  }

  public get value(): string | null {
    return this._value;
  }
  public set value(v: string | null) {
    this._value = v;

    // Prevents firing onChange-event, after initializing Milkdown-Editor-content
    if (this._firstRun) {
      this._firstRun = false;
      this.onChange!(v);
    }
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

    await this.initializeCollaboration(editor);
    this._setEditorValue = (value: any) => editor.action(replaceAll(value));
  }

  private async initializeCollaboration(editor: Editor): Promise<void> {
    if (!this.collaborationRoomName) {
      console.warn("collaborationRommName not specified. Collaboration disabled.");
      return;
    }

    this._yJsDoc = new Y.Doc();
    const uuid = "a141d9f0-bcd3-4417-b8d9-8b9dea611770";
    const result = await (await firstValueFrom(this._http.get(`http://localhost:5193/negotiate/${uuid}`, { responseType: "text" }))).split("?access_token=");
    const host = result[0];
    const accessToken = result[1];

    const connectionProvider = new WebsocketProvider(host, "", this._yJsDoc, {
      params: {
        access_token: accessToken
      },
      WebSocketPolyfill: WebSocketAdapter //new WebSocket(host, "json.webpubsub.azure.v1") as any,
    });
    // const connectionProvider = new WebrtcProvider(this.collaborationRoomName, this._yJsDoc!); // eventually set password here
    // connectionProvider.ws?.addEventListener("open", (ev) => {
    //   connectionProvider.ws?.send(JSON.stringify({
    //     test: true
    //   }));
    // });
    // connectionProvider.ws?.addEventListener("message", (ev) => {
    //   console.debug(ev);
    // });
    
    editor.action((ctx) => {
        const collabService = ctx.get(collabServiceCtx);

        collabService
          .bindDoc(this._yJsDoc!)
          .setAwareness(connectionProvider.awareness)
          .connect();
    });

    this._yJsDoc.on("update", (update, origin) => {
      // console.debug(update);
      // console.debug(origin);
    });
  }
}

class WebSocketAdapter extends WebSocket {

  private _ackId: number = 0;

  // override onmessage: ((this: WebSocket, ev: MessageEvent<any>) => any) | null = null;

  override addEventListener(type: any, listener: any, options?: any): void {
    let newListener = listener;

    if (type === "message") {
      newListener = function (ev: any) {
        console.debug(ev);
        return listener(ev);

        // const decoded = base64Decode(ev.data);
        // console.debug(decoded);

        if (!ev.data.data)
          return;

        const decoded = base64Decode(ev.data.data);
        console.debug(decoded);
        return listener(decoded);
      }
    }

    super.addEventListener(type as any, newListener as any, options as any);
  }

  constructor(url: string | URL, protocols?: string | string[] | undefined) {
    super(url, protocols);
    // super(url, "json.webpubsub.azure.v1");
    // super.addEventListener("open", this.joinGroup);
  }

  public new(url: string | URL, protocols?: string | string[] | undefined): WebSocket {
    // return new WebSocketAdapter(url, "json.webpubsub.azure.v1");
    return new WebSocketAdapter(url, protocols);
  }

  override send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
    console.debug(data);
    super.send(data);
    return;
    
    const json = JSON.stringify({
      type: "sendToGroup",
      group: "a141d9f0-bcd3-4417-b8d9-8b9dea611770",
      dataType: "binary",
      data: base64Encode(data as any)
    });
    // console.debug(json);
    super.send(json);
  }

  private joinGroup(): void {
    super.send(JSON.stringify({
      type: "joinGroup",
      group: "a141d9f0-bcd3-4417-b8d9-8b9dea611770",
      ackId: ++this._ackId
    }));
  }
}