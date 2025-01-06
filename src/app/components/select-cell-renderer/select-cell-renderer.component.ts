import { Component, OnDestroy, DestroyRef, inject } from '@angular/core';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { ICellRendererParams } from 'ag-grid-community';
import { RowStatus } from '../../api/employee';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { ReplaySubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
    NgxMatSelectSearchModule,
  ],
  templateUrl: './select-cell-renderer.component.html',
  styleUrls: ['./select-cell-renderer.component.scss'],
})
export class SelectCellRenderer<
  TData extends { status?: RowStatus },
  TValue extends string | number,
> implements ICellRendererAngularComp
{
  protected params?: SelectCellRendererParams<TData, TValue>;

  protected selectCtrl: FormControl<TValue | null> = new FormControl<TValue | null>(null);
  protected searchFilterCtrl: FormControl<string> = new FormControl<string>('', {
    nonNullable: true,
  });

  public filteredOptions: ReplaySubject<TValue[]> = new ReplaySubject<TValue[]>(1);

  private destroyRef = inject(DestroyRef);

  agInit(params: SelectCellRendererParams<TData, TValue>): void {
    this.params = params;

    if (this.params.value) this.selectCtrl.setValue(this.params.value);

    this.filteredOptions.next(this.params.options.slice());

    this.searchFilterCtrl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.filterOptions());

    this.selectCtrl.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      this.params?.setValue?.(value);
    });
  }

  refresh(params: SelectCellRendererParams<TData, TValue>): boolean {
    this.params = params;
    return false;
  }

  private filterOptions() {
    const search = this.searchFilterCtrl.value?.toLowerCase() || '';
    this.filteredOptions.next(
      this.params?.options.filter((option) => option.toString().toLowerCase().includes(search)) ||
        [],
    );
  }
}
