import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { GlpiService } from '../glpi.service';

@Controller('profiles')
export class ProfilesController {
  constructor(private readonly glpiService: GlpiService) {}

  // GET /profiles/user/123 - Get profiles for specific user
  @Get('user/:glpiUserId')
  async getUserProfiles(@Param('glpiUserId', ParseIntPipe) glpiUserId: number) {
    return this.glpiService.getUserProfiles(glpiUserId);
  }

  // GET /profiles/456?glpiUserId=123 - Get specific profile details
  @Get(':profileId')
  async getProfileById(
    @Param('profileId', ParseIntPipe) profileId: number,
    @Query('glpiUserId', ParseIntPipe) glpiUserId: number,
  ) {
    if (!glpiUserId) {
      throw new BadRequestException('glpiUserId is required for access validation');
    }

    // Verify user has this profile
    const userProfiles = await this.glpiService.getUserProfiles(glpiUserId);
    const hasProfile = userProfiles.some((profile: any) => profile.profiles_id === profileId);

    if (!hasProfile) {
      throw new BadRequestException('Access denied: User does not have this profile');
    }

    return this.glpiService.getProfileById(profileId);
  }
}