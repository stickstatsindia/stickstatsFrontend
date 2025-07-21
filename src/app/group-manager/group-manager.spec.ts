import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GroupManager } from './group-manager';

describe('GroupManager', () => {
  let component: GroupManager;
  let fixture: ComponentFixture<GroupManager>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupManager]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GroupManager);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
