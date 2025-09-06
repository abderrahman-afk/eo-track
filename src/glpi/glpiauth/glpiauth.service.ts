import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class GlpiAuthService {
  private sessionToken?: string;

  constructor(
    private readonly http: HttpService,
    private readonly cfg: ConfigService,
  ) {}

  async ensureSession(): Promise<string> {
    if (this.sessionToken) return this.sessionToken;

    const url = `${this.cfg.get('GLPI_URL')}/initSession?get_full_session=true`;
    const authHeader =
      'Basic ' +
      Buffer.from(
        `${this.cfg.get('GLPI_LOGIN')}:${this.cfg.get('GLPI_PASSWORD')}`,
      ).toString('base64');

    const response = await firstValueFrom(
      this.http.get(url, {
        headers: {
          'App-Token': this.cfg.get('GLPI_APP_TOKEN'),
          Authorization: authHeader,
        },
      }),
    );

    this.sessionToken = response.data.session_token;
    return this.sessionToken!;
  }

  async headers() {
    const token = await this.ensureSession();
    return {
      'Session-Token': token,
      'App-Token': this.cfg.get('GLPI_APP_TOKEN'),
      'Content-Type': 'application/json',
    };
  }

  
}
