import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'ui-card',
  templateUrl: './card.html',
  styleUrl: './card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
  readonly heading = input<string>('');
  readonly subheading = input<string>('');
  readonly padded = input(true);
}
