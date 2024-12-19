import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { EmployeeComponent, EmployeeData } from './Employee.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-delete-cell',
    imports: [MatIconModule],
    templateUrl: './DeleteCell.component.html',
    styleUrls: ['./DeleteCell.component.scss']
})
export class DeleteCell implements ICellRendererAngularComp {
    params?: ICellRendererParams<EmployeeData>;
    componentParent?: EmployeeComponent;
    isDeleted: boolean = false;

    agInit(params: ICellRendererParams<EmployeeData, EmployeeComponent>): void {
        this.params = params;
        this.componentParent = this.params.context.componentParent;
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
        console.log(isDeleted ? "Delete Row" : "Undo Delete");
        const data = this.params?.data;
        if (data) {
            if (isDeleted) {
                this.componentParent?.deleteRow(data.EmployeeID);
            } else {
                this.componentParent?.undoDeleteRow(data.EmployeeID);
            }
            this.isDeleted = isDeleted;
        }
    }
}
