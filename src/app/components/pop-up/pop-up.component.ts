import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Options } from '../../services/pop-up/pop-up.options';
import { PopUpService } from '../../services/pop-up/pop-up.service';

@Component({
  selector: 'app-pop-up',
  standalone: true,
  imports: [],
  templateUrl: './pop-up.component.html',
  styleUrl: './pop-up.component.css'
})

export class PopUpComponent {
  @ViewChild('popup') popup!: ElementRef<HTMLDivElement>;
  options!: Options | undefined;
  msg!: string;
  
  constructor(
    private popUpService: PopUpService,
    private element: ElementRef
  ) {}

  ngAfterViewInit() {
    this.options = this.popUpService.options;
    this.addOptions();
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    // closing modal on escape     
    this.popUpService.close();
  }

  onClose() {
    // closing modal when clicking on the overlay
    this.popUpService.close();
  }

  addOptions() {
    this.msg = this.options?.msg || '';
  }

  close(){
    this.popUpService.options = undefined;
    this.element.nativeElement.remove();
  }
}
