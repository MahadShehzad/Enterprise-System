import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  contentChild,
  input,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

export interface DataTableColumn {
  key: string;
  label: string;
  align?: 'start' | 'end' | 'center';
}

export type DataTableRow = Record<string, string | number>;

@Component({
  selector: 'ui-data-table',
  imports: [NgTemplateOutlet],
  templateUrl: './data-table.html',
  styleUrl: './data-table.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataTableComponent {
  readonly caption = input<string>('');
  readonly columns = input.required<DataTableColumn[]>();
  readonly rows = input.required<readonly DataTableRow[]>();
  readonly emptyMessage = input('No records to display.');

  /** Optional per-row actions cell: <ng-template uiRowActions let-row>…</ng-template> */
  readonly rowActions = contentChild<TemplateRef<{ $implicit: DataTableRow }>>(
    'uiRowActions',
  );
}
