import { Component, ElementRef, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import Webamp from 'webamp';
import { WinampService } from '../../services/winamp/winamp.service';

@Component({
  selector: 'winamp',
  standalone: true,
  imports: [],
  templateUrl: './winamp.component.html',
  styleUrl: './winamp.component.css',
})
export class WinampComponent {
  @ViewChild('winamp') winamp!: ElementRef<HTMLElement>;
  title = 'component';

  /**
   * The mount node's floor: the larger of the desktop and the player's group,
   * published by the player from the engine's own store. The desktop's
   * supported minimum is therefore the Menu bar plus the group — ≈399 px tall
   * at the default stacked layout, as measured. Below it the group cannot
   * fit, and the player is correctly clamped and partly hidden rather than
   * recovered, because the geometry is unsatisfiable at that size.
   */
  readonly group = toSignal(this.webAmpService.groupSize$, {
    initialValue: null,
  });

  constructor(private webAmpService: WinampService) {}

  ngAfterViewInit() {
    this.webAmpService.setWinampRootElement(this.winamp.nativeElement);
    this.webAmpService.renderWinamp();
  }

  ngOnInit() {
    if (!Webamp.browserIsSupported()) {
      alert('Oh no! Webamp does not work in this browser!');
      throw new Error("What's the point of anything?");
    }
  }
}
