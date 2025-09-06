import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GlpiAuthService } from './glpiauth/glpiauth.service';

@Injectable()
export class GlpiService {
  constructor(
    private readonly http: HttpService,
    private readonly auth: GlpiAuthService,
    private readonly cfg: ConfigService,
  ) {}

  async listUsers() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/User`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }
async getUserById(id: number) {
  const res = await firstValueFrom(
    this.http.get(`${this.cfg.get('GLPI_URL')}/User/${id}`, {
      headers: await this.auth.headers(),
    }),
  );
  return res.data;
}


  async listTickets() {
    const res = await firstValueFrom(
      this.http.get(`${this.cfg.get('GLPI_URL')}/Ticket`, {
        headers: await this.auth.headers(),
      }),
    );
    return res.data;
  }
}
