import { normalizeTeamName } from '@/lib/utils';

describe('normalizeTeamName', () => {
  it('should normalize team names correctly', () => {
    expect(normalizeTeamName('FC 강남')).toBe('fc강남');
    expect(normalizeTeamName('송파 유나이티드')).toBe('송파유나이티드');
    expect(normalizeTeamName('  강동   드래곤즈  ')).toBe('강동드래곤즈');
  });

  it('should handle Korean characters', () => {
    expect(normalizeTeamName('한국축구팀')).toBe('한국축구팀');
    expect(normalizeTeamName('서울 FC')).toBe('서울fc');
  });

  it('should handle mixed case', () => {
    expect(normalizeTeamName('Seoul FC')).toBe('seoulfc');
    expect(normalizeTeamName('Gangnam United')).toBe('gangnamunited');
  });

  it('should remove extra whitespace', () => {
    expect(normalizeTeamName('   팀   이름   ')).toBe('팀이름');
    expect(normalizeTeamName('팀\t이름\n')).toBe('팀이름');
  });

  it('should handle empty strings', () => {
    expect(normalizeTeamName('')).toBe('');
    expect(normalizeTeamName('   ')).toBe('');
  });

  it('should handle special characters', () => {
    expect(normalizeTeamName('팀-이름')).toBe('팀이름');
    expect(normalizeTeamName('팀_이름')).toBe('팀_이름'); // underscore는 \w에 포함되어 유지됨
    expect(normalizeTeamName('팀.이름')).toBe('팀이름');
  });
});