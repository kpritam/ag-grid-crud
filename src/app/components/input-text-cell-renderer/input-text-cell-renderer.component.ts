import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-enterprise';
import { RowStatus } from '../../api/employee';

export interface InputTextCellRendererParams<T> extends ICellRendererParams<T> {
  initialValue?: T;
  placeholder?: string;
}

@Component({
  selector: 'app-input-text-cell-renderer',
  imports: [AgGridModule, CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './input-text-cell-renderer.component.html',
  styleUrl: './input-text-cell-renderer.component.scss',
})
export class InputTextCellRendererComponent<T> implements ICellRendererAngularComp {
  params!: InputTextCellRendererParams<T>;

  inputValue?: T;

  initialValue?: T;
  placeholder?: string;

  agInit(params: InputTextCellRendererParams<T>): void {
    this.params = params;
    this.placeholder = this.params.placeholder;
    this.initialValue = this.params.initialValue;
    this.params.value
      ? (this.inputValue = this.params.value)
      : (this.inputValue = this.initialValue);
  }

  refresh(params: InputTextCellRendererParams<T>): boolean {
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
