import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    const currentUser = await getUserFromToken(token);

    const match = await prisma.match.findUnique({
      where: {
        id: params.id
      },
      include: {
        homeTeam: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            sport: true,
            owner: {
              select: {
                id: true,
                username: true,
                contact: true
              }
            }
          }
        },
        awayTeam: {
          select: {
            id: true,
            name: true,
            city: true,
            district: true,
            sport: true,
            owner: {
              select: {
                id: true,
                username: true,
                contact: true
              }
            }
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            email: true,
            city: true,
            district: true,
            contact: true
          }
        }
      }
    });

    if (!match) {
      return NextResponse.json(
        { error: '경기를 찾을 수 없습니다' },
        { status: 404 }
      );
    }

    // 시합이 확정되지 않았거나 관련 없는 사용자라면 연락처 정보 숨김
    if ((match.status !== 'confirmed' && match.status !== 'completed') || !currentUser) {
      // 연락처 정보 제거
      if (match.homeTeam.owner) {
        match.homeTeam.owner.contact = null;
      }
      if (match.awayTeam.owner) {
        match.awayTeam.owner.contact = null;
      }
      match.creator.contact = null;
    } else {
      // 현재 사용자가 팀 오너인지 확인
      const isHomeTeamOwner = match.homeTeam.owner?.id === currentUser.id;
      const isAwayTeamOwner = match.awayTeam.owner?.id === currentUser.id;
      const isCreator = match.creator.id === currentUser.id;

      // 관련 없는 사용자라면 연락처 숨김
      if (!isHomeTeamOwner && !isAwayTeamOwner && !isCreator && !currentUser.isAdmin) {
        if (match.homeTeam.owner) {
          match.homeTeam.owner.contact = null;
        }
        if (match.awayTeam.owner) {
          match.awayTeam.owner.contact = null;
        }
        match.creator.contact = null;
      } else {
        // 자신의 팀 연락처는 숨김 (상대방 연락처만 노출)
        if (isHomeTeamOwner && match.homeTeam.owner) {
          match.homeTeam.owner.contact = null;
        }
        if (isAwayTeamOwner && match.awayTeam.owner) {
          match.awayTeam.owner.contact = null;
        }
      }
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error('Get match error:', error);
    return NextResponse.json(
      { error: '경기 정보를 불러오는데 실패했습니다' },
      { status: 500 }
    );
  }
}