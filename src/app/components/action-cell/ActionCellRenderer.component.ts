import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeData } from '../../api/employee';

export interface ActionCellRendererParams extends ICellRendererParams<EmployeeData> {
  deleteCallback: (data: EmployeeData) => void;
  undoDeleteCallback: (data: EmployeeData) => void;
}

@Component({
  selector: 'app-action-cell-renderer',
  imports: [MatIconModule],
  templateUrl: './ActionCellRenderer.component.html',
  styleUrls: ['./ActionCellRenderer.component.scss'],
})
export class ActionCellRenderer implements ICellRendererAngularComp {
  params?: ActionCellRendererParams;
  isDeleted: boolean = false;

  agInit(params: ActionCellRendererParams): void {
    this.params = params;
    this.isDeleted = this.params.data?.status === 'Deleted';
  }

  refresh(params: ActionCellRendererParams): boolean {
    return true;
  }

  deleteRow(): void {
    const data = this.params?.data;
    if (data) {
      if (data && data.status === 'Server') {
        this.params?.node.setData({ ...data, status: 'Deleted' });
      }

      this.params?.deleteCallback(data);
    }
  }

  undoDelete(): void {
    const data = this.params?.data;
    if (data) {
      this.params?.node.setData({ ...data, status: 'Server' });
      this.params?.deleteCallback(data);
    }
  }

}
