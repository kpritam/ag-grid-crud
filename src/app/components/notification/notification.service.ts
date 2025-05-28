import { Injectable } from '@angular/core';
import {
  MatSnackBar,
  MatSnackBarConfig,
  MatSnackBarHorizontalPosition,
} from '@angular/material/snack-bar';
import {
  NotificationComponent,
  NotificationData,
  NotificationType,
} from './notification.component';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly customPanelClass = 'app-snackbar-panel-class';

  constructor(public snackBar: MatSnackBar) {}

  public showErrorNotification(title: string, message: string) {
    const formattedMessage = message.includes('\n') ? message.replace(/\n/g, '<br>') : message;
    this.showNotification(title, formattedMessage, 'alert', 100000);
  }

  public showGenericErrorNotification() {
    this.showErrorNotification('Error', 'An unexpected error occurred. Please try again later.');
  }

  public showNotification(
    title: string,
    message: string,
    type: NotificationType,
    timeout = 6000,
    position = 'left',
  ) {
    const data: NotificationData = {
      message,
      type,
      title,
    };
    const config = new MatSnackBarConfig();
    config.horizontalPosition = position as MatSnackBarHorizontalPosition;
    config.duration = timeout;
    config.data = data;
    config.panelClass = [this.customPanelClass, `snackbar-style-${type}`];

    this.snackBar.openFromComponent(NotificationComponent, config);
  }

  public showSuccessNotification(title: string, message: string) {
    this.showNotification(title, message, 'success');
  }

  public dismiss() {
    this.snackBar.dismiss();
  }
}
