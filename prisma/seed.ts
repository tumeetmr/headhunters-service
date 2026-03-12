import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env['DATABASE_URL']!,
});
const prisma = new PrismaClient({ adapter });

const DEFAULT_PASSWORD = 'Lambda@2026';

interface RecruiterSeed {
  name: string;
  slug: string;
  email: string;
  title: string;
  bio: string;
  experience_years?: number;
  education?: string;
  sectors?: string[];
  specialties?: string[];
  skills?: string[];
  languages?: string[];
  awards?: string[];
  linkedin?: string;
  phone?: string;
  photoUrl?: string;
  insights?: { title: string; description?: string; mediaUrl?: string; thumbnailUrl?: string }[];
}

const recruiters: RecruiterSeed[] = [
  {
    name: 'Б.Очирзаяа',
    slug: 'ochirzaya',
    email: 'ochirzaya@lambda.mn',
    title:
      'Leadership & Management, Organizational Strategy, Executive Hiring Solutions',
    experience_years: 23,
    education: 'Executive MBA',
    sectors: ['Education', 'Trade', 'Mining', 'Consulting', 'HR'],
    bio: 'Бизнес, Менежментийн салбарт 20 гаруй жил ажилласан туршлагатай. Сүүлийн жилүүдэд Зөвлөх үйлчилгээ, Хүний нөөц бүрдүүлэлтийн чиглэлд төвлөрч ажиллаж байна. Удирдах албан тушаалын бүрдүүлэлт дээр түлхүү ажиллаж байна.',
    linkedin: 'https://www.linkedin.com/in/ochirzaya-bayarrentsen-8baa32b0',
    phone: '88886418',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1syJaL3bQQrMYY68bte6UPLssDG-JSGEN',
    insights: [
      {
        title: 'Ochirzaya Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1295006249169500%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'М.Оюун-Ундрам',
    slug: 'oyun-undram',
    email: 'oyun.undram@lambda.mn',
    title: 'HR & Business Leadership',
    experience_years: 10,
    education: 'Master of HR and Business Administration',
    specialties: ['Recruitment', 'Planning'],
    bio: 'Байгалийн зохион байгуулагч, эерэг эрч хүчээр дүүрэн манлайлагч. Миний зарчим бол үнэнч байдал болон тасралтгүй зүтгэл. Хүний нөөцийн бүрдүүлэлт, төлөвлөлтөөр голчлон ажилладаг.',
    linkedin:
      'https://www.linkedin.com/in/oyunundram-maisaikhan-50b9a1387/',
    phone: '86118108',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1p810I5NuqtKRHfiC1zXV23Xrdl-720ek',
  },
  {
    name: 'Ц.Намуун',
    slug: 'namuun',
    email: 'namuun@lambda.mn',
    title: 'International Relations & Project Manager',
    experience_years: 5,
    education: 'Master of Public Administration',
    specialties: [
      'International Recruitment',
      'Cross-cultural Communication',
      'Staffing',
    ],
    skills: ['IELTS 8.0', 'Diplomatic Communication', 'Strategic Partnership'],
    bio: 'Олон улсын болон бизнесийн байгууллагуудад гадаад харилцаа, төслийн менежерээр ажилласан. 1,000 програм хангамжийн инженер бэлтгэх стратегийн түншлэлийн төслийг удирдаж байсан туршлагатай.',
    linkedin: 'https://www.linkedin.com/in/namuun-tsendjav/',
    phone: '80107211',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1Oedf36g4Hs3Yu-a83PyhM09UaPF28x-k',
  },
  {
    name: 'Б.Урантуяа',
    slug: 'urantuya',
    email: 'urantuya@lambda.mn',
    title:
      'Executive Leadership Journalism, Economic Journalist, PR Specialist',
    experience_years: 18,
    sectors: [
      'Mining',
      'Construction',
      'Transport',
      'Food & Light Industry',
      'Education',
      'Tech',
    ],
    specialties: ['PR Portraits', 'Interviews', 'Recruiting Partner'],
    bio: 'Хэвлэл мэдээллийн салбарт 18 жил ажилласан. Recruiting Partner-ийн хүрээнд олон салбарын компаниудтай хамтын ажиллагаагаа өргөжүүлэн ажиллаж байна.',
    phone: '88004564',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1imfkfM9w4EVLTnrqmVfZaDaCvf43Z0hB',
  },
  {
    name: 'Г.Номин-Эрдэнэ',
    slug: 'nomin-erdene',
    email: 'nomin.erdene@lambda.mn',
    title: 'HR Partner & Operations Manager',
    experience_years: 2,
    education: 'International Relations (NUM, 2022)',
    sectors: ['Electronics', 'Construction', 'Mining (Oyu Tolgoi)'],
    specialties: ['Recruitment', 'Labor Relations'],
    bio: 'Энка Глобал констракшн ХХК-ийн Оюу Толгойн баяжуулалтын төсөл дээр Хүний нөөцийн сонгон шалгаруулалт хариуцаж байсан. Одоогоор Ламбда Глобал ХХК-д Хүний нөөцийн түнш.',
    linkedin:
      'https://www.linkedin.com/in/nominerdene-galbadrakh-40a963215/',
    phone: '89555342',
  },
  {
    name: 'Д.Одончимэг',
    slug: 'odonchimeg',
    email: 'odonchimeg@lambda.mn',
    title: 'Talent Partner',
    experience_years: 20,
    education: "Master's Degree (Engineering base)",
    specialties: [
      'L&D',
      'Recruitment',
      'ERP Implementation',
      'ISO Systems',
    ],
    bio: '1200 хүнтэй групп компанийн сургалт хөгжил, бүрдүүлэлт болон хүний нөөцийн нэгжийн ERP системийн нэвтрүүлэлтийг амжилттай хэрэгжүүлсэн.',
    linkedin: 'https://www.linkedin.com/odonchimeg-darambazar',
    phone: '93112686',
    photoUrl: 'https://drive.google.com/uc?export=view&id=12VXHaDEWQHn-hSpXs-bQg2WIrhwqhUtN',
  },
  {
    name: 'Д.Мөнхжаргал',
    slug: 'munkhjargal',
    email: 'munkhjargal@lambda.mn',
    title: 'Strategic Human Resources Partner',
    experience_years: 14,
    education: 'MBA in Human Resources Management',
    sectors: ['Mining', 'Automotive', 'Hospitality', 'Equipment'],
    specialties: [
      'End-to-end Talent Acquisition',
      'HR Systems',
      'Expatriate Mobilization',
      'Visa Process',
    ],
    bio: 'Strategic Human Resources Partner with 14+ years of experience in multinational corporation and industrial environments.',
    linkedin:
      'https://www.linkedin.com/in/munkhjargal-damdinsuren-a680b7187/',
    phone: '88103678',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1PmgbXPcJJNz3e5hiOCtKyFmGTEjEz2MD',
    insights: [
      {
        title: 'Munkhjargal Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1494519638767519%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'Э.Үүрцайх',
    slug: 'uurtsaikh',
    email: 'uurtsaikh@lambda.mn',
    title: 'HR Specialist',
    experience_years: 8,
    education: 'Master of HR Management and Business Administration',
    sectors: ['Construction', 'Mining'],
    specialties: ['Recruitment', 'Labor Relations'],
    bio: 'Хүний нөөцийн мэргэжлээрээ тасралтгүй 8 жил ажиллаж байна. Сонгон шалгаруулалт, хөдөлмөрийн харилцаа талдаа мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/uurtsaikh-enebish-238a09158',
    phone: '99956947',
  },
  {
    name: 'Уранбилэг',
    slug: 'uranbileg',
    email: 'uranbileg@lambda.mn',
    title: 'HR Consultant & Psychological Counselor',
    experience_years: 43,
    education: 'Nurse, Pharmacist, Teacher, Translator',
    sectors: ['Health', 'Education', 'Tourism'],
    bio: 'Эрүүл мэндийн салбарт 17 жил, боловсролын салбарт 26 жил ажилласан. Хүний нөөц, ажил мэргэлжийн сонголт хийхэд залууст сэтгэл зүйн зөвлөлгөө өгч байна.',
    linkedin:
      'https://www.linkedin.com/in/uranbileg-chogsom-829136a9/',
    phone: '99140669',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1iTlo32oacMEDDz27USDzSmuSVW3O0CFi',
  },
  {
    name: 'Д.Энхцэцэг',
    slug: 'enkhtsetseg',
    email: 'enkhtsetseg@lambda.mn',
    title: 'Executive Finance & Trade Specialist',
    experience_years: 25,
    education: 'Accountant, Economist, Master of Public Administration',
    specialties: [
      'Risk Management',
      'Strategic Planning',
      'Digital Product Implementation',
      'Non-performing Loans',
    ],
    bio: 'Санхүү болон худалдааны чиглэлээр 25+ жилийн удирдах түвшний туршлагатай. Олон улсын стандарттай нийцсэн бодлого, журам боловсруулах чиглэлээр мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/tsetsgee-dashdondog-9099b736a/',
    phone: '99075770',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1AwXSqQqkhvnHj3RCyiuPgwzsd5eMbhUK'
  },
  {
    name: 'Г.Ганчимэг',
    slug: 'ganchimeg-g',
    email: 'ganchimeg.g@lambda.mn',
    title: 'Professional Recruiter (Chinese & MNCs)',
    sectors: ['Telecom', 'IT', 'HR Consulting'],
    languages: ['English', 'Chinese'],
    specialties: ['Headhunting', 'MNC Talent Acquisition'],
    bio: 'Үндэстэн дамнасан компаниудад рекрутерээр ажилласан туршлагатай. Англи, Хятад хэлээр чөлөөтэй харилцдаг.',
    linkedin: 'https://www.linkedin.com/in/ganchimegg/',
    phone: '72111272',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1DaOPMOPwX3mx4G-8fkpFwMUXRgIXHUBu',
    insights: [
      {
        title: 'Ganchimeg Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F905125295733382%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'М.Зулаа',
    slug: 'zulaa',
    email: 'zulaa@lambda.mn',
    title: 'HR Manager',
    experience_years: 5,
    education: 'Business Administration (HR)',
    sectors: ['Food Production', 'Information Technology'],
    specialties: [
      'Organizational Culture',
      'Recruitment',
      'Performance Management',
    ],
    bio: 'Мэдээллийн технологийн салбарын хурдтай өөрчлөлт болон хүнсний салбарын стандарт, гүйцэтгэлийн удирдлагыг хослуулан ажиллах чадвартай.',
    linkedin: 'https://www.linkedin.com/in/munkhtur-zulaa-66521937',
    phone: '98989747',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1aBx_eOSwoSYzfEe3yt01Y0SO_fgq8QCG'
  },
  {
    name: 'С.Ариунаа',
    slug: 'ariunaa',
    email: 'ariunaa@lambda.mn',
    title: 'Human Resources & Executive Leadership',
    experience_years: 15,
    sectors: [
      'Banking',
      'Finance',
      'Engineering',
      'Education',
      'Renewable Energy',
    ],
    specialties: [
      'Workforce Planning',
      'Employee Motivation',
      'Performance Evaluation',
      'Foreign Recruitment',
    ],
    bio: '15 гаруй жилийн туршлагатай. Мянганы сорилтын сангийн төсөл болон сэргээгдэх эрчим хүчний томоохон төслүүдийн бүрдүүлэлт дээр ажиллаж байсан.',
    linkedin: 'https://www.linkedin.com/in/ariunaa-ser-od-2a156516a/',
    phone: '99105053',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1KjJi_6AvkMZ3dcSbJw0iT-A_c1fSzGrI',
    insights: [
      {
        title: 'Ariunaa Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F1416007530205354%2F&show_text=false&width=267&t=0',
      },
    ],
  },
  {
    name: 'Т.Баярмаа',
    slug: 'bayarmaa',
    email: 'bayarmaa@lambda.mn',
    title: 'Mining & Engineering Recruiter',
    experience_years: 10,
    languages: ['English', 'Russian', 'Korean'],
    sectors: ['Mining', 'Construction', 'Finance', 'Education', 'Sales'],
    specialties: ['Expatriate Management', 'Procurement', 'Onboarding'],
    bio: 'Oyu Tolgoi Underground Project дээр 400 гаруй ажилтны бүрдүүлэлтийг хариуцан ажиллаж байсан туршлагатай.',
    linkedin: 'https://www.linkedin.com/in/bayarmaa-t-a181b185/',
    phone: '99834683',
    photoUrl: 'https://drive.google.com/uc?export=view&id=12wcTKJ1rLFlFhDKfhr5AO9-8Ybrjjs75',
  },
  {
    name: 'Э.Ганчимэг',
    slug: 'ganchimeg-e',
    email: 'ganchimeg.e@lambda.mn',
    title: 'Marketing & Sales Recruiter',
    sectors: ['Marketing', 'Sales', 'Commerce'],
    specialties: ['Talent Sourcing', 'Network Marketing'],
    bio: 'Борлуулалт, маркетинг, худалдааны салбаруудад мэргэшсэн чадварлаг хүний нөөцийн рекрутер.',
    linkedin: 'https://www.linkedin.com/in/ganchimeg-enebish/',
    phone: '88094000',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1etczTlOp1nyQ4W_j4Q2HuhbewNv6llYT',
    insights: [
      {
        title: 'Ganchimeg Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F799266812699995%2F&show_text=false&width=267&t=0',
      }
    ]
  },
  {
    name: 'Н.Амаржаргал',
    slug: 'amarjargal',
    email: 'amarjargal@lambda.mn',
    title: 'HR Consultant & ISO Auditor',
    experience_years: 22,
    education: 'Master of Business and Public Administration',
    specialties: [
      'HR Audit',
      'ISO 30400:2016',
      'ISO 9001:2015',
      'Strategic Management',
    ],
    sectors: [
      'Banking',
      'Manufacturing',
      'Retail',
      'Telecom',
      'Construction',
      'Healthcare',
    ],
    bio: '24 компанид зөвлөх үйлчилгээ үзүүлсэн. Хүний нөөцийн аудит, гүйцэтгэлийн үнэлгээ, ур чадварын зөрүүгийн шинжилгээгээр мэргэшсэн.',
    linkedin:
      'https://www.linkedin.com/in/amarjargal-nergui-0952606b/',
    phone: '89192017',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1RT4qGoQN9PmFokAyByL9aFIXS0XhsJMJ',
  },
  {
    name: 'Г.Дулам',
    slug: 'dulam',
    email: 'dulam@lambda.mn',
    title: 'HR Strategic Planning & Mentor',
    experience_years: 12,
    specialties: [
      'L&D',
      'Performance Management',
      'Coaching',
      'HR Strategy',
    ],
    awards: ['Best Innovator Member'],
    bio: 'Монголын томоохон групп компаниудад хүний нөөцийн бодлого хэрэгжүүлсэн. Дасгалжуулалтын академийн ментор.',
    linkedin: 'https://www.linkedin.com/in/dulam-gansukh-511b0079/',
    photoUrl: 'https://drive.google.com/uc?export=view&id=1D5V4Qr0C3-JpV-rqjNKYDKD2hQRItMRW',
    insights: [
      {
        title: 'Dulam Insight',
        mediaUrl: 'https://www.facebook.com/plugins/video.php?height=476&href=https%3A%2F%2Fwww.facebook.com%2Freel%2F948975324263440%2F&show_text=false&width=267&t=0',
      }
    ]
  },
];

async function main() {
  console.log('🌱 Starting seed...\n');

  const hashedPassword = await hash(DEFAULT_PASSWORD, 12);

  // ── Collect and upsert all unique Skills ──────────────────
  const allSkillNames = new Set<string>();
  for (const r of recruiters) {
    r.skills?.forEach((s) => allSkillNames.add(s));
  }

  for (const name of allSkillNames) {
    await prisma.skill.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  if (allSkillNames.size > 0) {
    console.log(`✓ Upserted ${allSkillNames.size} skills`);
  }

  // ── Seed each recruiter ───────────────────────────────────
  for (const r of recruiters) {
    // 1. Create User
    const user = await prisma.user.upsert({
      where: { email: r.email },
      update: {},
      create: {
        email: r.email,
        password: hashedPassword,
        name: r.name,
        role: 'RECRUITER',
      },
    });

    // 2. Resolve skills to connect
    const skillConnections = r.skills
      ? await Promise.all(
          r.skills.map((name) =>
            prisma.skill.findUnique({ where: { name } }),
          ),
        )
      : [];

    // 3. Create RecruiterProfile
    const profile = await prisma.recruiterProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        slug: r.slug,
        title: r.title,
        tagline: r.education ?? null,
        bio: r.bio,
        yearsExperience: r.experience_years ?? null,
        visibility: 'PUBLISHED',
        photoUrl: r.photoUrl ?? null,
        publicPhone: r.phone ?? null,
        isLeadPartner: (r.experience_years ?? 0) >= 15,
        skills: {
          connect: skillConnections
            .filter(Boolean)
            .map((s) => ({ id: s!.id })),
        },
      },
    });

    // 4. Create RecruiterTags (industry, expertise, language, certification)
    const tags: { type: string; value: string; sortOrder: number }[] = [];

    r.sectors?.forEach((v, i) =>
      tags.push({ type: 'INDUSTRY', value: v, sortOrder: i }),
    );
    r.specialties?.forEach((v, i) =>
      tags.push({ type: 'EXPERTISE', value: v, sortOrder: i }),
    );
    r.languages?.forEach((v, i) =>
      tags.push({ type: 'LANGUAGE', value: v, sortOrder: i }),
    );
    r.awards?.forEach((v, i) =>
      tags.push({ type: 'CERTIFICATION', value: v, sortOrder: i }),
    );

    for (const tag of tags) {
      await prisma.recruiterTag.upsert({
        where: {
          recruiterProfileId_type_value: {
            recruiterProfileId: profile.id,
            type: tag.type,
            value: tag.value,
          },
        },
        update: {},
        create: {
          recruiterProfileId: profile.id,
          ...tag,
        },
      });
    }

    // 5. Create RecruiterLinks (LinkedIn + Phone)
    if (r.linkedin) {
      const url = r.linkedin.startsWith('http')
        ? r.linkedin
        : `https://${r.linkedin}`;
      await prisma.recruiterLink.upsert({
        where: {
          recruiterProfileId_type_url: {
            recruiterProfileId: profile.id,
            type: 'LINKEDIN',
            url,
          },
        },
        update: {},
        create: {
          recruiterProfileId: profile.id,
          type: 'LINKEDIN',
          label: 'LinkedIn',
          url,
        },
      });
    }

    if (r.phone) {
      const phoneUrl = `tel:+976${r.phone}`;
      await prisma.recruiterLink.upsert({
        where: {
          recruiterProfileId_type_url: {
            recruiterProfileId: profile.id,
            type: 'PHONE',
            url: phoneUrl,
          },
        },
        update: {},
        create: {
          recruiterProfileId: profile.id,
          type: 'PHONE',
          label: r.phone,
          url: phoneUrl,
        },
      });
    }

    // 6. Create RecruiterInsights
    if (r.insights) {
      for (let i = 0; i < r.insights.length; i++) {
        const insight = r.insights[i];
        await prisma.recruiterInsight.create({
          data: {
            recruiterProfileId: profile.id,
            title: insight.title,
            description: insight.description ?? null,
            mediaUrl: insight.mediaUrl ?? null,
            thumbnailUrl: insight.thumbnailUrl ?? null,
            status: 'PUBLISHED',
            sortOrder: i,
            publishedAt: new Date(),
          },
        });
      }
    }

    console.log(`  ✓ ${r.name} (${r.slug})`);
  }

  console.log(`\n🎉 Seeded ${recruiters.length} recruiters successfully!`);
  console.log(`   Default password: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
