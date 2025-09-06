// src/glpi-sync/glpi-sync.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserRepository } from 'src/user/user.repository';
import { GlpiService } from '../glpi.service';

type SyncUserInput = Omit<
  Prisma.UserUncheckedCreateInput,
  'id' | 'glpiId' | 'createdAt' | 'updatedAt'
>;

interface SyncOptions {
  dryRun?: boolean;
  limit?: number;
  offset?: number;
}

@Injectable()
export class GlpiSyncService {
  private readonly log = new Logger(GlpiSyncService.name);
  private readonly fallbackDomain = process.env.FALLBACK_EMAIL_DOMAIN || 'local.sync';

  constructor(
    private readonly glpi: GlpiService,
    private readonly users: UserRepository,
  ) {}

  private ensureEmail(name: string, email?: string | null) {
    if (email && email.trim().length > 0) return email.trim();
    return `${name}@${this.fallbackDomain}`;
  }

  private mapGlpiUser(g: any): SyncUserInput {
    return {
      name: g.name,
      email: this.ensureEmail(g.name, g.email),
      phone: g.phone ?? null,
      phone2: g.phone2 ?? null,
      mobile: g.mobile ?? null,
      realname: g.realname ?? null,
      firstname: g.firstname ?? null,
      picture: g.picture ?? null,
      nickname: g.nickname ?? null,
      isActive: g.is_active === 1 || g.is_active === true,
      dateSync: new Date(),
      createdBy: 'glpi-sync',
      updatedBy: 'glpi-sync',
    };
  }

  async syncUsersFromGlpi(opts: SyncOptions = {}) {
    const { dryRun = false, limit, offset } = opts;

    // You can extend listUsers to support pagination if needed.
    const glpiUsers = await this.glpi.listUsers();

    let imported = 0;
    let updated = 0;
    const touched: Array<{ glpiId: string; action: 'created' | 'updated' }> = [];

    for (const g of glpiUsers) {
      const glpiId = String(g.id);
      const payload = this.mapGlpiUser(g);

      if (dryRun) {
        const exists = await this.users.findByGlpiId(glpiId);
        if (exists) updated++; else imported++;
        touched.push({ glpiId, action: exists ? 'updated' : 'created' });
        continue;
      }

      const before = await this.users.findByGlpiId(glpiId);
      await this.users.upsertByGlpiId(glpiId, payload);
      if (before) updated++; else imported++;
      touched.push({ glpiId, action: before ? 'updated' : 'created' });
    }

    return {
      dryRun,
      total: glpiUsers.length,
      imported,
      updated,
      touched, // you can remove this if you want a lighter response
    };
  }
}
