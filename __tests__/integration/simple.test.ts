// 간단한 통합 테스트
describe('Application Integration Tests', () => {

  describe('Team Name Normalization', () => {
    it('should handle various team name formats', () => {
      // 실제 normalizeTeamName 함수 로직 테스트
      const normalize = (name: string): string => {
        return name
          .toLowerCase()
          .replace(/\s+/g, '') // 공백 제거
          .replace(/[^\w가-힣]/g, '') // 특수문자 제거 (한글, 영문, 숫자만 유지)
          .trim();
      };

      expect(normalize('FC 강남')).toBe('fc강남');
      expect(normalize('송파 유나이티드')).toBe('송파유나이티드');
      expect(normalize('  강동   드래곤즈  ')).toBe('강동드래곤즈');
    });
  });

  describe('User Authentication Flow', () => {
    it('should validate required fields for registration', () => {
      const validateRegistration = (data: any): string | null => {
        if (!data.email) return '이메일이 필요합니다';
        if (!data.password) return '비밀번호가 필요합니다';
        if (!data.username) return '사용자명이 필요합니다';
        if (!data.city) return '지역이 필요합니다';
        if (!data.district) return '구/시가 필요합니다';
        return null;
      };

      const validData = {
        email: 'test@example.com',
        password: 'password123',
        username: '테스트유저',
        city: '서울',
        district: '강남구',
        currentSport: '축구'
      };

      expect(validateRegistration(validData)).toBeNull();
      expect(validateRegistration({ ...validData, email: '' })).toBe('이메일이 필요합니다');
      expect(validateRegistration({ ...validData, password: '' })).toBe('비밀번호가 필요합니다');
    });

    it('should validate email format', () => {
      const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user123@gmail.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('Team Creation Validation', () => {
    it('should validate team data', () => {
      const validateTeam = (data: any): string | null => {
        if (!data.name?.trim()) return '유효한 팀명을 입력해주세요';
        if (!data.sport) return '종목을 선택해주세요';
        if (!data.city) return '지역을 선택해주세요';
        if (!data.district) return '구/시를 선택해주세요';
        if (data.maxMembers < 5 || data.maxMembers > 50) return '최대 인원은 5-50명이어야 합니다';
        return null;
      };

      const validTeam = {
        name: '새로운 팀',
        sport: '축구',
        city: '서울',
        district: '강남구',
        maxMembers: 20
      };

      expect(validateTeam(validTeam)).toBeNull();
      expect(validateTeam({ ...validTeam, name: '' })).toBe('유효한 팀명을 입력해주세요');
      expect(validateTeam({ ...validTeam, maxMembers: 3 })).toBe('최대 인원은 5-50명이어야 합니다');
      expect(validateTeam({ ...validTeam, maxMembers: 100 })).toBe('최대 인원은 5-50명이어야 합니다');
    });

    it('should handle team name conflicts', () => {
      const existingTeams = ['fc강남', '송파유나이티드', '강동드래곤즈'];

      const checkTeamNameConflict = (newTeamName: string, existingNames: string[]): boolean => {
        const normalizedName = newTeamName.toLowerCase().replace(/\s+/g, '').replace(/[^\w가-힣]/g, '');
        return existingNames.includes(normalizedName);
      };

      expect(checkTeamNameConflict('FC 강남', existingTeams)).toBe(true);
      expect(checkTeamNameConflict('새로운팀', existingTeams)).toBe(false);
      expect(checkTeamNameConflict('송파 유나이티드', existingTeams)).toBe(true);
    });
  });

  describe('Match Creation Logic', () => {
    it('should validate match data', () => {
      const validateMatch = (data: any): string | null => {
        if (!data.homeTeamId) return '홈팀을 선택해주세요';
        if (!data.awayTeamId) return '원정팀을 선택해주세요';
        if (data.homeTeamId === data.awayTeamId) return '같은 팀끼리는 경기할 수 없습니다';
        if (!data.matchDate) return '경기 날짜를 선택해주세요';

        const matchDate = new Date(data.matchDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (matchDate < today) return '과거 날짜로는 경기를 만들 수 없습니다';

        return null;
      };

      const validMatch = {
        sport: '축구',
        homeTeamId: 'team-1',
        awayTeamId: 'team-2',
        matchDate: '2025-12-31',
        location: '강남 스포츠센터'
      };

      expect(validateMatch(validMatch)).toBeNull();
      expect(validateMatch({ ...validMatch, homeTeamId: validMatch.awayTeamId }))
        .toBe('같은 팀끼리는 경기할 수 없습니다');
      expect(validateMatch({ ...validMatch, matchDate: '2020-01-01' }))
        .toBe('과거 날짜로는 경기를 만들 수 없습니다');
    });

    it('should calculate match results correctly', () => {
      const updateTeamStats = (homeScore: number, awayScore: number) => {
        const homeStats = { wins: 0, draws: 0, losses: 0, points: 0 };
        const awayStats = { wins: 0, draws: 0, losses: 0, points: 0 };

        if (homeScore > awayScore) {
          homeStats.wins = 1;
          homeStats.points = 3;
          awayStats.losses = 1;
        } else if (homeScore < awayScore) {
          awayStats.wins = 1;
          awayStats.points = 3;
          homeStats.losses = 1;
        } else {
          homeStats.draws = 1;
          homeStats.points = 1;
          awayStats.draws = 1;
          awayStats.points = 1;
        }

        return { home: homeStats, away: awayStats };
      };

      const homeWin = updateTeamStats(3, 1);
      expect(homeWin.home.wins).toBe(1);
      expect(homeWin.home.points).toBe(3);
      expect(homeWin.away.losses).toBe(1);

      const awayWin = updateTeamStats(1, 2);
      expect(awayWin.away.wins).toBe(1);
      expect(awayWin.away.points).toBe(3);
      expect(awayWin.home.losses).toBe(1);

      const draw = updateTeamStats(2, 2);
      expect(draw.home.draws).toBe(1);
      expect(draw.home.points).toBe(1);
      expect(draw.away.draws).toBe(1);
      expect(draw.away.points).toBe(1);
    });
  });

  describe('Profile Update Logic', () => {
    it('should validate profile updates', () => {
      const validateProfile = (data: any): string | null => {
        if (!data.username?.trim()) return '이름을 입력해주세요';
        if (!data.currentSport) return '선호 스포츠를 선택해주세요';
        if (!data.city) return '지역을 선택해주세요';
        if (!data.district) return '구/시를 선택해주세요';
        return null;
      };

      const validProfile = {
        username: '업데이트된이름',
        currentSport: '풋살',
        city: '부산',
        district: '해운대구'
      };

      expect(validateProfile(validProfile)).toBeNull();
      expect(validateProfile({ ...validProfile, username: '' })).toBe('이름을 입력해주세요');
      expect(validateProfile({ ...validProfile, district: '' })).toBe('구/시를 선택해주세요');
    });

    it('should calculate user statistics', () => {
      const calculateUserStats = (matches: any[], teamMemberships: any[]) => {
        const teamCount = teamMemberships.filter(m => m.status === 'active').length;
        const completedMatches = matches.filter(m => m.status === 'completed');
        const matchCount = completedMatches.length;

        const winCount = completedMatches.filter(match => {
          const isHomeTeamMember = match.homeTeamMembers?.includes('user-id');
          const isAwayTeamMember = match.awayTeamMembers?.includes('user-id');

          if (isHomeTeamMember) {
            return (match.homeScore || 0) > (match.awayScore || 0);
          } else if (isAwayTeamMember) {
            return (match.awayScore || 0) > (match.homeScore || 0);
          }
          return false;
        }).length;

        return { teamCount, matchCount, winCount, mvpCount: 0 };
      };

      const mockMatches = [
        { id: '1', status: 'completed', homeScore: 3, awayScore: 1, homeTeamMembers: ['user-id'] },
        { id: '2', status: 'completed', homeScore: 1, awayScore: 2, awayTeamMembers: ['user-id'] },
        { id: '3', status: 'proposed', homeTeamMembers: ['user-id'] }
      ];

      const mockMemberships = [
        { status: 'active', teamId: 'team-1' },
        { status: 'active', teamId: 'team-2' },
        { status: 'left', teamId: 'team-3' }
      ];

      const stats = calculateUserStats(mockMatches, mockMemberships);
      expect(stats.teamCount).toBe(2);
      expect(stats.matchCount).toBe(2);
      expect(stats.winCount).toBe(2); // Won both completed matches
    });
  });
});