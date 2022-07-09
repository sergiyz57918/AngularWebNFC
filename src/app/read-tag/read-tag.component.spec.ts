import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReadTagComponent } from './read-tag.component';

describe('ReadTagComponent', () => {
  let component: ReadTagComponent;
  let fixture: ComponentFixture<ReadTagComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReadTagComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReadTagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
