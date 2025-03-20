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
  @ViewChild('popUp') popUp!: ElementRef<HTMLDivElement>;
  options!: Options | undefined;
  msg!: string;
  callback!: Function;
  
  constructor(
    private popUpService: PopUpService,
    private element: ElementRef
  ) {}

  ngAfterContentInit() {
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
    this.callback = this.options?.callback || (() => {});
  }

  executeCallback() {
    this.callback();
    this.close();
  }

  close(){
    this.popUpService.options = undefined;
    this.element.nativeElement.remove();
  }
}
