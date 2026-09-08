import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
} from '@angular/core';

/**
 * Compact pager. Two-way bind `page` (1-based) and pass `total` + `pageSize`.
 *
 *   <ui-paginator [total]="rows().length" [pageSize]="8" [(page)]="page" />
 */
@Component({
  selector: 'ui-paginator',
  templateUrl: './paginator.html',
  styleUrl: './paginator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginatorComponent {
  readonly total = input.required<number>();
  readonly pageSize = input(10);
  readonly page = model(1);

  readonly pageCount = computed(() =>
    Math.max(1, Math.ceil(this.total() / this.pageSize())),
  );

  readonly current = computed(() =>
    Math.min(Math.max(1, this.page()), this.pageCount()),
  );

  readonly from = computed(() =>
    this.total() === 0 ? 0 : (this.current() - 1) * this.pageSize() + 1,
  );

  readonly to = computed(() =>
    Math.min(this.current() * this.pageSize(), this.total()),
  );

  /** Up to 5 page numbers centred on the current page. */
  readonly pages = computed<number[]>(() => {
    const count = this.pageCount();
    const cur = this.current();
    const start = Math.max(1, Math.min(cur - 2, count - 4));
    const end = Math.min(count, start + 4);
    const out: number[] = [];
    for (let i = start; i <= end; i++) {
      out.push(i);
    }
    return out;
  });

  go(page: number): void {
    this.page.set(Math.min(Math.max(1, page), this.pageCount()));
  }
}
