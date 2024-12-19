import { Component } from '@angular/core';

import type { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { EmployeeComponent, EmployeeData } from './Employee.component';

@Component({
    selector: 'app-mission-result-renderer',
    standalone: true,
    template: `
        <button mat-icon-button color="warn" (click)="deleteRow()">Delete</button>
    `
})
export class DeleteCell implements ICellRendererAngularComp {
    params?: ICellRendererParams<EmployeeData>;
    componentParent?: EmployeeComponent;

    // Init Cell Value
    public value!: string;
    agInit(params: ICellRendererParams<EmployeeData, EmployeeComponent>): void {
        this.params = params;
        this.componentParent = this.params.context.componentParent;
    }

    refresh(params: ICellRendererParams<any, any, any>): boolean {
        return false;
    }

    deleteRow(): void {
        console.log("Delete Row");
        const data = this.params?.data
        if (data) {
            this.componentParent?.deleteRow(data.EmployeeID);
        }

    }
}
