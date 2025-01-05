import { Component, computed, effect, signal } from '@angular/core';
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
  ICellRendererParams,
  CellKeyDownEvent,
  FullWidthCellKeyDownEvent,
} from 'ag-grid-community';
import { AgGridAngular } from 'ag-grid-angular';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import {
  ActionCellRenderer,
  ActionCellRendererParams,
  MasterGridContext,
} from '../action-cell/action-cell-renderer.component';
import { registerAgGridModules } from '../../ag-grid-module-register';
import { EmployeeData, RowStatus, Skill } from '../../api/employee';
import { EMPLOYEES, EMPTY_EMPLOYEE } from '../../api/data';
import {
  InputTextCellRendererComponent,
  InputTextCellRendererParams,
} from '../input-text-cell-renderer/input-text-cell-renderer.component';
import { suppressKeyboardEvent } from '../../utils/ag-keypress';

registerAgGridModules();

@Component({
  selector: 'app-employee',
  imports: [AgGridAngular, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent {
  api?: GridApi<EmployeeData>;

  rowBeingAdded = signal<EmployeeData | null>(null);

  editedRows = signal<EmployeeData[]>([]);

  deletedSkills = signal<Record<number, Skill[]>>({});

  hasChanges = computed(
    () =>
      this.rowBeingAdded() !== null ||
      this.editedRows().length > 0 ||
      Object.keys(this.deletedSkills()).length > 0,
  );

  saveEnabled = computed(
    () =>
      this.editedRows().filter((row) => row.status !== 'BeingAdded' && row.status !== 'BeingEdited')
        .length > 0,
  );

  rowModelType: RowModelType = 'serverSide';

  defaultColDef = {
    suppressKeyboardEvent,
  };

  columnDefs: ColDef[] = [
    { field: 'group', cellRenderer: 'agGroupCellRenderer', flex: 0.1 },
    {
      field: 'EmployeeID',
      cellRendererSelector: (params) => ({
        ...this.inputCellRenderer<number>(params),
        params: {
          initialValue: params.data.EmployeeID,
          placeholder: 'Emp Id',
          required: true,
        } as InputTextCellRendererParams<EmployeeData, number>,
      }),
    },
    {
      field: 'FirstName',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.FirstName,
          placeholder: 'First',
          required: true,
        } as InputTextCellRendererParams<EmployeeData, string>,
      }),
    },
    {
      field: 'LastName',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.LastName,
          placeholder: 'Last',
        } as InputTextCellRendererParams<EmployeeData, string>,
      }),
    },
    {
      field: 'Department',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.Department,
          placeholder: 'Dept',
          required: true,
        } as InputTextCellRendererParams<EmployeeData, string>,
      }),
    },
    {
      field: 'Salary',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.Salary,
          placeholder: 'Salary',
        } as InputTextCellRendererParams<EmployeeData, string>,
      }),
    },
    {
      field: 'Actions',
      cellRenderer: ActionCellRenderer<EmployeeData>,
      cellRendererParams: {
        deleteCallback: (_, row) => this.deleteRowCallback(row),
        undoDeleteCallback: (_, row) => this.undoChangesCallback(row),
        rowEditingStarted: (_, row) => this.rowEditingStarted(row),
        rowEditingStopped: (_, row) => this.rowEditingStopped(row),
      } as ActionCellRendererParams<EmployeeData>,
    },
  ];

  constructor() {
    effect(() => {
      console.info('Edited Rows', this.editedRows());
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
    this.api?.getDisplayedRowAtIndex(0)?.setRowHeight(72);
    this.api?.onRowHeightChanged();
  }

  deleteRowCallback = (data: EmployeeData) => {
    const deletedRow = this.editedRows().find((row) => row.EmployeeID === data.EmployeeID);

    deletedRow?.status === 'Added' || deletedRow?.status === 'BeingAdded'
      ? this.editedRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID))
      : this.editedRows.update((rows) => [...rows, { ...data, status: 'Deleted' }]);
  };

  undoChangesCallback = (data: EmployeeData) =>
    this.editedRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID));

  rowEditingStarted = (data: EmployeeData) =>
    this.editedRows.update((rows) =>
      rows.filter((row) => row.EmployeeID !== data.EmployeeID).concat(data),
    );

  rowEditingStopped = (data: EmployeeData) =>
    this.editedRows.update((rows) =>
      rows.filter((row) => row.EmployeeID !== data.EmployeeID).concat(data),
    );

  onCellKeyDown(event: CellKeyDownEvent<EmployeeData> | FullWidthCellKeyDownEvent<EmployeeData>) {
    const keyboardEvent = event.event as KeyboardEvent;

    if (keyboardEvent.key === 'Enter' && this.hasChanges()) {
      const changedRow = event.data;

      if (changedRow) {
        const changedNode = this.api
          ?.getRenderedNodes()
          .find((node) => node.data?.EmployeeID === changedRow?.EmployeeID);

        if (changedRow.status === 'BeingAdded') {
          // Validation: Ensure all fields are filled
          if (!changedRow.EmployeeID || !changedRow.FirstName || !changedRow.Department) {
            return;
          }

          changedNode?.setData({ ...changedRow, status: 'Added' });
          this.editedRows.update((row) => [{ ...changedRow, status: 'Added' }, ...row]);
          this.rowBeingAdded.set(null);
        } else if (changedRow.status === 'BeingEdited') {
          const changedData: EmployeeData = { ...changedRow, status: 'Edited' };

          changedNode?.setData(changedData);
          this.rowEditingStopped(changedData);
        }

        changedNode?.setRowHeight(42);
        this.api?.onRowHeightChanged();
      }
    }
  }

  cancelEdit() {
    const topRow = this.rowBeingAdded();
    const newRows = this.editedRows().filter((row) => row.status === 'Added');
    const removeRows = topRow ? [topRow, ...newRows] : newRows;
    this.api?.applyServerSideTransaction({ remove: removeRows });

    this.cleanState();

    this.api?.getRenderedNodes().forEach((node) => {
      if (
        node.data?.status === 'Added' ||
        node.data?.status === 'Deleted' ||
        node.data?.status === 'Edited' ||
        node.data?.status === 'BeingEdited'
      ) {
        node.setData({ ...node.data, status: 'Server' });
      }
    });
  }

  saveChanges() {
    console.info('[S] Changed Rows', this.editedRows());
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
        const newRows = this.editedRows().filter((row) => row.status === 'Added');
        if (startRow !== undefined && endRow !== undefined) {
          const adjustedStart = Math.max(0, startRow - newRows.length);
          const adjustedEnd = Math.max(0, endRow - newRows.length);

          const data = EMPLOYEES.slice(adjustedStart, adjustedEnd);
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
    const status = params.data?.status;

    if (status === 'BeingAdded') return { background: '#F6F8FA' };
    if (status === 'Added') return { background: '#d4edda' };
    if (status === 'Deleted') return { background: '#f8d7da' };
    if (status === 'BeingEdited' || status === 'Edited') return { background: '#fff3cd' };

    return { background: 'white' };
  }

  private cleanState = () => {
    this.editedRows.set([]);
    this.deletedSkills.set({});
    this.rowBeingAdded.set(null);
  };

  inputCellRenderer<TValue>(params: ICellRendererParams<EmployeeData>) {
    return params.data?.status === 'BeingAdded' || params.data?.status === 'BeingEdited'
      ? { component: InputTextCellRendererComponent<EmployeeData, TValue> }
      : undefined;
  }
}
