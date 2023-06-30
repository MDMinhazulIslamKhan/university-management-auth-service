import express from 'express';
import { AcademicFacultyController } from './academicFaculty.controller';
import validateRequest from '../../middleware/validateRequest';
import { AcademicFacultyValidation } from './academicFaculty.validation';

const router = express.Router();

router.post(
  '/create-faculty',
  validateRequest(AcademicFacultyValidation.createFacultyZodSchema),
  AcademicFacultyController.createFaculty
);

router.get('/:id', AcademicFacultyController.getSingleFaculty);

router.delete('/:id', AcademicFacultyController.deleteFaculty);

router.patch(
  '/:id',
  validateRequest(AcademicFacultyValidation.updateFacultyZodSchema),
  AcademicFacultyController.updateFaculty
);

router.get('/', AcademicFacultyController.getAllFaculties);

export const AcademicFacultyRouters = router;
