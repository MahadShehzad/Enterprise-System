import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-login',
  imports: [FormsModule, ButtonComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly email = signal('');
  protected readonly password = signal('');
  protected readonly showPassword = signal(false);
  protected readonly error = signal('');
  protected readonly submitting = signal(false);

  async onSubmit(): Promise<void> {
    if (this.submitting()) {
      return;
    }
    this.error.set('');

    if (!this.email().trim() || !this.password()) {
      this.error.set('Please enter your email and password.');
      return;
    }

    this.submitting.set(true);
    const result = await this.auth.login(this.email(), this.password());
    this.submitting.set(false);

    if (!result.ok) {
      this.error.set(result.error);
      return;
    }

    const redirectTo =
      this.route.snapshot.queryParamMap.get('redirectTo') ?? '/app/dashboard';
    void this.router.navigateByUrl(redirectTo);
  }

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }
}
