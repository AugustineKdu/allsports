import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';
import { completeMissionInTransaction } from '@/lib/missionUtils';

export async function POST(request: NextRequest) {
  try {
    const { email, password, username, contact, city, district, sport } = await request.json();

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 사용중인 이메일입니다' },
        { status: 400 }
      );
    }

    // 사용자 생성 및 회원가입 보상 (스포츠 선택 미션)
    const hashedPassword = await hashPassword(password);
    const user = await prisma.$transaction(async (tx: any) => {
      // 사용자 생성
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          username,
          contact: contact || null,
          city,
          district,
          currentSport: sport || '축구'
        }
      });

      // 회원가입 보상: 스포츠 선택 미션 완료 (+300 Prism)
      await completeMissionInTransaction(tx, newUser.id, 'SPORT_SELECT');

      return newUser;
    });

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        currentSport: user.currentSport,
        prismBalance: 300  // 회원가입 보상
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: '회원가입 처리 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}