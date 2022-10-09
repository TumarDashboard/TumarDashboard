import { SignJWT, jwtVerify } from 'jose';
import { v4 } from "uuid";
import mongoTokenModel from "../mongo/models/mongoTokenModel";

export async function generateAccessToken(payload) {

    payload.uiAvatarsSrc='';

    const accessToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(v4())
        .setIssuedAt()
        .setExpirationTime(process.env.NEXT_PUBLIC_JWT_ACCESS_EXPIRES_IN)
        .sign(new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET));

    return accessToken

}

export async function generateTokens(payload) {

    payload.uiAvatarsSrc='';

    const accessToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(v4())
        .setIssuedAt()
        .setExpirationTime(process.env.NEXT_PUBLIC_JWT_ACCESS_EXPIRES_IN)
        .sign(new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET));

    const refreshToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(v4())
        .setIssuedAt()
        .setExpirationTime(process.env.NEXT_PUBLIC_JWT_REFRESH_EXPIRES_IN)
        .sign(new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET));

    return {
        accessToken,
        refreshToken
    }

}

export async function validateAccessToken(token) {
    try {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET)
        )
        return verified.payload;
    } catch (error) {
        return null;
    }
}

export async function validateRefreshToken(token) {
    try {
        const verified = await jwtVerify(
            token,
            new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_REFRESH_SECRET)
        )
        return verified.payload;
    } catch (error) {
        return null;
    }
}

export async function saveToken(userId, refreshToken) {

    const tokenData = await mongoTokenModel.findOne({ user: userId });

    if (tokenData) {
        tokenData.refreshToken = refreshToken;
        return tokenData.save();
    }

    const token = await mongoTokenModel.create({
        user: userId,
        refreshToken: refreshToken
    })

    return token;

}

export async function removeToken(refreshToken) {

    return await mongoTokenModel.deleteOne({ refreshToken: refreshToken }).lean();

}

export async function removeTokenByID(userId) {

    return await mongoTokenModel.deleteOne({ user: userId }).lean();

}

export async function findTokenByUserID(userId) {

    return await mongoTokenModel.findOne({ user: userId }).lean();

}

export async function findToken(refreshToken) {

    return await mongoTokenModel.findOne({ refreshToken: refreshToken }).lean();

}