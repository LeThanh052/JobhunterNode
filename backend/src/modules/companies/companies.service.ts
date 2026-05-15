import { prisma } from "../../config/prisma";
import { RequestUser } from "../../types/express";
import { buildAuditUser } from "../../utils/audit";
import { parsePagination } from "../../utils/pagination";

function sanitizeCompany(company: {
  id: string;
  name: string;
  address: string;
  description: string;
  logo: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: company.id,
    name: company.name,
    address: company.address,
    description: company.description,
    logo: company.logo,
    createdAt: company.createdAt,
    updatedAt: company.updatedAt
  };
}

export class CompaniesService {
  async create(
    input: {
      name: string;
      address: string;
      description: string;
      logo: string;
    },
    actor: RequestUser
  ) {
    const company = await prisma.company.create({
      data: {
        name: input.name,
        address: input.address,
        description: input.description,
        logo: input.logo,
        createdBy: buildAuditUser(actor)
      }
    });

    return {
      id: company.id,
      createdAt: company.createdAt
    };
  }

  async findAll(query: Record<string, unknown>) {
    const { currentPage, limit, skip, sort, filter } = parsePagination(query);

    const where = {
      deletedAt: null,
      ...buildCompanyWhere(filter)
    };

    const [total, companies] = await Promise.all([
      prisma.company.count({ where }),
      prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: sort
      })
    ]);

    return {
      meta: {
        current: currentPage,
        pageSize: limit,
        pages: Math.ceil(total / limit),
        total
      },
      result: companies.map((company) => sanitizeCompany(company))
    };
  }

  async findOne(id: string) {
    const company = await prisma.company.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!company) {
      return "not found company";
    }

    return sanitizeCompany(company);
  }

  async update(
    input: {
      id: string;
      name: string;
      address: string;
      description: string;
      logo: string;
    },
    actor: RequestUser
  ) {
    return prisma.company.updateMany({
      where: {
        id: input.id,
        deletedAt: null
      },
      data: {
        name: input.name,
        address: input.address,
        description: input.description,
        logo: input.logo,
        updatedBy: buildAuditUser(actor)
      }
    });
  }

  async remove(id: string, actor: RequestUser) {
    const foundCompany = await prisma.company.findFirst({
      where: {
        id,
        deletedAt: null
      }
    });

    if (!foundCompany) {
      return "not found company";
    }

    return prisma.company.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        deletedBy: buildAuditUser(actor)
      }
    });
  }
}

function buildCompanyWhere(filter: Record<string, unknown>) {
  const where: Record<string, unknown> = {};

  if (typeof filter.name === "string") {
    where.name = {
      contains: filter.name,
      mode: "insensitive"
    };
  }

  if (typeof filter.address === "string") {
    where.address = {
      contains: filter.address,
      mode: "insensitive"
    };
  }

  return where;
}

export const companiesService = new CompaniesService();
