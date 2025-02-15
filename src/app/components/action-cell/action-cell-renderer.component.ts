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
  undoEditCallback: (context: MasterGridContext, node: IRowNode<TData>) => void;
  rowEditingStarted: (context: MasterGridContext, data: TData) => void;
  rowEditingStopped: (context: MasterGridContext, data: TData) => void;
}

@Component({
  selector: 'app-action-cell-renderer',
  imports: [MatIconModule],
  templateUrl: './action-cell-renderer.component.html',
  styleUrls: ['./action-cell-renderer.component.scss'],
})
export class ActionCellRenderer<TData extends { status?: RowStatus }>
  implements ICellRendererAngularComp
{
  params?: ActionCellRendererParams<TData>;

  status?: RowStatus;

  agInit(params: ActionCellRendererParams<TData>): void {
    this.params = params;
    this.status = params.data?.status;
  }

  refresh(params: ActionCellRendererParams<TData>): boolean {
    this.params = params;
    this.status = params.data?.status;
    return true;
  }

  deleteRow(): void {
    const data = this.params?.data;
    if (data) {
      this.status = 'Deleted';

      data.status === 'Server'
        ? this.params?.node.setData({ ...data, status: 'Deleted' })
        : this.params?.api.applyServerSideTransaction({ remove: [data] });

      this.params?.deleteCallback(this.params?.context, data);
    }
  }

  undoChanges(): void {
    this.status = 'Server';
    const node = this.params?.node;

    if (node) {
      this.params?.undoEditCallback(this.params.context, node);
    }
  }

  editRow(): void {
    const data = this.params?.data;
    this.status = 'BeingEdited';

    if (data) {
      const rowBeingEdited = { ...data, status: 'BeingEdited' };
      this.params?.rowEditingStarted(this.params.context, rowBeingEdited);
      this.params?.node.setData(rowBeingEdited);
    }
  }

  saveChanges(): void {
    const data = this.params?.data;
    if (data) {
      this.status = 'Edited';
      const editedRow = { ...data, status: 'Edited' };

      this.params?.node.setData(editedRow);
      this.params?.rowEditingStopped(this.params.context, editedRow);
    }
  }
}
