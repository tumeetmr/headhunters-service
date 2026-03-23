import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PlacementStatus, Role } from '../../common/enums';
import { PlacementsService } from './placements.service';

describe('PlacementsService', () => {
  const makeService = () => {
    const prisma = {
      recruiterProfile: {
        findUnique: jest.fn(),
      },
      company: {
        findUnique: jest.fn(),
      },
      engagement: {
        findUnique: jest.fn(),
      },
      placement: {
        create: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    return {
      service: new PlacementsService(prisma),
      prisma,
    };
  };

  it('updates status for valid recruiter-owned transition', async () => {
    const { service, prisma } = makeService();

    prisma.placement.findUnique.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.PENDING,
      engagement: {
        companyId: 'company-1',
        recruiterProfileId: 'recruiter-1',
      },
    });

    prisma.recruiterProfile.findUnique.mockResolvedValue({
      id: 'recruiter-1',
      userId: 'user-1',
    });

    prisma.placement.update.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.OFFERED,
    });

    const result = await service.updateStatusForUser(
      'placement-1',
      PlacementStatus.OFFERED,
      'user-1',
      Role.RECRUITER,
    );

    expect(result.status).toBe(PlacementStatus.OFFERED);
    expect(prisma.placement.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'placement-1' },
        data: expect.objectContaining({ status: PlacementStatus.OFFERED }),
      }),
    );
  });

  it('allows recruiter to create placement for own engagement', async () => {
    const { service, prisma } = makeService();

    prisma.engagement.findUnique.mockResolvedValue({
      id: 'eng-1',
      recruiterProfileId: 'recruiter-1',
      companyId: 'company-1',
    });
    prisma.recruiterProfile.findUnique.mockResolvedValue({
      id: 'recruiter-1',
      userId: 'user-1',
    });
    prisma.placement.create.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.PENDING,
    });

    const result = await service.create(
      'eng-1',
      { candidateName: 'Alex Candidate' },
      'user-1',
      Role.RECRUITER,
    );

    expect(result.status).toBe(PlacementStatus.PENDING);
    expect(prisma.placement.create).toHaveBeenCalled();
  });

  it('blocks recruiter from setting ACCEPTED directly', async () => {
    const { service, prisma } = makeService();

    prisma.placement.findUnique.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.OFFERED,
      engagement: {
        companyId: 'company-1',
        recruiterProfileId: 'recruiter-1',
      },
    });
    prisma.recruiterProfile.findUnique.mockResolvedValue({
      id: 'recruiter-1',
      userId: 'user-1',
    });

    await expect(
      service.updateStatusForUser(
        'placement-1',
        PlacementStatus.ACCEPTED,
        'user-1',
        Role.RECRUITER,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('allows company to select candidate and cancel others', async () => {
    const { service, prisma } = makeService();

    prisma.placement.findUnique.mockResolvedValue({
      id: 'placement-1',
      engagementId: 'eng-1',
      status: PlacementStatus.PENDING,
      engagement: {
        companyId: 'company-1',
      },
    });

    prisma.company.findUnique.mockResolvedValue({
      id: 'company-1',
      userId: 'company-user-1',
    });

    const tx = {
      placement: {
        update: jest.fn().mockResolvedValue({
          id: 'placement-1',
          status: PlacementStatus.ACCEPTED,
        }),
        updateMany: jest.fn().mockResolvedValue({ count: 2 }),
      },
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.selectCandidateForUser(
      'placement-1',
      'company-user-1',
      Role.COMPANY,
    );

    expect(result.status).toBe(PlacementStatus.ACCEPTED);
    expect(tx.placement.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'placement-1' },
        data: { status: PlacementStatus.ACCEPTED },
      }),
    );
    expect(tx.placement.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          engagementId: 'eng-1',
          id: { not: 'placement-1' },
        }),
      }),
    );
  });

  it('rejects invalid status transition', async () => {
    const { service, prisma } = makeService();

    prisma.placement.findUnique.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.PENDING,
      engagement: {
        companyId: 'company-1',
        recruiterProfileId: 'recruiter-1',
      },
    });

    prisma.recruiterProfile.findUnique.mockResolvedValue({
      id: 'recruiter-1',
      userId: 'user-1',
    });

    await expect(
      service.updateStatusForUser(
        'placement-1',
        PlacementStatus.STARTED,
        'user-1',
        Role.RECRUITER,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.placement.update).not.toHaveBeenCalled();
  });

  it('blocks recruiter who does not own engagement', async () => {
    const { service, prisma } = makeService();

    prisma.placement.findUnique.mockResolvedValue({
      id: 'placement-1',
      status: PlacementStatus.PENDING,
      engagement: {
        companyId: 'company-1',
        recruiterProfileId: 'recruiter-owner',
      },
    });

    prisma.recruiterProfile.findUnique.mockResolvedValue({
      id: 'recruiter-other',
      userId: 'user-1',
    });

    await expect(
      service.updateStatusForUser(
        'placement-1',
        PlacementStatus.OFFERED,
        'user-1',
        Role.RECRUITER,
      ),
    ).rejects.toBeInstanceOf(ForbiddenException);

    expect(prisma.placement.update).not.toHaveBeenCalled();
  });
});
