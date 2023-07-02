import mongoose from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import AcademicSemester from '../academicSemester/academicSemester.model';
import { IStudent } from '../student/student.interface';
import { IUser } from './user.interface';
import User from './user.model';
import {
  generateAdminId,
  generateFacultyId,
  generateStudentId,
} from './user.utils';
import { Student } from '../student/student.model';
import httpStatus from 'http-status';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import AcademicFaculty from '../academicFaculty/academicFaculty.model';
import { IFaculty } from '../faculty/faculty.interface';
import { Faculty } from '../faculty/faculty.model';
import { IAdmin } from '../admin/admin.interface';
import { Admin } from '../admin/admin.model';
import { ManagementDepartment } from '../managementDepartment/managementDepartment.model';

const createStudent = async (
  student: IStudent,
  user: IUser
): Promise<IUser | null> => {
  if (!user.password) {
    user.password = config.user_student_pass as string;
  }

  // set role
  user.role = 'student';

  const academicSemester = await AcademicSemester.findById(
    student.academicSemester
  );
  const academicDepartment = await AcademicDepartment.findById(
    student.academicDepartment
  );
  const academicFaculty = await AcademicFaculty.findById(
    student.academicFaculty
  );
  if (!academicDepartment || !academicFaculty || !academicSemester) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid academic data.');
  }

  let newUserAllData;
  // for transaction and role back, we user session. If all section work's, then database will update neither will not update.
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // generateStudentId
    const id = await generateStudentId(academicSemester);
    user.id = id;
    student.id = id;

    // newStudent is an array, because we used session
    const newStudent = await Student.create([student], { session });

    if (!newStudent.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create student.');
    }

    // set student._id into user
    user.admin = newStudent[0]._id;

    const newUser = await User.create([user], { session });
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create user.');
    }

    newUserAllData = newUser[0];

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  if (newUserAllData) {
    newUserAllData = await User.findOne({ id: newUserAllData.id }).populate({
      path: 'student',
      populate: [
        {
          path: 'academicSemester',
        },
        {
          path: 'academicDepartment',
        },
        {
          path: 'academicFaculty',
        },
      ],
    });
  }

  return newUserAllData;
};

const createFaculty = async (
  faculty: IFaculty,
  user: IUser
): Promise<IUser | null> => {
  if (!user.password) {
    user.password = config.user_faculty_pass as string;
  }

  // set role
  user.role = 'faculty';

  const academicDepartment = await AcademicDepartment.findById(
    faculty.academicDepartment
  );
  const academicFaculty = await AcademicFaculty.findById(
    faculty.academicFaculty
  );
  if (!academicDepartment || !academicFaculty) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid academic data.');
  }

  let newFacultyAllData;
  // for transaction and role back, we user session. If all section work's, then database will update neither will not update.
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // generateStudentId
    const id = await generateFacultyId();
    user.id = id;
    faculty.id = id;

    // newStudent is an array, because we used session
    const newFaculty = await Faculty.create([faculty], { session });

    if (!newFaculty.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create faculty.');
    }

    // set faculty._id into user
    user.faculty = newFaculty[0]._id;

    const newUser = await User.create([user], { session });
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create user.');
    }

    newFacultyAllData = newUser[0];

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  if (newFacultyAllData) {
    newFacultyAllData = await User.findOne({
      id: newFacultyAllData.id,
    }).populate({
      path: 'faculty',
      populate: [
        {
          path: 'academicDepartment',
        },
        {
          path: 'academicFaculty',
        },
      ],
    });
  }

  return newFacultyAllData;
};

const createAdmin = async (
  admin: IAdmin,
  user: IUser
): Promise<IUser | null> => {
  if (!user.password) {
    user.password = config.user_student_pass as string;
  }

  // set role
  user.role = 'admin';

  const academicManagementDepartment = await ManagementDepartment.findById(
    admin.managementDepartment
  );

  if (!academicManagementDepartment) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid academic data.');
  }

  let newAdminAllData;
  // for transaction and role back, we user session. If all section work's, then database will update neither will not update.
  const session = await mongoose.startSession();
  try {
    session.startTransaction();
    // generateStudentId
    const id = await generateAdminId();
    user.id = id;
    admin.id = id;

    // newStudent is an array, because we used session
    const newAdmin = await Admin.create([admin], { session });

    if (!newAdmin.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create admin.');
    }

    // set student._id into user
    user.admin = newAdmin[0]._id;

    const newUser = await User.create([user], { session });
    if (!newUser.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Failed to create user.');
    }

    newAdminAllData = newUser[0];

    await session.commitTransaction();
    await session.endSession();
  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    throw error;
  }

  if (newAdminAllData) {
    newAdminAllData = await User.findOne({ id: newAdminAllData.id }).populate({
      path: 'admin',
      populate: [
        {
          path: 'managementDepartment',
        },
      ],
    });
  }

  return newAdminAllData;
};

export const UserService = {
  createStudent,
  createFaculty,
  createAdmin,
};
