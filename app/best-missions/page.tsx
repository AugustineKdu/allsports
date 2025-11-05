'use client';

export default function BestMissionsPage() {
  const missions = [
    { title: '팀 경기 참가', reward: 1000, participants: 342, category: 'MATCH' },
    { title: '경기 인증', reward: 800, participants: 567, category: 'MATCH' },
    { title: '팀 등록/참여', reward: 500, participants: 892, category: 'TEAM' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">베스트 미션</h1>
        <p className="text-gray-600 mb-6">가장 인기있는 미션을 확인해보세요!</p>
        
        <div className="space-y-4">
          {missions.map((mission, idx) => (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{mission.title}</h3>
                  <p className="text-sm text-gray-500">{mission.participants}명 참여</p>
                </div>
                <span className="text-2xl font-bold text-blue-600">+{mission.reward}P</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
