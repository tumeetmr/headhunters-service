import { BadRequestException } from '@nestjs/common';
import { EngagementStatus, PlacementStatus, Role } from '../../common/enums';
import { EngagementsService } from './engagements.service';

describe('EngagementsService', () => {
  const makeService = () => {
    const prisma = {
      company: {
        findUnique: jest.fn(),
      },
      engagement: {
        findUnique: jest.fn(),
      },
      $transaction: jest.fn(),
    } as any;

    return {
      service: new EngagementsService(prisma),
      prisma,
    };
  };

  it('rejects FILLED closeout without STARTED/GUARANTEED placement', async () => {
    const { service, prisma } = makeService();

    prisma.engagement.findUnique.mockResolvedValue({
      id: 'eng-1',
      status: EngagementStatus.ACTIVE,
      companyId: 'company-1',
      jobOpeningId: 'job-1',
      placements: [{ id: 'p-1', status: PlacementStatus.PENDING }],
    });

    prisma.company.findUnique.mockResolvedValue({
      id: 'company-1',
      userId: 'user-1',
    });

    await expect(
      service.updateForUser(
        'eng-1',
        { status: EngagementStatus.FILLED },
        'user-1',
        Role.COMPANY,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('fills engagement and syncs job opening when prerequisites are met', async () => {
    const { service, prisma } = makeService();

    prisma.engagement.findUnique.mockResolvedValue({
      id: 'eng-1',
      status: EngagementStatus.ACTIVE,
      companyId: 'company-1',
      jobOpeningId: 'job-1',
      placements: [{ id: 'p-1', status: PlacementStatus.STARTED }],
    });

    prisma.company.findUnique.mockResolvedValue({
      id: 'company-1',
      userId: 'user-1',
    });

    const tx = {
      jobOpening: {
        update: jest.fn().mockResolvedValue({ id: 'job-1', status: 'FILLED' }),
      },
      engagement: {
        update: jest.fn().mockResolvedValue({
          id: 'eng-1',
          status: EngagementStatus.FILLED,
        }),
      },
    };

    prisma.$transaction.mockImplementation(async (cb: any) => cb(tx));

    const result = await service.updateForUser(
      'eng-1',
      { status: EngagementStatus.FILLED },
      'user-1',
      Role.COMPANY,
    );

    expect(result.status).toBe(EngagementStatus.FILLED);
    expect(tx.jobOpening.update).toHaveBeenCalledWith({
      where: { id: 'job-1' },
      data: { status: 'FILLED' },
    });
  });
});
