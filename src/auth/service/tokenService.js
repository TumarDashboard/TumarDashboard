import { SignJWT, jwtVerify } from 'jose';
import { v4 } from "uuid";
import mongoTokenModel from "../../mongo/models/mongoTokenModel";

export async function generateTokens(payload) {

    const accessToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(v4())
        .setIssuedAt()
        .setExpirationTime(process.env.NEXT_PRIVATE_JWT_ACCESS_EXPIRES_IN)
        .sign(new TextEncoder().encode(process.env.NEXT_PRIVATE_JWT_ACCESS_SECRET));

    const refreshToken = await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setJti(v4())
        .setIssuedAt()
        .setExpirationTime(process.env.NEXT_PRIVATE_JWT_REFRESH_EXPIRES_IN)
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

    return await mongoTokenModel.deleteOne({ refreshToken: refreshToken });

}

export async function findToken(refreshToken) {

    return await mongoTokenModel.findOne({ refreshToken: refreshToken });

}