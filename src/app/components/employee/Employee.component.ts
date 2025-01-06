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
  IRowNode,
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
import {
  SelectCellRenderer,
  SelectCellRendererParams,
} from '../select-cell-renderer/select-cell-renderer.component';

registerAgGridModules();

const ROW_COLORS = {
  BEING_ADDED: '#F6F8FA',
  ADDED: '#d4edda',
  DELETED: '#f8d7da',
  BEING_EDITED: '#fff3cd',
  DEFAULT: 'white',
};

type EditedRow = {
  original: EmployeeData;
  updated: EmployeeData;
};

@Component({
  selector: 'app-employee',
  imports: [AgGridAngular, MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss'],
})
export class EmployeeComponent {
  api?: GridApi<EmployeeData>;
  rowBeingAdded = signal<EmployeeData | null>(null);
  editedRows = signal<EditedRow[]>([]);
  deletedSkills = signal<Record<number, Skill[]>>({});
  rowModelType: RowModelType = 'serverSide';

  hasChanges = computed(
    () =>
      this.rowBeingAdded() !== null ||
      this.editedRows().length > 0 ||
      Object.keys(this.deletedSkills()).length > 0,
  );

  saveEnabled = computed(
    () =>
      this.editedRows().filter(
        (row) => row.updated.status !== 'BeingAdded' && row.updated.status !== 'BeingEdited',
      ).length > 0,
  );

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
        component: this.selectCellRenderer<string>(params),
        params: {
          ...params,
          initialValue: params.data?.Department,
          placeholder: 'Department',
          options: ['HR', 'IT', 'Finance', 'Admin', 'Engineering'],
          required: true,
        } as SelectCellRendererParams<EmployeeData, string>,
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
        undoEditCallback: (_, row) => this.undoChangesCallback(row),
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
    const deletedRow = this.editedRows().find((row) => row.updated.EmployeeID === data.EmployeeID);

    deletedRow?.updated.status === 'Added' || deletedRow?.updated.status === 'BeingAdded'
      ? this.editedRows.update((rows) =>
          rows.filter((row) => row.updated.EmployeeID !== data.EmployeeID),
        )
      : this.editedRows.update((rows) => [
          ...rows,
          { original: { ...data }, updated: { ...data, status: 'Deleted' } },
        ]);
  };

  undoChangesCallback = (node: IRowNode<EmployeeData>) => {
    const editedRow = this.editedRows().find(
      (row) => row.updated.EmployeeID === node.data?.EmployeeID,
    );

    const currentStatus = editedRow?.updated.status;

    if (
      editedRow &&
      (currentStatus === 'Deleted' || currentStatus === 'Edited' || currentStatus === 'BeingEdited')
    ) {
      node.setData({ ...editedRow.original, status: 'Server' });
    }

    return this.editedRows.update((rows) =>
      rows.filter((row) => row.updated.EmployeeID !== node.data?.EmployeeID),
    );
  };

  rowEditingStarted = (data: EmployeeData) => {
    return this.editedRows.update((rows) =>
      rows
        .filter((row) => row.updated.EmployeeID !== data.EmployeeID)
        .concat({ original: { ...data, status: 'Server' }, updated: { ...data } }),
    );
  };

  rowEditingStopped = (data: EmployeeData) => {
    const originalRow = this.editedRows().find((row) => row.updated.EmployeeID === data.EmployeeID);

    if (originalRow) {
      const original: EmployeeData = { ...originalRow.original, status: 'Server' };

      this.editedRows.update((rows) =>
        rows
          .filter((row) => row.updated.EmployeeID !== data.EmployeeID)
          .concat({ original: { ...original, status: 'Server' }, updated: { ...data } }),
      );
    }
  };

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
          this.editedRows.update((row) => [
            { original: { ...changedRow }, updated: { ...changedRow, status: 'Added' } },
            ...row,
          ]);
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
    const newRows = this.editedRows().filter((row) => row.updated.status === 'Added');
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
        const newRows = this.editedRows().filter((row) => row.updated.status === 'Added');
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
              undoEditCallback: (ctx, row) => this.undoDeleteSkillCallback(ctx, row),
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

  undoDeleteSkillCallback = (ctx: MasterGridContext, data: IRowNode<Skill>) => {
    this.deletedSkills.update((skillsMap) => {
      const empId = ctx.masterGrid.node.data.EmployeeID;
      const skills = skillsMap[empId] || [];
      const updatedSkills = skills.filter((skill) => skill.Name !== data.data?.Name);
      return updatedSkills.length > 0
        ? { ...skillsMap, [empId]: updatedSkills }
        : (({ [empId]: _, ...rest }) => rest)(skillsMap);
    });
  };

  getRowStyle<T extends { status?: RowStatus }>(params: RowClassParams<T>): RowStyle {
    const status = params.data?.status;

    if (status === 'BeingAdded') return { background: ROW_COLORS.BEING_ADDED };
    if (status === 'Added') return { background: ROW_COLORS.ADDED };
    if (status === 'Deleted') return { background: ROW_COLORS.DELETED };
    if (status === 'BeingEdited' || status === 'Edited')
      return { background: ROW_COLORS.BEING_EDITED };

    return { background: ROW_COLORS.DEFAULT };
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

  selectCellRenderer<TValue extends string | number>(params: ICellRendererParams<EmployeeData>) {
    return params.data?.status === 'BeingAdded' || params.data?.status === 'BeingEdited'
      ? SelectCellRenderer<EmployeeData, TValue>
      : undefined;
  }
}
