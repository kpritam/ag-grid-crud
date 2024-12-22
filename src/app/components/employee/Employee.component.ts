import { Component, HostListener, signal } from '@angular/core';
import {
  GridReadyEvent,
  ColDef,
  GridApi,
  GetRowIdParams,
  RowClassParams,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  RowModelType,
  IDetailCellRendererParams,
  GetDetailRowDataParams,
  RowStyle,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  ActionCellRenderer,
  ActionCellRendererParams,
} from '../action-cell/ActionCellRenderer.component';
import { registerAgGridModules } from '../../ag-grid-module-register';
import { EmployeeData, RowStatus, Skill } from '../../api/employee';
import { EMPLOYEES, EMPTY_EMPLOYEE } from '../../api/data';

registerAgGridModules();

@Component({
  selector: 'app-employee',
  imports: [AgGridAngular, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './Employee.component.html',
  styleUrls: ['./Employee.component.scss'],
})
export class EmployeeComponent {
  api?: GridApi<EmployeeData>;
  pinnedRows = signal<EmployeeData[]>([]);
  rowData = signal<EmployeeData[]>([]);
  totalRows = signal(EMPLOYEES.length);

  rowModelType: RowModelType = 'serverSide';
  columnDefs: ColDef[] = [
    {
      field: 'EmployeeID',
      editable: true,
      cellRenderer: 'agGroupCellRenderer',
    },
    { field: 'FirstName', editable: true },
    { field: 'LastName', editable: true },
    { field: 'Department', editable: true },
    { field: 'Salary', editable: true },
    {
      field: 'Actions',
      cellRenderer: ActionCellRenderer,
      cellRendererParams: {
        deleteCallback: (row) => this.deleteRowCallback(row),
        undoDeleteCallback: (row) => this.undoDeleteCallback(row),
      } as ActionCellRendererParams,
    },
  ];

  getRowId(data: GetRowIdParams<EmployeeData>) {
    return data.data.EmployeeID.toString();
  }

  onGridReady(event: GridReadyEvent) {
    this.api = event.api;
    this.api?.setGridOption('serverSideDatasource', this.serverSideDatasource());
  }

  addNewRow() {
    this.pinnedRows.set([{ ...EMPTY_EMPLOYEE }, ...this.pinnedRows()]);

    setTimeout(() => {
      this.api?.startEditingCell({
        rowIndex: 0,
        colKey: 'EmployeeID',
        rowPinned: 'top',
      });
    }, 150);
  }

  deleteRowCallback = (data: EmployeeData) => {
    if (data.status === 'New' || data.status === 'BeingAdded') {
      const pinned = this.pinnedRows();
      const filtered = pinned.filter((row) => row.EmployeeID !== data.EmployeeID);
      this.pinnedRows.set(filtered);
    }
  };

  undoDeleteCallback = (data: EmployeeData) => {
    console.info('Undoing Delete', data);
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.isEditMode()) {
      const pinned: EmployeeData[] = this.pinnedRows().map((row) => ({
        ...row,
        status: 'New',
      }));
      this.pinnedRows.set(pinned);
    }
  }

  cancelEdit() {
    this.pinnedRows.set([]);
    this.api?.getRenderedNodes().forEach((node) => {
      if (node.data?.status === 'New' || node.data?.status === 'Deleted') {
        node.setData({ ...node.data, status: 'Server' });
      }
    });
  }

  saveChanges() {
    const newRows = this.pinnedRows().filter((row) => row.status === 'New');
    console.info('New Rows', newRows);
    const deletedRows = this.api
      ?.getRenderedNodes()
      .filter((row) => row.data?.status === 'Deleted');
    console.info('Deleted Rows', deletedRows);

    this.pinnedRows.set([]);

    this.api?.getRenderedNodes().forEach((node) => {
      if (node.data?.status === 'New' || node.data?.status === 'Deleted') {
        node.setData({ ...node.data, status: 'Server' });
      }
    });
  }

  isEditMode() {
    const isDeleted = this.api?.getRenderedNodes().find((node) => node.data?.status === 'Deleted');
    return this.pinnedRows().length > 0 || isDeleted;
  }

  serverSideDatasource(): IServerSideDatasource {
    return {
      getRows: (params: IServerSideGetRowsParams<EmployeeData>) => {
        console.log('Requesting rows from server', params.request);
        const startRow = params.request.startRow;
        if (startRow !== undefined) {
          const data = EMPLOYEES.slice(startRow, params.request.endRow);
          this.rowData.set([...this.rowData(), ...data]);
          params.success({ rowData: data });
        }
      },
    };
  }

  detailCellRendererParams: IDetailCellRendererParams = {
    detailGridOptions: {
      columnDefs: [
        { field: 'Name', headerName: 'Skill Name' },
        { field: 'Rating', headerName: 'Rating' },
        { field: 'YearsOfExperience', headerName: 'Years of Experience' },
        { field: 'Actions', cellRenderer: ActionCellRenderer },
      ],
      defaultColDef: {
        flex: 1,
        editable: true,
      },
      getRowStyle: (params: RowClassParams<Skill>) => this.getRowStyle(params),
    },
    getDetailRowData: (params: GetDetailRowDataParams<EmployeeData>) => {
      params.successCallback(params.data.Skills);
    },
  } as IDetailCellRendererParams;

  getRowStyle<T extends { status?: RowStatus }>(params: RowClassParams<T>): RowStyle {
    if (params.data?.status === 'New') return { background: '#d4edda' };
    if (params.data?.status === 'Deleted') return { background: '#f8d7da' };
    return { background: 'white' };
  }
}
