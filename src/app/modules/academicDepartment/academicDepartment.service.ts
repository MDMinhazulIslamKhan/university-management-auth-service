import { SortOrder } from 'mongoose';
import {
  IGenericResponse,
  IPaginationOptions,
} from '../../../interfaces/common';
import { academicDepartmentSearchableFields } from './academicDepartment.constants';
import {
  IAcademicDepartment,
  IAcademicDepartmentFilters,
} from './academicDepartment.interfaces';
import { AcademicDepartment } from './academicDepartment.model';
import { calculatePagination } from '../../../helpers/paginationHelper';
import AcademicFaculty from '../academicFaculty/academicFaculty.model';
import ApiError from '../../../errors/ApiError';
import httpStatus from 'http-status';

const getAllDepartments = async (
  filters: IAcademicDepartmentFilters,
  paginationOptions: IPaginationOptions
): Promise<IGenericResponse<IAcademicDepartment[]>> => {
  const { limit, page, skip, sortBy, sortOrder } =
    calculatePagination(paginationOptions);

  const { searchTerm, ...filtersData } = filters;

  const andConditions = [];

  if (searchTerm) {
    andConditions.push({
      $or: academicDepartmentSearchableFields.map(field => ({
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

  const result = await AcademicDepartment.find(whereConditions)
    .populate('academicFaculty')
    .sort(sortConditions)
    .skip(skip)
    .limit(limit);

  const total = await AcademicDepartment.countDocuments(whereConditions);

  return {
    meta: {
      page,
      limit,
      total,
    },
    data: result,
  };
};

const createDepartment = async (
  payload: IAcademicDepartment
): Promise<IAcademicDepartment | null> => {
  // check academicFaculty
  const isAcademicFaculty = await AcademicFaculty.findById(
    payload.academicFaculty
  );
  if (!isAcademicFaculty) {
    throw new ApiError(
      httpStatus.CONFLICT,
      'No AcademicFaculty with this id!!!'
    );
  }
  const result = (await AcademicDepartment.create(payload)).populate(
    'academicFaculty'
  );
  return result;
};

const getSingleDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  const result = await AcademicDepartment.findById(id).populate(
    'academicFaculty'
  );
  return result;
};

const updateDepartment = async (
  id: string,
  payload: Partial<IAcademicDepartment>
): Promise<IAcademicDepartment | null> => {
  if (payload.academicFaculty) {
    const isAcademicFaculty = await AcademicFaculty.findById(
      payload.academicFaculty
    );
    if (!isAcademicFaculty) {
      throw new ApiError(
        httpStatus.CONFLICT,
        'No AcademicFaculty with this id!!!'
      );
    }
  }
  const result = await AcademicDepartment.findOneAndUpdate(
    { _id: id },
    payload,
    {
      new: true,
    }
  ).populate('academicFaculty');
  return result;
};

const deleteDepartment = async (
  id: string
): Promise<IAcademicDepartment | null> => {
  const result = await AcademicDepartment.findByIdAndDelete(id);
  return result;
};

export const AcademicDepartmentService = {
  getAllDepartments,
  getSingleDepartment,
  updateDepartment,
  deleteDepartment,
  createDepartment,
};
