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
  rowBeingAdded = signal<EmployeeData | null>(null);

  hasChanges = computed(
    () =>
      this.rowBeingAdded() !== null ||
      this.newRows().length > 0 ||
      this.deletedRows().length > 0 ||
      Object.keys(this.deletedSkills()).length > 0,
  );

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
    effect(() => {
      console.info('New Rows', this.newRows());
    });
    effect(() => {
      console.info('Deleted Rows', this.deletedRows());
    });
    effect(() => {
      console.info('Visited Rows', this.visitedRows());
    });
    effect(() => {
      console.info('Deleted Skills', this.deletedSkills());
    });
  }

  getRowId(data: GetRowIdParams<EmployeeData>) {
    return data.data.EmployeeID.toString();
  }

  onGridReady(event: GridReadyEvent) {
    this.api = event.api;
    this.api?.setGridOption('serverSideDatasource', this.serverSideDatasource());
  }

  addNewRow() {
    if (this.api?.paginationGetCurrentPage() !== 0) {
      this.api?.paginationGoToFirstPage();
    }

    const id = Math.floor(Math.random() * 10000000);
    const newRow = { ...EMPTY_EMPLOYEE, EmployeeID: id };
    this.rowBeingAdded.set(newRow);

    this.api?.applyServerSideTransaction({ addIndex: 0, add: [newRow] });

    setTimeout(() => {
      this.api?.startEditingCell({ rowIndex: 0, colKey: 'EmployeeID' });
    }, 100);
  }

  deleteRowCallback = (data: EmployeeData) => {
    if (data.status === 'New' || data.status === 'BeingAdded') {
      this.newRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID));
      this.api?.applyServerSideTransaction({ remove: [data] });
    } else {
      this.deletedRows.update((rows) => [...rows, { ...data, status: 'Deleted' }]);
    }
  };

  undoDeleteCallback = (data: EmployeeData) => {
    this.deletedRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID));
    console.info('Undoing Delete', data);
  };

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.hasChanges()) {
      const topRow = this.rowBeingAdded();
      if (topRow) {
        const topNode = this.api
          ?.getRenderedNodes()
          .find((node) => node.data?.EmployeeID === topRow?.EmployeeID);

        topNode?.setData({ ...topRow, status: 'New' });
        this.newRows.update((row) => [{ ...topRow, status: 'New' }, ...row]);
        this.rowBeingAdded.set(null);
      }
    }
  }

  cancelEdit() {
    const topRow = this.rowBeingAdded();
    const newRows = this.newRows();
    const removeRows = topRow ? [topRow, ...newRows] : newRows;
    this.api?.applyServerSideTransaction({ remove: removeRows });

    this.cleanState();

    this.api?.getRenderedNodes().forEach((node) => {
      if (node.data?.status === 'New' || node.data?.status === 'Deleted') {
        node.setData({ ...node.data, status: 'Server' });
      }
    });
  }

  saveChanges() {
    const newRows = this.newRows().filter((row) => row.status === 'New');
    console.info('[S] New Rows', newRows);
    console.info('[S] Deleted Rows', this.deletedRows());
    console.info('[S] Deleted Skills', this.deletedSkills());

    this.cleanState();

    this.api?.refreshServerSide();
  }

  serverSideDatasource(): IServerSideDatasource {
    return {
      getRows: (params: IServerSideGetRowsParams<EmployeeData>) => {
        console.log('Requesting rows from server', params.request);
        const startRow = params.request.startRow;
        const endRow = params.request.endRow;
        if (startRow !== undefined && endRow !== undefined) {
          const adjustedStart = Math.max(0, startRow - this.newRows().length);
          const adjustedEnd = Math.max(0, endRow - this.newRows().length);

          const data = EMPLOYEES.slice(adjustedStart, adjustedEnd);
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
        defaultColDef: { editable: true },
        getRowStyle: (params: RowClassParams<Skill>) => this.getRowStyle(params),
      },
      getDetailRowData: (params: GetDetailRowDataParams<EmployeeData>) => {
        const empId = params.data.EmployeeID;
        const skills = params.data.Skills.map((skill) => {
          const deletedSkills = this.deletedSkills()[empId] || [];
          const deletedSkill = deletedSkills.find((ds) => ds.Name === skill.Name);
          return deletedSkill ? { ...skill, status: 'Deleted' } : skill;
        });
        params.successCallback(skills);
      },
    } as IDetailCellRendererParams;
  };

  deleteSkillCallback = (ctx: MasterGridContext, data: Skill) => {
    this.deletedSkills.update((skillsMap) => {
      const empId = ctx.masterGrid.node.data.EmployeeID;
      const skills = skillsMap[empId] || [];
      skills.push({ ...data, status: 'Deleted' });
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

  private cleanState = () => {
    this.newRows.set([]);
    this.deletedRows.set([]);
    this.deletedSkills.set({});
    this.rowBeingAdded.set(null);
  };
}
