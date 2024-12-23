import { Component, computed, effect, HostListener, signal } from '@angular/core';
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
  MasterGridContext,
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

  visitedRows = signal<EmployeeData[]>([]);
  newRows = signal<EmployeeData[]>([]);
  deletedRows = signal<EmployeeData[]>([]);
  deletedSkills = signal<Record<number, Skill[]>>({});

  hasChanges = computed(() => this.newRows().length > 0 || this.deletedRows().length > 0);

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
      cellRenderer: ActionCellRenderer<EmployeeData>,
      cellRendererParams: {
        deleteCallback: (_, row) => this.deleteRowCallback(row),
        undoDeleteCallback: (_, row) => this.undoDeleteCallback(row),
      } as ActionCellRendererParams<EmployeeData>,
    },
  ];

  constructor() {
    effect(() => { console.info('New Rows', this.newRows()); });
    effect(() => { console.info('Deleted Rows', this.deletedRows()); });
    effect(() => { console.info('Visited Rows', this.visitedRows()); });
    effect(() => { console.info('Deleted Skills', this.deletedSkills()); });
  }

  getRowId(data: GetRowIdParams<EmployeeData>) {
    return data.data.EmployeeID.toString();
  }

  onGridReady(event: GridReadyEvent) {
    this.api = event.api;
    this.api?.setGridOption('serverSideDatasource', this.serverSideDatasource());
  }

  addNewRow() {
    this.newRows.update((rows) => [{ ...EMPTY_EMPLOYEE }, ...rows]);

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
      this.newRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID));
    } else {
      this.deletedRows.update((rows) => [...rows, { ...data, status: 'Deleted' }]);
    }
  };

  undoDeleteCallback = (data: EmployeeData) => {
    console.info('Undoing Delete', data);
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.hasChanges()) {
      this.newRows.update((row) => row.map((row) => ({ ...row, status: 'New' })));
    }
  }

  cancelEdit() {
    this.newRows.set([]);
    this.api?.getRenderedNodes().forEach((node) => {
      if (node.data?.status === 'New' || node.data?.status === 'Deleted') {
        node.setData({ ...node.data, status: 'Server' });
      }
    });
  }

  saveChanges() {
    const newRows = this.newRows().filter((row) => row.status === 'New');
    console.info('New Rows', newRows);
    const deletedRows = this.deletedRows();
    console.info('Deleted Rows', deletedRows);

    this.newRows.set([]);
    this.deletedRows.set([]);

    this.api?.refreshServerSide();
  }

  serverSideDatasource(): IServerSideDatasource {
    return {
      getRows: (params: IServerSideGetRowsParams<EmployeeData>) => {
        console.log('Requesting rows from server', params.request);
        const startRow = params.request.startRow;
        if (startRow !== undefined) {
          const data = EMPLOYEES.slice(startRow, params.request.endRow);
          this.visitedRows.update((rows) => [...rows, ...data]);
          params.success({ rowData: data });
        }
      },
    };
  }

  detailCellRendererParams = (masterGridParams: any): IDetailCellRendererParams => {
    return {
      detailGridOptions: {
        context: {
          masterGrid: {
            node: masterGridParams.node.parent,
          },
        },
        columnDefs: [
          { field: 'Name', headerName: 'Skill Name' },
          { field: 'Rating', headerName: 'Rating' },
          { field: 'YearsOfExperience', headerName: 'Years of Experience' },
          {
            field: 'Actions',
            cellRenderer: ActionCellRenderer<Skill>,
            cellRendererParams: {
              deleteCallback: (ctx, row) => this.deleteSkillCallback(ctx, row),
              undoDeleteCallback: (ctx, row) => this.undoDeleteSkillCallback(ctx, row),
            } as ActionCellRendererParams<Skill>,
          },
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
  };

  deleteSkillCallback = (ctx: MasterGridContext, data: Skill) => {
    this.deletedSkills.update((skillsMap) => {
        const empId = ctx.masterGrid.node.data.EmployeeID;
        const skills = skillsMap[empId] || [];
        skills.push(data);
        return { ...skillsMap, [empId]: skills };
    });
  };

  undoDeleteSkillCallback = (ctx: MasterGridContext, data: Skill) => {
    this.deletedSkills.update((skillsMap) => {
        const empId = ctx.masterGrid.node.data.EmployeeID;
        const skills = skillsMap[empId] || [];
        const updatedSkills = skills.filter((skill) => skill.Name !== data.Name);
        return updatedSkills.length > 0 
            ? { ...skillsMap, [empId]: updatedSkills } 
            : (({ [empId]: _, ...rest }) => rest)(skillsMap);
    });
  };

  getRowStyle<T extends { status?: RowStatus }>(params: RowClassParams<T>): RowStyle {
    if (params.data?.status === 'New') return { background: '#d4edda' };
    if (params.data?.status === 'Deleted') return { background: '#f8d7da' };
    return { background: 'white' };
  }
}
