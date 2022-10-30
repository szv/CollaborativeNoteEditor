import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.less']
})
export class NotesComponent implements OnInit {

  public loading: boolean = false;
  public notes: any[] = [0, 1, 2, 3, 4, 5, 6, 7];

  constructor() { }

  ngOnInit(): void {
  }

  public deleteNote(note: any): void {

  }
}
