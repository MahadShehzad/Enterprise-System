import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  input,
  output,
} from '@angular/core';

export type StatTrend = 'up' | 'down' | 'flat';
export type StatAccent = 'brand' | 'mint' | 'peach' | 'pink';

@Component({
  selector: 'ui-stat-card',
  templateUrl: './stat-card.html',
  styleUrl: './stat-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.stat-host--clickable]': 'clickable()',
    '[attr.role]': 'clickable() ? "button" : null',
    '[attr.tabindex]': 'clickable() ? 0 : null',
    '(click)': 'onActivate()',
    '(keydown.enter)': 'onActivate()',
    '(keydown.space)': 'onActivate($event)',
  },
})
export class StatCardComponent {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly icon = input<string>('');
  readonly delta = input<string>('');
  readonly trend = input<StatTrend>('flat');
  readonly accent = input<StatAccent>('brand');
  readonly clickable = input(false, { transform: booleanAttribute });

  readonly activated = output<void>();

  readonly trendSymbol = () =>
    this.trend() === 'up' ? '▲' : this.trend() === 'down' ? '▼' : '■';

  onActivate(event?: Event): void {
    if (!this.clickable()) {
      return;
    }
    event?.preventDefault();
    this.activated.emit();
  }
}
