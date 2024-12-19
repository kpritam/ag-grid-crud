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
} from "ag-grid-community";
import { AgGridAngular } from "ag-grid-angular";
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

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
    PinnedRowModule
]);

interface RouteData {
    RouteID: number;
    FromPort: string;
    ToPort: string;
    RouteName: string;
    TotalDistance: number;
    isNew?: boolean;
}

const EMPTY_ROUTE: RouteData = {
    RouteID: 0,
    FromPort: "",
    ToPort: "",
    RouteName: "",
    TotalDistance: 0,
    isNew: false
};

@Component({
    selector: 'app-distance',
    imports: [AgGridAngular, MatButtonModule, CommonModule],
    templateUrl: './Distance.component.html',
    styleUrls: ['./Distance.component.scss']
})
export class DistanceComponent {
    api?: GridApi<RouteData>;
    pinnedRows = signal<RouteData[]>([]);
    rowData = signal<RouteData[]>([
        {
            RouteID: 1,
            FromPort: "A",
            ToPort: "B",
            RouteName: "Direct",
            TotalDistance: 100,
            isNew: false,
        },
        {
            RouteID: 2,
            FromPort: "A",
            ToPort: "C",
            RouteName: "Direct",
            TotalDistance: 100,
            isNew: false
        }
    ]);

    getRowStyle(params: RowClassParams<RouteData>) {
        if (params.data?.isNew === true) return { background: '#d4edda' };
        return { background: 'white' };
    };

    getRowId(data: GetRowIdParams<RouteData>) { return data.data.RouteID.toString() }

    onGridReady(event: GridReadyEvent) {
        this.api = event.api;
    }

    columnDefs: ColDef[] = [
        { field: 'RouteID', editable: true },
        { field: 'FromPort', editable: true },
        { field: 'ToPort', editable: true },
        { field: 'RouteName', editable: true },
        { field: 'TotalDistance', editable: true },
        { field: 'Actions', cellRenderer: 'deleteCellRenderer' },
        { field: "isAdded", hide: true }
    ];

    addRow() {
        this.pinnedRows.set([{ ...EMPTY_ROUTE }]);
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
    }

    deleteRow(rowId: number) {
        const rowNode = this.api?.getRowNode(rowId.toString());
        if (rowNode && rowNode.data) {
            this.api?.applyTransaction({
                remove: [rowNode.data]
            });
        }
    }

    saveChanges() {
        const newRows = this.rowData().filter(row => row.isNew)
        console.info("New Rows", newRows);

        this.pinnedRows.set([]);
        this.rowData.set(this.rowData().map(row => ({ ...row, isNew: false })));
    }

    isEditMode() {
        return this.pinnedRows().length > 0;
    }
}