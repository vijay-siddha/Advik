import { PrismaClient } from '@prisma/client';
import { Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export interface BenchmarkFilters {
  projectId?: string;
  category?: string;
  manufacturer?: string;
  minCost?: number;
  maxCost?: number;
  search?: string;
}

export class BenchmarkService {
  async findAll(filters: BenchmarkFilters) {
    const where: Prisma.BenchmarkWhereInput = {};
    
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.category) where.category = filters.category;
    if (filters.manufacturer) where.manufacturer = { contains: filters.manufacturer, mode: 'insensitive' };
    if (filters.minCost || filters.maxCost) {
      where.estimatedCost = {};
      if (filters.minCost) where.estimatedCost.gte = filters.minCost;
      if (filters.maxCost) where.estimatedCost.lte = filters.maxCost;
    }
    if (filters.search) {
      where.OR = [
        { productName: { contains: filters.search, mode: 'insensitive' } },
        { manufacturer: { contains: filters.search, mode: 'insensitive' } },
        { modelNumber: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.benchmark.findMany({
      where,
      include: {
        project: { select: { name: true } },
        _count: { select: { components: true, bomItems: true, images: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    return prisma.benchmark.findUnique({
      where: { id },
      include: {
        components: true,
        bomItems: { orderBy: { itemNumber: 'asc' } },
        images: true,
        videos: true,
        documents: true,
        project: true,
      },
    });
  }

  async create(data: Prisma.BenchmarkCreateInput) {
    return prisma.benchmark.create({
      data,
      include: {
        components: true,
        bomItems: true,
      },
    });
  }

  async update(id: string, data: Prisma.BenchmarkUpdateInput) {
    return prisma.benchmark.update({
      where: { id },
      data,
      include: {
        components: true,
        bomItems: true,
      },
    });
  }

  async delete(id: string) {
    return prisma.benchmark.delete({ where: { id } });
  }

  async compare(benchmarkIds: string[]) {
    const benchmarks = await prisma.benchmark.findMany({
      where: { id: { in: benchmarkIds } },
      include: {
        components: true,
        bomItems: true,
      },
    });

    // Generate comparative analysis
    const comparison = {
      products: benchmarks.map(b => ({
        id: b.id,
        name: b.productName,
        manufacturer: b.manufacturer,
        cost: b.estimatedCost,
        weight: b.weight,
        qualityScore: b.qualityScore,
        performanceScore: b.performanceScore,
      })),
      analysis: {
        costLeader: benchmarks.reduce((min, b) => (!min || b.estimatedCost < min.estimatedCost) ? b : min, null as any),
        weightLeader: benchmarks.reduce((min, b) => (!min || b.weight < min.weight) ? b : min, null as any),
        qualityLeader: benchmarks.reduce((max, b) => (!max || b.qualityScore > max.qualityScore) ? b : max, null as any),
        averageCost: benchmarks.reduce((sum, b) => sum + (Number(b.estimatedCost) || 0), 0) / benchmarks.length,
        averageWeight: benchmarks.reduce((sum, b) => sum + (Number(b.weight) || 0), 0) / benchmarks.length,
      },
      recommendations: this.generateRecommendations(benchmarks),
    };

    return comparison;
  }

  private generateRecommendations(benchmarks: any[]) {
    const recommendations = [];
    
    // Cost optimization
    const costs = benchmarks.map(b => Number(b.estimatedCost)).filter(c => c > 0);
    if (costs.length > 1) {
      const minCost = Math.min(...costs);
      const maxCost = Math.max(...costs);
      if ((maxCost - minCost) / minCost > 0.2) {
        recommendations.push(`Significant cost variation detected (${((maxCost - minCost) / minCost * 100).toFixed(1)}%). Consider cost reduction strategies from lowest cost competitor.`);
      }
    }

    // Weight optimization
    const weights = benchmarks.map(b => Number(b.weight)).filter(w => w > 0);
    if (weights.length > 1) {
      const weightDiff = Math.max(...weights) - Math.min(...weights);
      if (weightDiff > 0.5) {
        recommendations.push(`Weight variation of ${weightDiff.toFixed(2)}kg suggests lightweighting opportunities.`);
      }
    }

    return recommendations;
  }
}