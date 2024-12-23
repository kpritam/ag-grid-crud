import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
import { EmployeeData, RowStatus } from '../../api/employee';

export interface ActionCellRendererParams<TData extends { status?: RowStatus }>
  extends ICellRendererParams<TData> {
  deleteCallback: (data: TData) => void;
  undoDeleteCallback: (data: TData) => void;
}

@Component({
  selector: 'app-action-cell-renderer',
  imports: [MatIconModule],
  templateUrl: './ActionCellRenderer.component.html',
  styleUrls: ['./ActionCellRenderer.component.scss'],
})
export class ActionCellRenderer<TData extends { status?: RowStatus }>
  implements ICellRendererAngularComp
{
  params?: ActionCellRendererParams<TData>;
  isDeleted: boolean = false;

  agInit(params: ActionCellRendererParams<TData>): void {
    this.params = params;
    this.isDeleted = this.params.data?.status === 'Deleted';
  }

  refresh(params: ActionCellRendererParams<TData>): boolean {
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
