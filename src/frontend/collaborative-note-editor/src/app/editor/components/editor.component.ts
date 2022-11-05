import { Component, OnInit } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
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

  constructor() {
    super();
  }

  public get value(): string | null {
    return this._value;
  }
  public set value(v: string | null) {
    this._value = v;
    this.onChange!(v);
  }

  ngOnInit(): void {
  }

  writeValue(value: string): void {
    this.value = value;
  }
}
