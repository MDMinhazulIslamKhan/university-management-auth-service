/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { SortOrder } from 'mongoose';
import ApiError from '../../../errors/ApiError';
import { IStudent, IStudentFilters } from '../student/student.interface';
import { Student } from '../student/student.model';
import httpStatus from 'http-status';
import {
  IGenericResponse,
  IPaginationOptions,
} from '../../../interfaces/common';
import { calculatePagination } from '../../../helpers/paginationHelper';
import { studentSearchableFields } from './student.constant';
import AcademicSemester from '../academicSemester/academicSemester.model';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import AcademicFaculty from '../academicFaculty/academicFaculty.model';
import User from '../user/user.model';

const getAllStudents = async (
  filters: IStudentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IStudent[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: studentSearchableFields.map(field => ({
        [field]: {
          $regex: searchTerm,
          $paginationOptions: 'i',
        },
      })),
    });
  }

  if (Object.keys(filtersData).length) {
    andConditions.push({
      $and: Object.entries(filtersData).map(([field, value]) => ({
        [field]: value,
      })),
    });
  }

  const sortConditions: { [key: string]: SortOrder } = {};

  if (sortBy && sortOrder) {
    sortConditions[sortBy] = sortOrder;
  }
  const whereConditions =
    andConditions.length > 0 ? { $and: andConditions } : {};

  const result = await Student.find(whereConditions)
    .populate(['academicFaculty', 'academicDepartment', 'academicSemester'])
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await Student.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const getSingleStudent = async (id: string): Promise<IStudent | null> => {
  const result = await Student.findById(id).populate([
    'academicFaculty',
    'academicDepartment',
    'academicSemester',
  ]);
  return result;
};

const updateStudent = async (
  id: string,
  payload: Partial<IStudent>
): Promise<IStudent | null> => {
  const isExist = await Student.findOne({ id });
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Invalid student id.');
  }
  // checking valid academic info
  if (payload.academicSemester) {
    const academicSemester = await AcademicSemester.findById(
      payload.academicSemester
    );
    if (!academicSemester) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid academic semester.');
    }
  }
  if (payload.academicDepartment) {
    const academicDepartment = await AcademicDepartment.findById(
      payload.academicDepartment
    );
    if (!academicDepartment) {
      throw new ApiError(
        httpStatus.BAD_REQUEST,
        'Invalid academic department.'
      );
    }
  }
  if (payload.academicFaculty) {
    const academicFaculty = await AcademicFaculty.findById(
      payload.academicFaculty
    );
    if (!academicFaculty) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid academic faculty.');
    }
  }

  const { name, guardian, localGuardian, ...studentData } = payload;
  const updateStudentData: Partial<IStudent> = { ...studentData };

  if (name && Object.keys(name).length > 0) {
    Object.keys(name).forEach(key => {
      const nameKey = `name.${key}`;
      (updateStudentData as any)[nameKey] = name[key as keyof typeof name];
    });
  }

  if (guardian && Object.keys(guardian).length > 0) {
    Object.keys(guardian).forEach(key => {
      const guardianKey = `guardian.${key}`;
      (updateStudentData as any)[guardianKey] =
        guardian[key as keyof typeof guardian];
    });
  }

  if (localGuardian && Object.keys(localGuardian).length > 0) {
    Object.keys(localGuardian).forEach(key => {
      const localGuardianKey = `localGuardian.${key}`;
      (updateStudentData as any)[localGuardianKey] =
        localGuardian[key as keyof typeof localGuardian];
    });
  }
  const result = await Student.findOneAndUpdate({ id }, updateStudentData, {
    new: true,
  }).populate(['academicFaculty', 'academicDepartment', 'academicSemester']);
  return result;
};

const deleteStudent = async (id: string): Promise<IStudent | null> => {
  const isExist = await Student.findOne({ id });

  if (!isExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Student not found !');
  }

  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    //delete student first
    const student = await Student.findOneAndDelete({ id }, { session });
    if (!student) {
      throw new ApiError(404, 'Failed to delete student');
    }

    //delete user
    await User.deleteOne({ id });
    session.commitTransaction();
    session.endSession();

    return student;
  } catch (error) {
    session.abortTransaction();
    throw error;
  }
};

export const StudentService = {
  getAllStudents,
  getSingleStudent,
  deleteStudent,
  updateStudent,
};
