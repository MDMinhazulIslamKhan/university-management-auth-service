import express from 'express';
import usersController from './users.controller';

const route = express.Router();

route.post('/create-student', usersController.createUser);

export default route;
