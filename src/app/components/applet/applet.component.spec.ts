import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppletComponent } from './applet.component';

describe('AppletComponent', () => {
  let component: AppletComponent;
  let fixture: ComponentFixture<AppletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppletComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AppletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
