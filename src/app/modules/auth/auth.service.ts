import httpStatus from 'http-status';
import { JwtPayload, Secret } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import User from '../user/user.model';
import {
  IChangePassword,
  ILoginUser,
  ILoginUserResponse,
  IRefreshTokenResponse,
} from './auth.interface';
import config from '../../../config';
import { jwtHelpers } from '../../../helpers/jwtHelpers';

const loginUser = async (payload: ILoginUser): Promise<ILoginUserResponse> => {
  const { id, password } = payload;

  /*---        instance method ->first create instance -> then access         ---*/
  //   const user = new User();
  //   const isUserExist = user.isUserExist(id);

  const isUserExist = await User.isUserExist(id);

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist.");
  }
  if (!(await User.isPasswordMatch(password, isUserExist.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password is incorrect.');
  }

  const { id: userId, needsPasswordChange, role } = isUserExist;
  //   create access token and refresh token (need to read blog in geeks for geeks)

  const accessToken = jwtHelpers.createToken(
    { id: userId, role },
    config.jwt.secret as Secret,
    config.jwt.expire_in as string
  );

  const refreshToken = jwtHelpers.createToken(
    { id: isUserExist?.id, role: isUserExist?.role },
    config.jwt.refresh_secret as Secret,
    config.jwt.refresh_expire_in as string
  );

  return {
    accessToken,
    refreshToken,
    needsPasswordChange,
  };
};

const refreshToken = async (
  refreshToken: string
): Promise<IRefreshTokenResponse> => {
  let verifiedToken;

  try {
    verifiedToken = jwtHelpers.verifyToken(
      refreshToken,
      config.jwt.refresh_secret as Secret
    );
  } catch (error) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Invalid refresh token!!!');
  }

  const isUserExist = await User.isUserExist(verifiedToken.id);
  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, "User doesn't exist!!!");
  }

  // generate access token
  const newAccessToken = jwtHelpers.createToken(
    { id: isUserExist, role: isUserExist },
    config.jwt.secret as Secret,
    config.jwt.expire_in as string
  );

  return {
    accessToken: newAccessToken,
  };
};

const changePassword = async (
  user: JwtPayload | null,
  payload: IChangePassword
): Promise<void> => {
  const { oldPassword, newPassword } = payload;
  // checking user
  // const isUserExist = await User.isUserExist(user?.id);

  //alternative way, here .select('+password') used because in model password select:0 and find can't give select:0 data
  const isUserExist = await User.findOne({ id: user?.id }).select('+password');

  if (!isUserExist) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User is not exist');
  }

  // password matching
  const isPasswordMatch = await User.isPasswordMatch(
    oldPassword,
    isUserExist.password
  );

  if (!isPasswordMatch) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Old password is incorrect.');
  }
  /* 
   hashed password
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  
  const updatedData = {
    password: hashedPassword,
    needsPasswordChange: false,
    passwordChangedAt: new Date(),
  };
  
  await User.findOneAndUpdate({ id: user?.id }, updatedData);
  */

  // data update
  isUserExist.password = newPassword;
  isUserExist.needsPasswordChange = false;

  // alternative way because mongoose pre hook is not working in update. It is only work in save and create; updating using save()
  isUserExist.save();
};

export const AuthService = {
  loginUser,
  refreshToken,
  changePassword,
};
