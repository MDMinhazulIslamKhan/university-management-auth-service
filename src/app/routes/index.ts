import express from 'express';
import { UserRouters } from '../modules/user/user.route';
import { AcademicSemesterRouters } from '../modules/academicSemester/academicSemester.route';
import { AcademicFacultyRouters } from '../modules/academicFaculty/academicFaculty.route';

const router = express.Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRouters,
  },
  {
    path: '/academic-semesters',
    route: AcademicSemesterRouters,
  },
  {
    path: '/academic-faculty',
    route: AcademicFacultyRouters,
  },
];

moduleRoutes.forEach(route => router.use(route.path, route.route));

export default router;
