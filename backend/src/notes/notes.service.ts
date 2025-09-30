import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CacheService } from '../cache/cache.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { Note } from '@prisma/client';

export interface PaginatedNotes {
  notes: Note[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class NotesService {
  constructor(
    private prisma: PrismaService,
    private cacheService: CacheService,
  ) {}

  async create(userId: string, createNoteDto: CreateNoteDto): Promise<Note> {
    const { title, content, tags } = createNoteDto;

    const note = await this.prisma.note.create({
      data: {
        title,
        content,
        tags: tags || [],
        userId,
      },
    });

    // Invalidate user's notes cache
    await this.cacheService.invalidateUserNotesCache(userId);

    return note;
  }

  async findAll(userId: string, queryDto: QueryNotesDto): Promise<PaginatedNotes> {
    const { search, tags, page = 1, limit = 10 } = queryDto;
    
    // Generate cache key for this search
    const cacheKey = this.cacheService.generateNotesSearchKey(userId, search, tags, page, limit);
    
    // Try to get from cache first
    const cachedResult = await this.cacheService.get<PaginatedNotes>(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }

    const skip = (page - 1) * limit;

    const where: any = {
      userId,
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tags && tags.length > 0) {
      where.tags = {
        hasEvery: tags,
      };
    }

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.note.count({ where }),
    ]);

    const result = {
      notes,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };

    // Cache the result for 5 minutes
    await this.cacheService.set(cacheKey, result, 300);

    return result;
  }

  async findOne(id: string, userId: string): Promise<Note> {
    const note = await this.prisma.note.findUnique({
      where: { id },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return note;
  }

  async update(id: string, userId: string, updateNoteDto: UpdateNoteDto): Promise<Note> {
    await this.findOne(id, userId); // Check if note exists and user has access

    const note = await this.prisma.note.update({
      where: { id },
      data: updateNoteDto,
    });

    // Invalidate user's notes cache
    await this.cacheService.invalidateUserNotesCache(userId);

    return note;
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOne(id, userId); // Check if note exists and user has access

    await this.prisma.note.delete({
      where: { id },
    });

    // Invalidate user's notes cache
    await this.cacheService.invalidateUserNotesCache(userId);
  }

  async getAllTags(userId: string): Promise<string[]> {
    const notes = await this.prisma.note.findMany({
      where: { userId },
      select: { tags: true },
    });

    const allTags = notes.flatMap(note => note.tags);
    return [...new Set(allTags)].sort();
  }
}