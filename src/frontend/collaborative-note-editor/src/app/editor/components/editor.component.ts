import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { defaultValueCtx, Editor, rootCtx } from '@milkdown/core';
import { listener, listenerCtx } from '@milkdown/plugin-listener';
import { replaceAll } from '@milkdown/utils';
import { commonmark } from '@milkdown/preset-commonmark';
import { gfm } from '@milkdown/preset-gfm';
import { getNord } from '@milkdown/theme-nord';
import { menu } from '@milkdown/plugin-menu';
import { ControlValueAccessor } from '@ngneat/reactive-forms';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.less'],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: EditorComponent, multi: true }
  ]
})
export class EditorComponent extends ControlValueAccessor<string> implements OnInit {
  
  private _value: string | null = null;

  private _setEditorValue?: (value: any) => void;

  @ViewChild('editorRef') public editorRef!: ElementRef;
  public defaultValue = '# Enter Markdown';

  constructor() {
    super();
  }

  public get value(): string | null {
    return this._value;
  }
  public set value(v: string | null) {
    this._value = v;
    this.onChange!(v);
    console.debug(v);
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit() {
    const editor = await Editor.make()
      .config((ctx) => {
          ctx.set(rootCtx, this.editorRef!.nativeElement);
          ctx.set(defaultValueCtx, this.defaultValue);
          ctx.get(listenerCtx).markdownUpdated((ctx, markdown, prevMarkdown) => {
            this.value = markdown;
        });
      })
      .use(listener)
      .use(commonmark)
      .use(gfm)
      .use(getNord(false))  // .use(nord) equals .use(getNord(true))
      .use(menu)
      .create();

    this._setEditorValue = (value: any) => editor.action(replaceAll(value));
  }

  writeValue(value: string): void {
    this.value = value;
    setTimeout(() => this._setEditorValue?.(value), 0);
  }
}
