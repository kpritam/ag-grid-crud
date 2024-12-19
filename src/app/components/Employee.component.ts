import { Component, computed, HostListener, OnInit, signal } from '@angular/core';

import {
    GridReadyEvent,
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
    IServerSideDatasource,
    IServerSideGetRowsParams,
    GridOptions,
} from "ag-grid-community";

import {
    ServerSideRowModelModule,
    ServerSideRowModelApiModule
} from "ag-grid-enterprise";

import { AgGridAngular } from "ag-grid-angular";
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DeleteCell } from './DeleteCell.component';

ModuleRegistry.registerModules([
    RowSelectionModule,
    RowApiModule,
    ValidationModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    RenderApiModule,
    RowStyleModule,
    PaginationModule,
    PinnedRowModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule
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
    pinnedNewRows = signal<EmployeeData[]>([]);
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
    deletedRows = signal<EmployeeData[]>([]);
    pinnedRows = computed(() => [...this.pinnedNewRows(), ...this.deletedRows()]);

    gridOptions!: GridOptions<EmployeeData>;

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
            flex: 1,
            cellRenderer: DeleteCell,
            cellRendererParams: {
                deleteFn: (empId: number) => this.deleteRow(empId),
                undoFn: (empId: number) => this.undoDeleteRow(empId),
            },
        }
    ];

    constructor() {
        this.gridOptions = {
            rowModelType: 'serverSide',
            columnDefs: this.columnDefs,
            serverSideDatasource: this.serverSideDatasource(),
            getRowId: this.getRowId,
            getRowStyle: this.getRowStyle,
            onGridReady: this.onGridReady.bind(this),
            pinnedTopRowData: this.pinnedRows(),
        }
    }

    addRow() {
        this.pinnedNewRows.set([{ ...EMPTY_EMPLOYEE }, ...this.pinnedNewRows()]);
        setTimeout(() => {
            this.api?.startEditingCell({
                rowIndex: 0,
                colKey: 'EmployeeID',
                rowPinned: 'top'
            });
        }, 150);
    }

    @HostListener('window:keydown', ['$event'])
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter' && this.isEditMode()) {
            const pinned = this.pinnedNewRows().map(row => ({ ...row, isNew: true }));
            this.pinnedNewRows.set(pinned);
            this.addRow()
        }
    }

    cancelEdit() {
        this.pinnedNewRows.set([]);
        this.deletedRows.set([]);
        this.api?.refreshServerSide();
        const existingData = this.rowData().filter(row => !row.isNew).map(row => ({ ...row, isDeleted: false }))
        this.rowData.set(existingData);
    }

    deleteRow(employeeId: number) {
        // Stage delete if row is from existing data
        const row = this.rowData().find(row => row.EmployeeID === employeeId)
        if (row) {
            this.api?.getRowNode(employeeId.toString())?.setData({ ...row, isDeleted: true },);
        }


        // Remove row from pinned rows completely if it's a new row
        this.pinnedNewRows.set(this.pinnedNewRows().filter(row => row.EmployeeID !== employeeId));
    }

    undoDeleteRow(employeeId: number) {
        const row = this.rowData().find(row => row.EmployeeID === employeeId)
        if (row) {
            this.api?.getRowNode(employeeId.toString())?.setData({ ...row, isDeleted: false },);
        }
    }

    saveChanges() {
        const newRows = this.rowData().filter(row => row.isNew)
        console.info("New Rows", newRows);
        const deletedRows = this.rowData().filter(row => row.isDeleted)
        console.info("Deleted Rows", deletedRows);

        this.pinnedNewRows.set([]);
        this.rowData.set(this.rowData().flatMap(row => {
            return row.isDeleted ? [] : { ...row, isNew: false, isDeleted: false }
        }));
    }

    isEditMode() {
        const isDeleted = this.api?.getRenderedNodes()
            .find(node => node.data?.isNew || node.data?.isDeleted)

        return this.pinnedNewRows().length > 0 || isDeleted;
    }

    serverSideDatasource(): IServerSideDatasource {
        return {
            getRows: (params: IServerSideGetRowsParams<EmployeeData>) => {
                console.log('Requesting rows from server', params.request);
                const data = this.rowData();
                params.success({ rowData: data });
            }
        };
    }

}