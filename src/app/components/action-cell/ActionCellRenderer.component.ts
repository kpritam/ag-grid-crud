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
  saveChangesCallback: (context: MasterGridContext, data: TData) => void;
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

  status?: RowStatus;

  agInit(params: ActionCellRendererParams<TData>): void {
    this.params = params;
    this.status = this.params.data?.status;
  }

  refresh(params: ActionCellRendererParams<TData>): boolean {
    return true;
  }

  deleteRow(): void {
    const data = this.params?.data;
    if (data) {
      this.status = 'Deleted';

      if (data.status === 'Server') {
        this.params?.node.setData({ ...data, status: 'Deleted' });
      }
      this.params?.deleteCallback(this.params?.context, data);
    }
  }

  undoChanges(): void {
    const data = this.params?.data;
    if (data) {
      this.status = 'Server';

      this.params?.node.setData({ ...data, status: 'Server' });
      this.params?.undoDeleteCallback(this.params.context, data);
    }
  }

  editRow(): void {
    console.log('Edit row');
    const data = this.params?.data;
    this.status = 'BeingEdited';

    if (data) {
      const beingEditedRow = { ...data, status: 'BeingEdited' };
      this.params?.node.setData(beingEditedRow);
    }
  }

  undoEdit(): void {
    console.log('Undo Edit row');
    const data = this.params?.data;
    this.status = 'Server';

    if (data) {
      const serverRow = { ...data, status: 'Server' };
      this.params?.node.setData(serverRow);
    }
  }

  saveChanges(): void {
    const data = this.params?.data;
    if (data) {
      this.status = 'Edited';
      const editedRow = { ...data, status: 'Edited' };

      this.params?.node.setData(editedRow);
      this.params?.saveChangesCallback(this.params.context, editedRow);
    }
  }
}
