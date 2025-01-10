import { CommonModule } from '@angular/common';
import { Component, HostBinding } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-enterprise';
import { RowStatus } from '../../api/employee';

export interface InputTextCellRendererParams<TData extends { status?: RowStatus }, TValue>
  extends ICellRendererParams<TData, TValue> {
  initialValue?: TValue;
  placeholder?: string;
  required?: boolean;
  keypressCallback?: (event: KeyboardEvent) => void;
  type?: 'number' | 'text' | 'checkbox';
}

@Component({
  selector: 'app-input-text-cell-renderer',
  imports: [AgGridModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-text-cell-renderer.component.html',
  styleUrl: './input-text-cell-renderer.component.scss',
})
export class InputTextCellRendererComponent<TData extends { status?: RowStatus }, TValue>
  implements ICellRendererAngularComp
{
  params!: InputTextCellRendererParams<TData, TValue>;

  inputValue?: TValue;

  initialValue?: TValue;
  placeholder?: string;

  agInit(params: InputTextCellRendererParams<TData, TValue>): void {
    this.params = params;
    this.placeholder = this.params.placeholder;
    this.initialValue = this.params.initialValue;
    this.params.value
      ? (this.inputValue = this.params.value)
      : (this.inputValue = this.initialValue);
  }

  refresh(params: InputTextCellRendererParams<TData, TValue>): boolean {
    this.params = params;
    return false;
  }

  onFocus() {}

  onBlur() {
    this.onInputChange();
  }

  onInputChange() {
    if (this.inputValue !== this.params.value && this.params.column?.getColId()) {
      this.params.node.setDataValue(this.params.column?.getColId(), this.inputValue);
    }
  }

}
