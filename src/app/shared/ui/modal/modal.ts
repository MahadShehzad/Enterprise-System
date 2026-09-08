import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  input,
  output,
} from '@angular/core';

/**
 * Lightweight modal dialog. The parent controls visibility with `@if` and
 * listens to `(closed)` for backdrop / escape / close-button dismissal.
 *
 *   @if (editing()) {
 *     <ui-modal title="Edit" (closed)="editing.set(false)"> … </ui-modal>
 *   }
 */
@Component({
  selector: 'ui-modal',
  templateUrl: './modal.html',
  styleUrl: './modal.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {
  readonly title = input('');
  readonly closed = output<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closed.emit();
  }

  onBackdrop(): void {
    this.closed.emit();
  }
}
