import { Component, HostListener, signal } from '@angular/core';

import {
    ClientSideRowModelApiModule,
    GridReadyEvent,
    ClientSideRowModelModule,
    ColDef,
    GridApi,
    ModuleRegistry,
    RowApiModule,
    RowSelectionModule,
    CustomEditorModule,
    NumberEditorModule,
    TextEditorModule,
    ValidationModule,
    GetRowIdParams,
    RenderApiModule,
    RowStyleModule,
    PaginationModule,
    PinnedRowModule,
    RowClassParams,
    ICellRendererParams,
} from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DeleteCell } from './DeleteCell.component';

ModuleRegistry.registerModules([
    ClientSideRowModelApiModule,
    RowSelectionModule,
    RowApiModule,
    ClientSideRowModelModule,
    ValidationModule,
    ClientSideRowModelModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    RenderApiModule,
    RowStyleModule,
    PaginationModule,
    PinnedRowModule,
]);

export interface EmployeeData {
    EmployeeID: number;
    FirstName: string;
    LastName: string;
    Department: string;
    Salary: number;
    isNew?: boolean;
    isDeleted?: boolean;
}

const EMPTY_EMPLOYEE: EmployeeData = {
    EmployeeID: 0,
    FirstName: "",
    LastName: "",
    Department: "",
    Salary: 0,
    isNew: false,
    isDeleted: false
};

@Component({
    selector: 'app-employee',
    imports: [AgGridAngular, MatButtonModule, MatIconModule, CommonModule],
    templateUrl: './Employee.component.html',
    styleUrls: ['./Employee.component.scss']
})
export class EmployeeComponent {
    api?: GridApi<EmployeeData>;
    pinnedRows = signal<EmployeeData[]>([]);
    rowData = signal<EmployeeData[]>([
        {
            EmployeeID: 1,
            FirstName: "John",
            LastName: "Doe",
            Department: "Engineering",
            Salary: 60000,
            isNew: false,
        },
        {
            EmployeeID: 2,
            FirstName: "Jane",
            LastName: "Smith",
            Department: "Marketing",
            Salary: 55000,
            isNew: false
        }
    ]);

    getRowStyle(params: RowClassParams<EmployeeData>) {
        if (params.data?.isNew === true) return { background: '#d4edda' };
        if (params.data?.isDeleted === true) return { background: '#f8d7da' };
        return { background: 'white' };
    };

    getRowId(data: GetRowIdParams<EmployeeData>) { return data.data.EmployeeID.toString() }

    onGridReady(event: GridReadyEvent) {
        this.api = event.api;
    }

    columnDefs: ColDef[] = [
        { field: 'EmployeeID', editable: true },
        { field: 'FirstName', editable: true },
        { field: 'LastName', editable: true },
        { field: 'Department', editable: true },
        { field: 'Salary', editable: true },
        {
            field: 'Actions',
            cellRenderer: DeleteCell,
            cellRendererParams: {
                componentParent: this
            },
        }
    ];

    context: { componentParent: EmployeeComponent };
    constructor() {
        this.context = {
            componentParent: this
        }
    }

    addRow() {
        this.pinnedRows.set([{ ...EMPTY_EMPLOYEE }]);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.isEditMode()) {
            const pinned = this.pinnedRows().map(row => ({ ...row, isNew: true }));
            this.rowData.set([...pinned, ...this.rowData()]);
            this.addRow();
        }
    }

    cancelEdit() {
        this.pinnedRows.set([]);
        this.rowData.set(this.rowData().filter(row => !row.isNew));
        this.rowData.set(this.rowData().map(row => ({ ...row, isDeleted: false })));
    }

    deleteRow(employeeId: number) {
        this.rowData.set(this.rowData().map(row => {
            if (row.EmployeeID === employeeId) {
                return { ...row, isDeleted: true };
            }
            return row;
        }));

    }

    saveChanges() {
        const newRows = this.rowData().filter(row => row.isNew)
        console.info("New Rows", newRows);
        const deletedRows = this.rowData().filter(row => row.isDeleted)
        console.info("Deleted Rows", deletedRows);

        this.pinnedRows.set([]);
        this.rowData.set(this.rowData().flatMap(row => {
            return row.isDeleted ? [] : { ...row, isNew: false, isDeleted: false }
        }));
    }

    isEditMode() {
        return this.pinnedRows().length > 0 || this.rowData().some(row => row.isDeleted || row.isNew);
    }
}