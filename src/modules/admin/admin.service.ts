import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [users, recruiters, companies, jobOpenings, applications, engagements] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.recruiterProfile.count(),
        this.prisma.company.count(),
        this.prisma.jobOpening.count(),
        this.prisma.application.count(),
        this.prisma.engagement.count(),
      ]);

    return { users, recruiters, companies, jobOpenings, applications, engagements };
  }

  getUsers(role?: string) {
    return this.prisma.user.findMany({
      where: role ? { role } : undefined,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
