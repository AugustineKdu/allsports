import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, generateToken } from '@/lib/auth';
import { completeMission } from '@/lib/missionUtils';

export async function POST(request: NextRequest) {
  try {
    console.log('Login attempt started');
    
    const body = await request.json();
    const { email, password } = body;
    
    console.log('Login attempt for email:', email);

    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    console.log('User found, checking password...');
    
    // 비밀번호 검증
    const isValid = await comparePassword(password, user.passwordHash);

    if (!isValid) {
      console.log('Invalid password for user:', email);
      return NextResponse.json(
        { error: '이메일 또는 비밀번호가 올바르지 않습니다' },
        { status: 401 }
      );
    }

    console.log('Password valid, generating token...');

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      isAdmin: user.isAdmin
    });

    // 로그인 시 미션 자동 완료 (백그라운드로 실행)
    // 출석체크 미션만 처리 (스포츠 선택은 회원가입 시 이미 완료됨)
    completeMission(user.id, 'DAILY_CHECK_IN').catch(err => {
      console.error('Failed to complete daily check-in mission:', err);
    });

    console.log('Login successful for:', email);

    return NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
        currentSport: user.currentSport,
        city: user.city,
        district: user.district
      }
    });
  } catch (error) {
    console.error('Login error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    
    return NextResponse.json(
      { 
        error: '로그인 처리 중 오류가 발생했습니다',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}