import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new note' })
  @ApiResponse({ status: 201, description: 'Note successfully created' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  create(@Body() createNoteDto: CreateNoteDto, @Request() req) {
    return this.notesService.create(req.user.id, createNoteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notes with optional search and filtering' })
  @ApiResponse({ status: 200, description: 'Notes retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  findAll(@Query() queryDto: QueryNotesDto, @Request() req) {
    return this.notesService.findAll(req.user.id, queryDto);
  }

  @Get('tags')
  @ApiOperation({ summary: 'Get all unique tags for the user' })
  @ApiResponse({ status: 200, description: 'Tags retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTags(@Request() req) {
    return this.notesService.getAllTags(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific note by ID' })
  @ApiResponse({ status: 200, description: 'Note retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  findOne(@Param('id') id: string, @Request() req) {
    return this.notesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a note' })
  @ApiResponse({ status: 200, description: 'Note updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  update(@Param('id') id: string, @Body() updateNoteDto: UpdateNoteDto, @Request() req) {
    return this.notesService.update(id, req.user.id, updateNoteDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a note' })
  @ApiResponse({ status: 200, description: 'Note deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Note not found' })
  remove(@Param('id') id: string, @Request() req) {
    return this.notesService.remove(id, req.user.id);
  }
}