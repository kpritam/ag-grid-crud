import { Component, computed, signal, effect } from '@angular/core';

import { AgGridModule, type ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';
import { RowStatus } from '../../api/employee';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface SelectCellRendererParams<TData extends { status?: RowStatus }, TValue>
  extends ICellRendererParams<TData, TValue> {
  initialValue?: TValue;
  placeholder?: string;
  options: TValue[];
  required?: boolean;
  keypressCallback?: (event: KeyboardEvent) => void;
}

@Component({
  selector: 'app-select-cell-renderer',
  imports: [
    AgGridModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
  ],
  templateUrl: './select-cell-renderer.component.html',
  styleUrls: ['./select-cell-renderer.component.scss'],
})
export class SelectCellRenderer<TData extends { status?: RowStatus }, TValue>
  implements ICellRendererAngularComp
{
  params = signal<SelectCellRendererParams<TData, TValue> | undefined>(undefined);

  selectedValue?: TValue;

  initialValue = computed(() => this.params()?.initialValue);
  options = computed(() => this.params()?.options ?? []);
  placeholder = computed(() => this.params()?.placeholder);

  agInit(params: SelectCellRendererParams<TData, TValue>): void {
    this.params.set(params);
    this.selectedValue = params.value ?? params.initialValue;
  }

  refresh(params: SelectCellRendererParams<TData, TValue>): boolean {
    this.params.set(params);
    this.selectedValue = params.value ?? params.initialValue;
    this.params()?.api?.refreshCells();
    return false;
  }
}
