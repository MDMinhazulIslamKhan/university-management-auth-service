import mongoose from 'mongoose';
import config from '../../../config';
import ApiError from '../../../errors/ApiError';
import AcademicSemester from '../academicSemester/academicSemester.model';
import { IStudent } from '../student/student.interface';
import { IUser } from './user.interface';
import User from './user.model';
import { generateStudentId } from './user.utils';
import { Student } from '../student/student.model';
import httpStatus from 'http-status';
import { AcademicDepartment } from '../academicDepartment/academicDepartment.model';
import AcademicFaculty from '../academicFaculty/academicFaculty.model';

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
    user.student = newStudent[0]._id;

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

export const UserService = {
  createStudent,
};
