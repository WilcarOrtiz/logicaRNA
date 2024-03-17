import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-message',
  standalone: true,
  imports: [],
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  @Input({ required: true }) info!: any;
  @Input({ required: true }) infoResultado: any;
  constructor() {}
}
