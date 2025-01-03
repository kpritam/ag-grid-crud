import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams, IRowNode } from 'ag-grid-community';
import { MatIconModule } from '@angular/material/icon';
import { RowStatus } from '../../api/employee';

export type MasterGridContext = {
  masterGrid: { node: IRowNode };
};

export interface ActionCellRendererParams<TData extends { status?: RowStatus }>
  extends ICellRendererParams<TData> {
  deleteCallback: (context: MasterGridContext, data: TData) => void;
  undoDeleteCallback: (context: MasterGridContext, data: TData) => void;
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
      if (data.status === 'Server') {
        this.params?.node.setData({ ...data, status: 'Deleted' });
      }
      this.params?.deleteCallback(this.params?.context, data);
    }
  }

  undoDelete(): void {
    const data = this.params?.data;
    if (data) {
      this.params?.node.setData({ ...data, status: 'Server' });
      this.params?.undoDeleteCallback(this.params.context, data);
    }
  }
}
