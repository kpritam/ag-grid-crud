import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { EmployeeData } from '../employee/Employee.component';
import { MatIconModule } from '@angular/material/icon';

type ActionCellRendererParams = ICellRendererParams<EmployeeData> & {
  deleteFn: (id: number) => void;
  undoFn: (id: number) => void;
};

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
    this.isDeleted = this.params.data?.isDeleted ?? false;
  }

  refresh(params: ICellRendererParams<any, any, any>): boolean {
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
    console.log(isDeleted ? 'Delete Row' : 'Undo Delete');
    const data = this.params?.data;
    if (data) {
      if (isDeleted) {
        this.params?.deleteFn(data.EmployeeID);
      } else {
        this.params?.undoFn(data.EmployeeID);
      }
      this.isDeleted = isDeleted;
    }
  }
}
