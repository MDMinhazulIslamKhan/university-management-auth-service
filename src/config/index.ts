import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  env: process.env.NODE_ENV,
  port: process.env.PORT,
  database_url: process.env.DATABASE_URL,
  user_student_pass: process.env.DEFAULT_STUDENT_PASSWORD,
  user_faculty_pass: process.env.DEFAULT_FACULTY_PASSWORD,
  user_admin_pass: process.env.DEFAULT_ADMIN_PASSWORD,
  bcrypt_salt_rounds: process.env.BCRYPT_SALT_ROUNDS,
  jwt: {
    secret: process.env.JWT_SECRET,
    expire_in: process.env.JWT_EXPIRES_IN,
    refresh_secret: process.env.JWT_REFRESH_SECRET,
    refresh_expire_in: process.env.JWT_REFRESH_EXPIRES_IN,
  },
};
