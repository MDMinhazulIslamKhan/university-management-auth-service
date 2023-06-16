import { Model } from 'mongoose';
import { Code, Month, Title } from './academicSemester.constant';

export type IAcademicSemester = {
  title: Title;
  year: number;
  code: Code;
  startMonth: Month;
  endMonth: Month;
};

export type AcademicSemesterModel = Model<IAcademicSemester>;
