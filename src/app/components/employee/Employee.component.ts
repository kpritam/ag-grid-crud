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
  ICellRendererParams,
  SuppressKeyboardEventParams,
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
import {
  InputTextCellRendererComponent,
  InputTextCellRendererParams,
} from '../input-text-cell-renderer/input-text-cell-renderer.component';

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

  rowBeingAdded = signal<EmployeeData | null>(null);

  editedRows = signal<EmployeeData[]>([]);

  deletedSkills = signal<Record<number, Skill[]>>({});

  hasChanges = computed(
    () =>
      this.rowBeingAdded() !== null ||
      this.editedRows().length > 0 ||
      Object.keys(this.deletedSkills()).length > 0,
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
        } as InputTextCellRendererParams<number>,
      }),
    },
    {
      field: 'FirstName',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.FirstName,
          placeholder: 'First',
        } as InputTextCellRendererParams<string>,
      }),
    },
    {
      field: 'LastName',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.LastName,
          placeholder: 'Last',
        } as InputTextCellRendererParams<string>,
      }),
    },
    {
      field: 'Department',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.Department,
          placeholder: 'Dept',
        } as InputTextCellRendererParams<string>,
      }),
    },
    {
      field: 'Salary',
      cellRendererSelector: (params: ICellRendererParams<EmployeeData>) => ({
        ...this.inputCellRenderer<string>(params),
        params: {
          initialValue: params.data?.Salary,
          placeholder: 'Salary',
        } as InputTextCellRendererParams<string>,
      }),
    },
    {
      field: 'Actions',
      cellRenderer: ActionCellRenderer<EmployeeData>,
      cellRendererParams: {
        deleteCallback: (_, row) => this.deleteRowCallback(row),
        undoDeleteCallback: (_, row) => this.undoChangesCallback(row),
        saveChangesCallback: (_, row) => this.saveChangesCallback(row),
      } as ActionCellRendererParams<EmployeeData>,
    },
  ];

  constructor() {
    effect(() => {
      console.info('Edited Rows', this.editedRows());
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
    const deletedRow = this.editedRows().find((row) => row.EmployeeID === data.EmployeeID);

    deletedRow?.status === 'New' || deletedRow?.status === 'BeingAdded'
      ? this.editedRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID))
      : this.editedRows.update((rows) => [...rows, { ...data, status: 'Deleted' }]);
  };

  undoChangesCallback = (data: EmployeeData) =>
    this.editedRows.update((rows) => rows.filter((row) => row.EmployeeID !== data.EmployeeID));

  saveChangesCallback = (data: EmployeeData) =>
    this.editedRows.update((rows) =>
      rows.filter((row) => row.EmployeeID !== data.EmployeeID).concat(data),
    );

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' && this.hasChanges()) {
      const topRow = this.rowBeingAdded();
      if (topRow) {
        const topNode = this.api
          ?.getRenderedNodes()
          .find((node) => node.data?.EmployeeID === topRow?.EmployeeID);

        topNode?.setData({ ...topRow, status: 'New' });
        this.editedRows.update((row) => [{ ...topRow, status: 'New' }, ...row]);
        this.rowBeingAdded.set(null);
      }
    }
  }

  cancelEdit() {
    const topRow = this.rowBeingAdded();
    const newRows = this.editedRows().filter((row) => row.status === 'New');
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
        const newRows = this.editedRows().filter((row) => row.status === 'New');
        if (startRow !== undefined && endRow !== undefined) {
          const adjustedStart = Math.max(0, startRow - newRows.length);
          const adjustedEnd = Math.max(0, endRow - newRows.length);

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

    if (status === 'New') return { background: '#d4edda' };
    if (status === 'Deleted') return { background: '#f8d7da' };
    if (status === 'BeingEdited' || status === 'Edited') return { background: '#fff3cd' };

    return { background: 'white' };
  }

  private cleanState = () => {
    this.editedRows.set([]);
    this.deletedSkills.set({});
    this.rowBeingAdded.set(null);
  };

  inputCellRenderer<T>(params: ICellRendererParams<EmployeeData>) {
    return params.data?.status === 'BeingAdded' || params.data?.status === 'BeingEdited'
      ? { component: InputTextCellRendererComponent<T> }
      : undefined;
  }
}

const GRID_CELL_CLASSNAME = 'ag-cell';
function getAllFocusableElementsOf(el: HTMLElement) {
  return Array.from<HTMLElement>(
    el.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
  ).filter((focusableEl) => {
    return focusableEl.tabIndex !== -1;
  });
}
function getEventPath(event: Event): HTMLElement[] {
  const path: HTMLElement[] = [];
  let currentTarget: any = event.target;
  while (currentTarget) {
    path.push(currentTarget);
    currentTarget = currentTarget.parentElement;
  }
  return path;
}

function getSibling(el: HTMLElement, direction: 'next' | 'previous') {
  const sibling = direction === 'next' ? el.nextElementSibling : el.previousElementSibling;
  return sibling ? (sibling as HTMLElement) : null;
}

/**
 * Capture whether the user is tabbing forwards or backwards and suppress keyboard event if tabbing
 * outside of the children
 */
function suppressKeyboardEvent({ event }: SuppressKeyboardEventParams<any>) {
  const { key, shiftKey } = event;
  const path = getEventPath(event);
  const isTabForward = key === 'Tab' && shiftKey === false;
  const isTabBackward = key === 'Tab' && shiftKey === true;
  let suppressEvent = false;
  // Handle cell children tabbing
  if (isTabForward || isTabBackward) {
    const eGridCell = path.find((el) => {
      if (el.classList === undefined) return false;
      return el.classList.contains(GRID_CELL_CLASSNAME);
    });
    if (!eGridCell) {
      return suppressEvent;
    }

    const sibling = getSibling(eGridCell, isTabForward ? 'next' : 'previous');

    if (!sibling) {
      return suppressEvent;
    }

    const focusableChildrenElements = getAllFocusableElementsOf(sibling);
    const lastCellChildEl = focusableChildrenElements[focusableChildrenElements.length - 1];
    const firstCellChildEl = focusableChildrenElements[0];
    // Suppress keyboard event if tabbing forward within the cell and the current focused element is not the last child
    if (focusableChildrenElements.length === 0) {
      return false;
    }
    const currentIndex = focusableChildrenElements.indexOf(document.activeElement as HTMLElement);
    if (isTabForward) {
      const isLastChildFocused = lastCellChildEl && document.activeElement === lastCellChildEl;
      if (!isLastChildFocused) {
        suppressEvent = true;
        if (currentIndex !== -1 || document.activeElement === eGridCell) {
          event.preventDefault();
          focusableChildrenElements[currentIndex + 1].focus();
        }
      }
    }
    // Suppress keyboard event if tabbing backwards within the cell, and the current focused element is not the first child
    else {
      const cellHasFocusedChildren =
        eGridCell.contains(document.activeElement) && eGridCell !== document.activeElement;
      // Manually set focus to the last child element if cell doesn't have focused children
      if (!cellHasFocusedChildren) {
        lastCellChildEl.focus();
        // Cancel keyboard press, so that it doesn't focus on the last child and then pass through the keyboard press to
        // move to the 2nd last child element
        event.preventDefault();
      }
      const isFirstChildFocused = firstCellChildEl && document.activeElement === firstCellChildEl;
      if (!isFirstChildFocused) {
        suppressEvent = true;
        if (currentIndex !== -1 || document.activeElement === eGridCell) {
          event.preventDefault();
          focusableChildrenElements[currentIndex - 1].focus();
        }
      }
    }
  }
  return suppressEvent;
}
