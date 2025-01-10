import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICellRendererParams } from 'ag-grid-community';
import { MatFormField, MatFormFieldModule } from '@angular/material/form-field';
import { MatInput, MatInputModule } from '@angular/material/input';
import { RowStatus } from '../../api/employee';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';

export interface InputCellParams<TData extends { status?: RowStatus }, TValue>
  extends ICellRendererParams<TData, TValue> {
  initialValue?: TValue;
  placeholder?: string;
  required?: boolean;
  keypressCallback?: (event: KeyboardEvent) => void;
  type?: 'text' | 'number';
}

@Component({
  selector: 'app-input-cell',
  imports: [
    AgGridModule,
    CommonModule,
    MatFormField,
    MatInput,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
  ],
  templateUrl: './input-cell.component.html',
  styleUrl: './input-cell.component.scss',
})
export class InputCellComponent<TData extends { status?: RowStatus }, TValue>
  implements ICellRendererAngularComp
{
  params!: InputCellParams<TData, TValue>;
  formControl = new FormControl<TValue | undefined>(undefined);

  agInit(params: InputCellParams<TData, TValue>): void {
    this.params = params;
    this.formControl.setValue(this.params.value ?? this.params.initialValue);
  }

  refresh(params: InputCellParams<TData, TValue>): boolean {
    this.params = params;
    return false;
  }

  onBlur() {
    this.onInputChange();
  }

  onInputChange() {
    if (this.formControl.value !== this.params.value && this.params.column?.getColId()) {
      this.params.node.setDataValue(this.params.column?.getColId(), this.formControl.value);
      this.params?.setValue?.(this.formControl.value);
    }
  }
}
