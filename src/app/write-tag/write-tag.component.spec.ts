import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WriteTagComponent } from './write-tag.component';

describe('WriteTagComponent', () => {
  let component: WriteTagComponent;
  let fixture: ComponentFixture<WriteTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WriteTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WriteTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
