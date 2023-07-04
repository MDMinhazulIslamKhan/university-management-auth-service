import httpStatus from 'http-status';
import { Secret } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import User from '../user/user.model';
import {
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

  const isUserExist = User.isUserExist(verifiedToken.id);
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

export const AuthService = {
  loginUser,
  refreshToken,
};
