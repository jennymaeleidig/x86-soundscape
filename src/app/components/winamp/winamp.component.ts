import { Component, ElementRef, ViewChild } from '@angular/core';
import Songs from '../../../assets/audio/songs';
import Webamp from 'webamp';
import { PopUpComponent } from '../pop-up/pop-up.component';
import { PopUpService } from '../../services/pop-up/pop-up.service';

@Component({
    selector: 'winamp',
    standalone: true,
    imports: [],
    templateUrl: './winamp.component.html',
    styleUrl: './winamp.component.css'
})

export class WinampComponent {
    @ViewChild('winamp') winamp!: ElementRef<HTMLElement>
    title = 'component';

    constructor(private popUpService: PopUpService) {}

    ngAfterViewInit() {
        let webamp: Webamp = new Webamp({
            initialTracks: Songs.songs,
            initialSkin: {
                url: "assets/skins/Old_Mac-OS.wsz"
            },
            availableSkins: [
                { url: "assets/skins/Old_Mac-OS.wsz", name: "MacOS" }
            ],
        });

        // Example of adding a confirmation button before Webamp can be closed.
        webamp.onWillClose((cancel) => {
            // if (!window.confirm("Are you sure you want to close Webamp?")) {
            //     cancel();
            // }
            this.openPopUpComponent("Are you sure you want to close Webamp?");
            //TODO: Need to actually handle the callback
            cancel();
        });

        webamp.renderWhenReady(this.winamp.nativeElement)
    }

    ngOnInit() {
        if (!Webamp.browserIsSupported()) {
            alert("Oh no! Webamp does not work in this browser!");
            throw new Error("What's the point of anything?");
        }
    }

    openPopUpComponent(msg: string) {
        this.popUpService.open(PopUpComponent, {msg: msg})
    }

    close() {
        this.popUpService.close();
    }
}