import { Component, Inject } from '@angular/core';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';
import { NotificationService } from 'src/app/core/services/notification.service';

export interface NotificationData {
  title: string;
  message: string;
  type: NotificationType;
}

export type NotificationType = 'success' | 'warn' | 'alert' | 'info' | '';

@Component({
  selector: 'app-notification',
  styleUrls: ['./notification.component.scss'],
  templateUrl: './notification.component.html',
  standalone: false,
})
export class NotificationComponent {
  constructor(
    public notificationService: NotificationService,
    @Inject(MAT_SNACK_BAR_DATA) public notificationData: NotificationData,
  ) {}

  dismiss() {
    this.notificationService.dismiss();
  }
}
