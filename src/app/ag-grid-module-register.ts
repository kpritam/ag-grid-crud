import {
  ModuleRegistry,
  RowApiModule,
  RowSelectionModule,
  CustomEditorModule,
  NumberEditorModule,
  TextEditorModule,
  ValidationModule,
  RenderApiModule,
  RowStyleModule,
  PaginationModule,
  PinnedRowModule,
  ClientSideRowModelModule,
} from 'ag-grid-community';

import {
  ServerSideRowModelModule,
  ServerSideRowModelApiModule,
  MasterDetailModule,
  ColumnMenuModule,
  ContextMenuModule,
  ColumnsToolPanelModule,
} from 'ag-grid-enterprise';

export const registerAgGridModules = () =>
  ModuleRegistry.registerModules([
    RowSelectionModule,
    RowApiModule,
    ValidationModule,
    NumberEditorModule,
    TextEditorModule,
    CustomEditorModule,
    RenderApiModule,
    RowStyleModule,
    PaginationModule,
    PinnedRowModule,
    ServerSideRowModelModule,
    ServerSideRowModelApiModule,
    MasterDetailModule,
    ColumnMenuModule,
    ContextMenuModule,
    ColumnsToolPanelModule,
    ClientSideRowModelModule,
  ]);
