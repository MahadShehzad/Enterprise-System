import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CardComponent } from '../../shared/ui/card/card';
import { ButtonComponent } from '../../shared/ui/button/button';

@Component({
  selector: 'app-forbidden',
  imports: [CardComponent, ButtonComponent],
  templateUrl: './forbidden.html',
  styleUrl: './forbidden.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForbiddenComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly role = this.auth.role;

  goHome(): void {
    void this.router.navigate(['/app/dashboard']);
  }
}
