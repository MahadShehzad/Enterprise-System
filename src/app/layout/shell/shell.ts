import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TenantContextService } from '../../core/services/tenant-context.service';
import { NavigationService } from '../../core/services/navigation.service';
import { initialsOf } from '../../core/models/user.model';
import { SidebarComponent } from '../../shared/ui/sidebar/sidebar';
import { BadgeComponent } from '../../shared/ui/badge/badge';
import { ButtonComponent } from '../../shared/ui/button/button';

@Component({
  selector: 'app-shell',
  imports: [
    RouterOutlet,
    RouterLink,
    SidebarComponent,
    BadgeComponent,
    ButtonComponent,
  ],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  protected readonly tenantCtx = inject(TenantContextService);
  protected readonly nav = inject(NavigationService);

  protected readonly user = this.auth.user;
  protected readonly initialsOf = initialsOf;

  onTenantChange(tenantId: string): void {
    this.tenantCtx.setActiveTenant(tenantId);
  }

  logout(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }
}
