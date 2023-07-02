import { Request, Response, RequestHandler } from 'express';
import { StudentService } from './student.service';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import httpStatus from 'http-status';
import pick from '../../../shared/pick';
import { studentFilterableFields } from './student.constant';
import { paginationFields } from '../../../constant';
import { IStudent } from './student.interface';

const getAllStudents: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const filters = pick(req.query, studentFilterableFields);
    const paginationOptions = pick(req.query, paginationFields);

    const result = await StudentService.getAllStudents(
      filters,
      paginationOptions
    );
    sendResponse<IStudent[]>(res, {
      statusCode: httpStatus.OK,
      success: true,
      meta: result.meta,
      data: result.data,
      message: "All student's retrieved Successfully.",
    });
  }
);

const getSingleStudent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await StudentService.getSingleStudent(id);
    sendResponse<IStudent>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'Student retrieved Successfully.',
    });
  }
);

const updateStudent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const id = req.params.id;
    const updatedData = req.body;

    const result = await StudentService.updateStudent(id, updatedData);
    sendResponse<IStudent>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'Student updated Successfully.',
    });
  }
);

const deleteStudent: RequestHandler = catchAsync(
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await StudentService.deleteStudent(id);
    sendResponse<IStudent>(res, {
      statusCode: httpStatus.OK,
      success: true,
      data: result,
      message: 'Student delete Successfully.',
    });
  }
);

export const StudentController = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
  updateStudent,
};
