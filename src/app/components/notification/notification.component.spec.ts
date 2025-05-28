import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { MaterialModule } from 'src/app/modules/material/material.module';
import { NotificationComponent } from './notification.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('NotificationComponent', () => {
  let component: NotificationComponent;
  let fixture: ComponentFixture<NotificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NotificationComponent],
      imports: [MaterialModule],
      providers: [{ provide: MAT_SNACK_BAR_DATA, useValue: {} }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show close icon and call dismiss on click when closed', () => {
    spyOn(component.notificationService, 'dismiss').and.callThrough();

    fixture.nativeElement.querySelector('[data-test-id="notification__close-icon"]').click();
    fixture.detectChanges();

    expect(component.notificationService.dismiss).toHaveBeenCalled();
  });

  it('should render with icon, message and title', () => {
    component.notificationData = {
      message: 'test mesage.',
      title: 'Itinerary created',
      type: 'success',
    };

    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__success-icon"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__container"]').classList,
    ).toContain('success');
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__message"]').innerHTML,
    ).toContain(component.notificationData.message);
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__title"]').innerHTML,
    ).toContain(component.notificationData.title);
  });

  it('should render with warn icon and style', () => {
    component.notificationData = {
      message: 'Some items were not deleted when trying to delete.',
      title: 'Some Issues',
      type: 'warn',
    };

    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__warn-icon"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__container"]').classList,
    ).toContain('warn');
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__message"]').innerHTML,
    ).toContain(component.notificationData.message);
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__title"]').innerHTML,
    ).toContain(component.notificationData.title);
  });

  it('should render with alert icon and style', () => {
    component.notificationData = {
      message: 'There was an error trying to delete',
      title: 'Error deleting',
      type: 'alert',
    };

    fixture.detectChanges();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__alert-icon"]'),
    ).toBeTruthy();
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__container"]').classList,
    ).toContain('alert');
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__message"]').innerHTML,
    ).toContain(component.notificationData.message);
    expect(
      fixture.nativeElement.querySelector('[data-test-id="notification__title"]').innerHTML,
    ).toContain(component.notificationData.title);
  });
});
