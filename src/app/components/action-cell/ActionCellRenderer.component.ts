import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-action-cell-renderer',
  imports: [MatIconModule],
  templateUrl: './ActionCellRenderer.component.html',
  styleUrls: ['./ActionCellRenderer.component.scss'],
})
export class ActionCellRenderer implements ICellRendererAngularComp {
  params?: ICellRendererParams;
  isDeleted: boolean = false;

  agInit(params: ICellRendererParams): void {
    this.params = params;
    this.isDeleted = this.params.data?.isDeleted ?? false;
  }

  refresh(params: ICellRendererParams): boolean {
    this.isDeleted = params.data?.isDeleted ?? false;
    return true;
  }

  deleteRow(): void {
    this.toggleDelete(true);
  }

  undoDelete(): void {
    this.toggleDelete(false);
  }

  private toggleDelete(isDeleted: boolean): void {
    const data = this.params?.data;
    if (data) {

      if (isDeleted) {
        this.params?.node.setData({ ...data, isDeleted: true });
      } else {
        this.params?.node.setData({ ...data, isDeleted: false });
      }

      this.isDeleted = isDeleted;
    }
  }
}
